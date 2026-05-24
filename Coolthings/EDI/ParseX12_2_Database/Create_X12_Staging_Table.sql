/*
  Create_X12_Staging_Table.sql

  SQL Server CREATE TABLE script for the X12_Staging table used by the fileParser project.
  This table schema is derived from the parameters passed into
  SqlInterface.InsertX12Data in `cls_SqlInterface.cs`.

  Notes / decisions made:
  - Many incoming values are passed as strings in the C# code; therefore most columns are
    created as NVARCHAR. Use NVARCHAR(MAX) for `Value` because EDI elements can be long.
  - `CreatedAt` and `UpdatedAt` use DATETIME2 with a default of SYSUTCDATETIME() to store UTC timestamps.
  - `IsProcessed` is BIT with a default of 0 (false).
  - An integer IDENTITY primary key (`Id`) is included for convenience.

  Adjust column lengths and types to match your data and validation rules as needed.
*/

IF OBJECT_ID('dbo.X12_Staging', 'U') IS NOT NULL
    DROP TABLE dbo.X12_Staging;
GO

CREATE TABLE dbo.X12_Staging (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [FileName] NVARCHAR(MAX) NOT NULL,
    STID NVARCHAR(MAX) NULL,
    Document NVARCHAR(MAX) NULL,
    Segment NVARCHAR(MAX) NULL,
    Position NVARCHAR(MAX) NULL,
    [Value] NVARCHAR(MAX) NULL,
    SenderID NVARCHAR(MAX) NULL,
    ReceiverID NVARCHAR(MAX) NULL,
    ControlNumber NVARCHAR(MAX) NULL,
    [Version] NVARCHAR(MAX) NULL,
    FunctionalGroup NVARCHAR(MAX) NULL,
    TranDate NVARCHAR(MAX) NULL,     
    TranTime NVARCHAR(MAX) NULL,     
    CreatedAt DATE NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATE NOT NULL DEFAULT GETDATE(),
    IsProcessed BIT NOT NULL DEFAULT (0),
    GSControlNumber NVARCHAR(100) NULL,
    GSFrom NVARCHAR(150) NULL,
    GSTo NVARCHAR(150) NULL
);
GO

-- Small verification query you can run after creating the table
SELECT TOP (10) Id, FileName, STID, Segment, Position, SenderID, ReceiverID, IsProcessed, CreatedAt
FROM dbo.X12_Staging
ORDER BY CreatedAt DESC;

-- End of script
