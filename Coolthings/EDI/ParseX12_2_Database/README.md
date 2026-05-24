# ParseX12_2_Database (fileParser)

This is a .NET console app that:

1. Takes an incoming X12 file.
2. Archives the original file.
3. Normalizes delimiters (converts `~` to CRLF when needed).
4. Splits files that contain multiple `ISA` envelopes.
5. Parses configured segment fields from each transaction.
6. Inserts parsed rows into SQL Server table `X12_Staging`.
7. Moves successfully processed files to a processed folder (timestamped name).

## Project Files

- `Program.cs`: App entry point and argument handling.
- `cls_X12Helper.cs`: archive, delimiter detection/conversion, split-by-ISA.
- `cls_x12file.cs`: envelope parsing, ST/SE extraction, config-based field extraction.
- `cls_SqlInterface.cs`: SQL insert logic.
- `X12Config.json`: document/segment field mapping config.
- `x12db.json`: database connection string.
- `Create_X12_Staging_Table.sql`: SQL table creation script.
- `run-fileParser.ps1`: PowerShell wrapper for launching exe and logging output.

## Prerequisites

- .NET 9 SDK (for build/run/publish).
- SQL Server access.
- `X12_Staging` table created in target database (use `Create_X12_Staging_Table.sql`).
- Valid connection string in `x12db.json`.

## Configure Before Running

### 1) Database connection

Edit `x12db.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=YOUR_DB;TrustServerCertificate=True;Integrated Security=True;"
  }
}
```

### 2) Segment extraction rules

Edit `X12Config.json` if you need different transaction types or fields. The fields are specified in `SEGMENT-FIELD` format, where `SEGMENT` is the segment ID (e.g. `BIG`) and `FIELD` is the 1-based position within that segment (e.g. `01` for the first field).

In the database, you will not see the fields as columns but rather as rows in the `X12_Staging` table, with the segment and field info stored in the `Segment` and `FieldPosition` columns. The `Value` column will contain the extracted value for that segment field. This is so that the staging table can accommodate any segments and fields without needing schema changes.

```json
{
  "X12Configs": [
    {
      "DocumentType": "810",
      "HeaderSummaryFields": [
        "BIG-01",
        "BIG-02",
        "N1-01",
        "N1-02",
        "N1-03",
        "TDS-01",
        "CAD-01"
      ],
      "DetailFields": ["IT1-01", "IT1-02", "IT1-03", "IT1-04"]
    }
  ]
}
```

### 3) Required folders

Make sure these folders exist before running (the app validates them):

- to-be-processed folder
- archive folder
- error folder
- processed folder

## Main Program Arguments

`Program.cs` expects exactly 7 arguments in this order:

```text
fileParser <filePath> <fileName> <fileType> <toBeProcessedPath> <archivePath> <errorPath> <processedPath>
```

Example:

```powershell
# From project folder
 dotnet run -- \
  . \
  multiple_ISA.txt \
  X12 \
  .\toBeProcessedPath \
  .\archivePath \
  .\errorPath \
  .\processedPath
```

Notes:

- If `<filePath>` is `.`, the app uses the current working directory.
- `<fileType>` should be `X12`.
- The input file must exist at `Path.Combine(filePath, fileName)`.

## Running With PowerShell Wrapper (Recommended)

Use `run-fileParser.ps1` so output is logged to timestamped files in `logs`.

### Script parameters

- `-ExePath` (required in current script behavior)
- Named data args (mapped to `Program.cs` order):
  - `-FilePath`
  - `-FileName`
  - `-FileType`
  - `-ToBeProcessedPath`
  - `-ArchivePath`
  - `-ErrorPath`
  - `-ProcessedPath`
- `-Args` (optional extra args appended)
- `-LogDir` (default: `./logs`)

### Example: call exe with named args

```powershell
pwsh .\run-fileParser.ps1 \
  -ExePath .\bin\Release\net9.0\win-x64\publish\fileParser.exe \
  -FilePath . \
  -FileName multiple_ISA.txt \
  -FileType X12 \
  -ToBeProcessedPath .\toBeProcessedPath \
  -ArchivePath .\archivePath \
  -ErrorPath .\errorPath \
  -ProcessedPath .\processedPath \
  -LogDir .\logs
```

## Build

```powershell
dotnet restore
dotnet build -c Release
```

## Publish as EXE

Run these commands from this project folder.

### Option A: Framework-dependent EXE (smallest output)

Requires .NET runtime installed on target machine.

```powershell
dotnet publish .\fileParser.csproj -c Release -r win-x64 --self-contained false -o .\publish\win-x64
```

Output exe:

- `.\publish\win-x64\fileParser.exe`

### Option B: Self-contained EXE (runtime bundled)

No .NET runtime required on target machine.

```powershell
dotnet publish .\fileParser.csproj -c Release -r win-x64 --self-contained true -o .\publish\win-x64-self
```

Output exe:

- `.\publish\win-x64-self\fileParser.exe`

### Option C: Single-file self-contained EXE

Useful for easy deployment (larger exe).

```powershell
dotnet publish .\fileParser.csproj -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true -o .\publish\win-x64-single
```

Output exe:

- `.\publish\win-x64-single\fileParser.exe`

## Run Published EXE Directly

```powershell
.\publish\win-x64-single\fileParser.exe \
  . \
  multiple_ISA.txt \
  X12 \
  .\toBeProcessedPath \
  .\archivePath \
  .\errorPath \
  .\processedPath
```

## Operational Notes

- `X12Config.json` and `x12db.json` are read from the process working directory.
  - Run from a folder where those files exist, or copy them next to the exe.
- Original source file is copied to archive with timestamp first.
- Multi-ISA files are split into `X12_PartN_timestamp.txt` before parse.
- Files that fail envelope/ST validation are moved to error folder.
- Successful files are moved to processed folder with timestamp suffix.
- PowerShell wrapper writes combined stdout/stderr to `log_yyyyMMdd_HHmmss.txt`.
