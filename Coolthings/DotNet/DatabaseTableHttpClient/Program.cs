using System.Data.Common;
using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Data.SqlClient;
using Npgsql;

const string HelpFlag = "--help";
const string AgentInstructionsFlag = "--agent-instructions";
const string TestFlag = "--test";

var options = new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true,
    ReadCommentHandling = JsonCommentHandling.Skip,
    AllowTrailingCommas = true,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    WriteIndented = true
};

if (args.Length == 0)
{
    PrintMenu();
    return;
}

if (args[0].Equals(HelpFlag, StringComparison.OrdinalIgnoreCase))
{
    PrintHelp();
    return;
}

if (args[0].Equals(AgentInstructionsFlag, StringComparison.OrdinalIgnoreCase))
{
    PrintAgentInstructions();
    return;
}

string configPath = args[0];
string? testOutputPath = null;
if (args.Length == 3 && args[1].Equals(TestFlag, StringComparison.OrdinalIgnoreCase))
{
    testOutputPath = args[2];
}
else if (args.Length > 1)
{
    Console.Error.WriteLine("Invalid arguments.");
    PrintHelp();
    Environment.ExitCode = 1;
    return;
}

if (!File.Exists(configPath))
{
    Console.Error.WriteLine($"Config file not found: {configPath}");
    Environment.ExitCode = 1;
    return;
}

try
{
    var configText = await File.ReadAllTextAsync(configPath);
    var config = JsonSerializer.Deserialize<IntegrationConfig>(configText, options)
                 ?? throw new InvalidOperationException("Config could not be parsed.");

    config.Validate();

    var runtime = RuntimeDirectories.From(config.Directories);
    runtime.EnsureDirectories();

    var runLog = runtime.CreateFilePath(runtime.LogDirectory, "run", ".log");
    await AppendLineAsync(runLog, $"[{DateTimeOffset.UtcNow:O}] Start integration '{config.IntegrationName}'.");

    var rows = await LoadRowsAsync(config);
    if (rows.Count == 0)
    {
        await AppendLineAsync(runLog, $"[{DateTimeOffset.UtcNow:O}] Source query returned no rows.");
        Console.WriteLine("No rows found to process.");
        return;
    }

    GrainChecker.Validate(rows, config);

    var payload = PayloadBuilder.Build(config, rows);
    var payloadJson = JsonSerializer.Serialize(payload, options);
    var historyPath = runtime.CreateFilePath(runtime.HistoryDirectory, "history", ".json");
    await File.WriteAllTextAsync(historyPath, payloadJson);

    HttpSendResult sendResult;
    if (!string.IsNullOrWhiteSpace(testOutputPath))
    {
        var fullTestOutputPath = Path.GetFullPath(testOutputPath);
        var parent = Path.GetDirectoryName(fullTestOutputPath);
        if (!string.IsNullOrWhiteSpace(parent))
        {
            Directory.CreateDirectory(parent);
        }

        await File.WriteAllTextAsync(fullTestOutputPath, payloadJson);
        sendResult = new HttpSendResult("TEST_WRITTEN", 0, $"Payload written to {fullTestOutputPath}");
    }
    else
    {
        sendResult = await HttpDispatcher.SendAsync(config.Http, payloadJson);
    }

    var sentFilePath = runtime.CreateFilePath(runtime.SentDirectory, "sent", ".json");
    await File.WriteAllTextAsync(sentFilePath, payloadJson);

    await using var connection = OpenConnection(config.Database);
    await connection.OpenAsync();

    var tableName = TrackingTableName.Parse(config.Tracking.Table, config.Database.Provider);
    await TrackingStore.EnsureSchemaAsync(connection, config.Database.Provider, tableName);
    await TrackingStore.InsertRecordAsync(connection, config.Database.Provider, tableName, config.IntegrationName,
        sendResult.Status, sendResult.ResponseCode, payloadJson, sendResult.ResponseBody, null);

    await AppendLineAsync(runLog,
        $"[{DateTimeOffset.UtcNow:O}] Completed with status {sendResult.Status} and code {sendResult.ResponseCode}.");

    Console.WriteLine($"Completed: {sendResult.Status} ({sendResult.ResponseCode})");
}
catch (Exception ex)
{
    try
    {
        var fallbackDirectory = RuntimeDirectories.Fallback();
        fallbackDirectory.EnsureDirectories();
        var errorPath = fallbackDirectory.CreateFilePath(fallbackDirectory.ErrorDirectory, "error", ".log");
        await AppendLineAsync(errorPath, $"[{DateTimeOffset.UtcNow:O}] {ex}");
    }
    catch
    {
        // ignored so original error is still surfaced
    }

    Console.Error.WriteLine(ex.Message);
    Environment.ExitCode = 1;
}

static async Task<List<Dictionary<string, object?>>> LoadRowsAsync(IntegrationConfig config)
{
    await using var connection = OpenConnection(config.Database);
    await connection.OpenAsync();

    var columnNames = config.Mapping.HeaderFields
        .Select(f => f.Source)
        .Concat(config.Mapping.DetailFields.Select(f => f.Source))
        .Concat(config.GrainChecker.HeaderKeys)
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();

    var commandText = BuildSourceQuery(config.Database, columnNames);
    await using var command = connection.CreateCommand();
    command.CommandText = commandText;

    var rows = new List<Dictionary<string, object?>>(capacity: 256);

    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
        for (var i = 0; i < reader.FieldCount; i++)
        {
            row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
        }

        rows.Add(row);
    }

    return rows;
}

static string BuildSourceQuery(DatabaseConfig database, string[] columns)
{
    if (!string.IsNullOrWhiteSpace(database.SourceQuery))
    {
        return database.SourceQuery;
    }

    if (string.IsNullOrWhiteSpace(database.Table))
    {
        throw new InvalidOperationException("Database.table is required when database.sourceQuery is not provided.");
    }

    var table = TrackingTableName.Parse(database.Table, database.Provider);
    var projected = string.Join(", ", columns.Select(c => QuoteIdentifier(database.Provider, c)));
    return $"SELECT {projected} FROM {table.ToSqlIdentifier()}";
}

static DbConnection OpenConnection(DatabaseConfig database)
{
    return database.Provider.ToLowerInvariant() switch
    {
        "sqlserver" => new SqlConnection(database.ConnectionString),
        "postgresql" => new NpgsqlConnection(database.ConnectionString),
        _ => throw new InvalidOperationException("database.provider must be either 'sqlserver' or 'postgresql'.")
    };
}

static string QuoteIdentifier(string provider, string identifier)
{
    IdentifierGuard.Validate(identifier, "identifier");
    return provider.Equals("sqlserver", StringComparison.OrdinalIgnoreCase)
        ? $"[{identifier}]"
        : $"\"{identifier}\"";
}

static async Task AppendLineAsync(string filePath, string line)
{
    await File.AppendAllTextAsync(filePath, line + Environment.NewLine);
}

static void PrintMenu()
{
    Console.WriteLine("DatabaseTableHttpClient");
    Console.WriteLine("-----------------------");
    Console.WriteLine("Commands:");
    Console.WriteLine("  DatabaseTableHttpClient <config.json>");
    Console.WriteLine("  DatabaseTableHttpClient <config.json> --test <output.json>");
    Console.WriteLine("  DatabaseTableHttpClient --help");
    Console.WriteLine("  DatabaseTableHttpClient --agent-instructions");
}

static void PrintHelp()
{
    Console.WriteLine("Config-driven database table to HTTP client.");
    Console.WriteLine();
    Console.WriteLine("Usage:");
    Console.WriteLine("  DatabaseTableHttpClient <config.json>");
    Console.WriteLine("  DatabaseTableHttpClient <config.json> --test <output.json>");
    Console.WriteLine();
    Console.WriteLine("The app ensures a tracking table exists, builds JSON from configured mappings,");
    Console.WriteLine("runs grain checks for header/detail keys, and either posts to API or writes test payload.");
}

static void PrintAgentInstructions()
{
    Console.WriteLine("Agent prompt template:");
    Console.WriteLine("1) Describe database provider (sqlserver or postgresql), connection string, and source table/query.");
    Console.WriteLine("2) Provide header field mappings (source -> target).\n3) Provide detail mappings (source -> target).");
    Console.WriteLine("4) Define header grain keys that uniquely identify one header payload object.");
    Console.WriteLine("5) Provide API URL, method, headers, and tracking table name.");
    Console.WriteLine("6) Provide output directories for log/history/error/sent or allow defaults.");
}

file sealed class IntegrationConfig
{
    public required string IntegrationName { get; init; }
    public required DatabaseConfig Database { get; init; }
    public required MappingConfig Mapping { get; init; }
    public required GrainCheckerConfig GrainChecker { get; init; }
    public required HttpConfig Http { get; init; }
    public required TrackingConfig Tracking { get; init; }
    public DirectoryConfig? Directories { get; init; }

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(IntegrationName))
        {
            throw new InvalidOperationException("integrationName is required.");
        }

        Database.Validate();
        Mapping.Validate();
        GrainChecker.Validate();
        Http.Validate();
        Tracking.Validate();
    }
}

file sealed class DatabaseConfig
{
    public required string Provider { get; init; }
    public required string ConnectionString { get; init; }
    public string? Table { get; init; }
    public string? SourceQuery { get; init; }

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Provider))
        {
            throw new InvalidOperationException("database.provider is required.");
        }

        if (string.IsNullOrWhiteSpace(ConnectionString))
        {
            throw new InvalidOperationException("database.connectionString is required.");
        }

        if (string.IsNullOrWhiteSpace(Table) && string.IsNullOrWhiteSpace(SourceQuery))
        {
            throw new InvalidOperationException("database.table or database.sourceQuery is required.");
        }
    }
}

file sealed class MappingConfig
{
    public required List<FieldMapping> HeaderFields { get; init; }
    public required List<FieldMapping> DetailFields { get; init; }

    public void Validate()
    {
        if (HeaderFields.Count == 0)
        {
            throw new InvalidOperationException("mapping.headerFields requires at least one entry.");
        }

        foreach (var field in HeaderFields.Concat(DetailFields))
        {
            field.Validate();
        }
    }
}

file sealed class FieldMapping
{
    public required string Source { get; init; }
    public required string Target { get; init; }

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Source) || string.IsNullOrWhiteSpace(Target))
        {
            throw new InvalidOperationException("mapping fields must include source and target.");
        }
    }
}

file sealed class GrainCheckerConfig
{
    public required List<string> HeaderKeys { get; init; }

    public void Validate()
    {
        if (HeaderKeys.Count == 0)
        {
            throw new InvalidOperationException("grainChecker.headerKeys requires at least one key.");
        }
    }
}

file sealed class HttpConfig
{
    public required string Url { get; init; }
    public string Method { get; init; } = "POST";
    public Dictionary<string, string> Headers { get; init; } = new(StringComparer.OrdinalIgnoreCase);

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Url))
        {
            throw new InvalidOperationException("http.url is required.");
        }

        if (!Uri.TryCreate(Url, UriKind.Absolute, out _))
        {
            throw new InvalidOperationException("http.url must be absolute.");
        }
    }
}

file sealed class TrackingConfig
{
    public required string Table { get; init; }

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Table))
        {
            throw new InvalidOperationException("tracking.table is required.");
        }
    }
}

file sealed class DirectoryConfig
{
    public string? LogDirectory { get; init; }
    public string? HistoryDirectory { get; init; }
    public string? ErrorDirectory { get; init; }
    public string? SentDirectory { get; init; }
}

file sealed class RuntimeDirectories
{
    public required string LogDirectory { get; init; }
    public required string HistoryDirectory { get; init; }
    public required string ErrorDirectory { get; init; }
    public required string SentDirectory { get; init; }

    public static RuntimeDirectories From(DirectoryConfig? config)
    {
        var cwd = Directory.GetCurrentDirectory();
        return new RuntimeDirectories
        {
            LogDirectory = Resolve(config?.LogDirectory, cwd, "log"),
            HistoryDirectory = Resolve(config?.HistoryDirectory, cwd, "history"),
            ErrorDirectory = Resolve(config?.ErrorDirectory, cwd, "error"),
            SentDirectory = Resolve(config?.SentDirectory, cwd, "sent")
        };
    }

    public static RuntimeDirectories Fallback()
    {
        var cwd = Directory.GetCurrentDirectory();
        return new RuntimeDirectories
        {
            LogDirectory = Path.Combine(cwd, "log"),
            HistoryDirectory = Path.Combine(cwd, "history"),
            ErrorDirectory = Path.Combine(cwd, "error"),
            SentDirectory = Path.Combine(cwd, "sent")
        };
    }

    public void EnsureDirectories()
    {
        Directory.CreateDirectory(LogDirectory);
        Directory.CreateDirectory(HistoryDirectory);
        Directory.CreateDirectory(ErrorDirectory);
        Directory.CreateDirectory(SentDirectory);
    }

    public string CreateFilePath(string directory, string prefix, string extension)
    {
        var stamp = DateTimeOffset.UtcNow.ToString("yyyyMMddHHmmssfff", CultureInfo.InvariantCulture);
        return Path.Combine(directory, $"{prefix}_{stamp}{extension}");
    }

    private static string Resolve(string? configuredPath, string cwd, string fallbackFolder)
    {
        if (string.IsNullOrWhiteSpace(configuredPath))
        {
            return Path.Combine(cwd, fallbackFolder);
        }

        return Path.IsPathRooted(configuredPath)
            ? configuredPath
            : Path.GetFullPath(Path.Combine(cwd, configuredPath));
    }
}

file static class GrainChecker
{
    public static void Validate(IReadOnlyList<Dictionary<string, object?>> rows, IntegrationConfig config)
    {
        for (var i = 0; i < rows.Count; i++)
        {
            foreach (var key in config.GrainChecker.HeaderKeys)
            {
                if (!rows[i].TryGetValue(key, out var value) || value is null || string.IsNullOrWhiteSpace(value.ToString()))
                {
                    throw new InvalidOperationException($"Grain check failed at row {i}: missing header key '{key}'.");
                }
            }
        }
    }
}

file static class PayloadBuilder
{
    public static object Build(IntegrationConfig config, IReadOnlyList<Dictionary<string, object?>> rows)
    {
        var grouped = rows.GroupBy(r => MakeKey(r, config.GrainChecker.HeaderKeys), StringComparer.OrdinalIgnoreCase);

        var records = grouped.Select(group =>
        {
            var first = group.First();
            var header = MapFields(config.Mapping.HeaderFields, first);
            var details = group.Select(row => MapFields(config.Mapping.DetailFields, row)).ToList();

            return new
            {
                header,
                details
            };
        }).ToList();

        return new
        {
            integrationName = config.IntegrationName,
            generatedAtUtc = DateTimeOffset.UtcNow,
            recordCount = records.Count,
            records
        };
    }

    private static Dictionary<string, object?> MapFields(IEnumerable<FieldMapping> mappings,
        IReadOnlyDictionary<string, object?> row)
    {
        var result = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
        foreach (var mapping in mappings)
        {
            row.TryGetValue(mapping.Source, out var value);
            result[mapping.Target] = value;
        }

        return result;
    }

    private static string MakeKey(IReadOnlyDictionary<string, object?> row, IEnumerable<string> keyColumns)
    {
        return string.Join("|", keyColumns.Select(c => row.TryGetValue(c, out var v) ? v?.ToString() ?? string.Empty : string.Empty));
    }
}

file static class HttpDispatcher
{
    public static async Task<HttpSendResult> SendAsync(HttpConfig config, string payloadJson)
    {
        using var client = new HttpClient();
        using var request = new HttpRequestMessage(new HttpMethod(config.Method), config.Url)
        {
            Content = new StringContent(payloadJson, Encoding.UTF8, "application/json")
        };

        foreach (var (key, value) in config.Headers)
        {
            if (!request.Headers.TryAddWithoutValidation(key, value))
            {
                request.Content.Headers.TryAddWithoutValidation(key, value);
            }
        }

        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await client.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();
        return new HttpSendResult(response.IsSuccessStatusCode ? "SENT" : "ERROR", (int)response.StatusCode, body);
    }
}

file sealed record HttpSendResult(string Status, int ResponseCode, string ResponseBody);

file static class TrackingStore
{
    public static async Task EnsureSchemaAsync(DbConnection connection, string provider, TrackingTableName tableName)
    {
        var script = provider.Equals("sqlserver", StringComparison.OrdinalIgnoreCase)
            ? $@"
IF NOT EXISTS (
    SELECT 1
    FROM sys.tables t
    INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE s.name = '{tableName.Schema}' AND t.name = '{tableName.Table}'
)
BEGIN
    EXEC('CREATE TABLE {tableName.ToSqlIdentifier()} (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        IntegrationName NVARCHAR(200) NOT NULL,
        AttemptedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        Status NVARCHAR(30) NOT NULL,
        ResponseCode INT NULL,
        PayloadJson NVARCHAR(MAX) NOT NULL,
        ResponseBody NVARCHAR(MAX) NULL,
        ErrorMessage NVARCHAR(MAX) NULL
    )')
END"
            : $@"
CREATE SCHEMA IF NOT EXISTS ""{tableName.Schema}"";
CREATE TABLE IF NOT EXISTS {tableName.ToSqlIdentifier()} (
    id BIGSERIAL PRIMARY KEY,
    integration_name VARCHAR(200) NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(30) NOT NULL,
    response_code INTEGER NULL,
    payload_json TEXT NOT NULL,
    response_body TEXT NULL,
    error_message TEXT NULL
);";

        await using var command = connection.CreateCommand();
        command.CommandText = script;
        await command.ExecuteNonQueryAsync();
    }

    public static async Task InsertRecordAsync(DbConnection connection, string provider, TrackingTableName table,
        string integrationName, string status, int responseCode, string payloadJson, string? responseBody,
        string? errorMessage)
    {
        var isSqlServer = provider.Equals("sqlserver", StringComparison.OrdinalIgnoreCase);
        var columnNames = isSqlServer
            ? "IntegrationName, Status, ResponseCode, PayloadJson, ResponseBody, ErrorMessage"
            : "integration_name, status, response_code, payload_json, response_body, error_message";

        await using var command = connection.CreateCommand();
        command.CommandText = $"INSERT INTO {table.ToSqlIdentifier()} ({columnNames}) VALUES (@integrationName, @status, @responseCode, @payloadJson, @responseBody, @errorMessage)";
        AddParameter(command, "@integrationName", integrationName);
        AddParameter(command, "@status", status);
        AddParameter(command, "@responseCode", responseCode);
        AddParameter(command, "@payloadJson", payloadJson);
        AddParameter(command, "@responseBody", responseBody);
        AddParameter(command, "@errorMessage", errorMessage);

        await command.ExecuteNonQueryAsync();
    }

    private static void AddParameter(DbCommand command, string name, object? value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value ?? DBNull.Value;
        command.Parameters.Add(parameter);
    }
}

file sealed class TrackingTableName
{
    public required string Schema { get; init; }
    public required string Table { get; init; }
    public required string Provider { get; init; }

    public static TrackingTableName Parse(string input, string provider)
    {
        var defaultSchema = provider.Equals("sqlserver", StringComparison.OrdinalIgnoreCase) ? "dbo" : "public";
        var parts = input.Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var schema = parts.Length == 2 ? parts[0] : defaultSchema;
        var table = parts.Length == 2 ? parts[1] : parts.Length == 1 ? parts[0] : throw new InvalidOperationException($"Invalid table name: {input}");

        IdentifierGuard.Validate(schema, "schema");
        IdentifierGuard.Validate(table, "table");

        return new TrackingTableName
        {
            Schema = schema,
            Table = table,
            Provider = provider
        };
    }

    public string ToSqlIdentifier()
    {
        return Provider.Equals("sqlserver", StringComparison.OrdinalIgnoreCase)
            ? $"[{Schema}].[{Table}]"
            : $"\"{Schema}\".\"{Table}\"";
    }
}

file static class IdentifierGuard
{
    public static void Validate(string value, string label)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.All(ch => char.IsLetterOrDigit(ch) || ch == '_'))
        {
            throw new InvalidOperationException($"Invalid {label}: only letters, digits, and underscore are allowed.");
        }
    }
}
