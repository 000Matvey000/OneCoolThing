# DatabaseTableHttpClient

Config-driven .NET console client that reads SQL Server or PostgreSQL data, builds header/detail JSON payloads, validates grain keys, tracks every send attempt in a required tracking table, and sends payloads to an API (or writes to a test file).

## Run

```bash
./run-client.sh ./config/sqlserver.sample.json
./run-client.sh ./config/postgresql.sample.json --test /tmp/payload.json
```

PowerShell:

```powershell
./run-client.ps1 ./config/sqlserver.sample.json
./run-client.ps1 ./config/postgresql.sample.json --test C:\temp\payload.json
```

## Commands

```bash
dotnet run -- --help
dotnet run -- --agent-instructions
```

## Config shape

The full JSON Schema is in `/home/runner/work/OneCoolThing/OneCoolThing/Coolthings/DotNet/DatabaseTableHttpClient/config/config.schema.json`.  
Runtime execution validates the config against this schema before deserialization.

- `integrationName`: integration identifier.
- `database.provider`: `sqlserver` or `postgresql`.
- `database.connectionString`: DB connection string.
- `database.table` or `database.sourceQuery`: source rows (`sourceQuery` must be a single read-only `SELECT`/`WITH` query).
- `mapping.headerFields`: source->target mappings for header object.
- `mapping.detailFields`: source->target mappings for detail rows.
- `grainChecker.headerKeys`: key columns used to validate/group rows.
- `http`: API URL/method/headers.
- `tracking.table`: required tracking table name (`schema.table` or table only).
- `directories`: optional `log/history/error/sent` folders. Defaults to caller working directory.

If API delivery fails (non-2xx or transport exception), the app writes the failure to tracking and exits with a non-zero code.

## Docker test setup

`docker-compose.yml` starts:
- SQL Server (1433)
- PostgreSQL (5432)
- API echo server (8080)

```bash
docker compose up -d
```

Seed PostgreSQL automatically with `docker/postgres-init.sql`.

Seed SQL Server manually after startup:

```bash
docker compose exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'Your_strong_password123' -d master -i /docker/sqlserver-init.sql
```
