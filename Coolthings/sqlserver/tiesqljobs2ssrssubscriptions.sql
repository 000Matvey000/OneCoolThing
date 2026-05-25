--tie sql server jobs to ssrs subscriptions

USE ReportServer;
GO

SELECT
    j.name                          AS JobName,
    j.enabled                       AS JobEnabled,
    j.description                   AS JobDescription,
    c.Name                          AS ReportName,
    c.Path                          AS ReportPath,
    s.Description                   AS SubscriptionDescription,
    s.DeliveryExtension             AS DeliveryMethod,
    s.LastStatus                    AS LastRunStatus,
    s.LastRunTime                   AS LastRunTime,
    s.SubscriptionID
FROM msdb.dbo.sysjobs              j
JOIN msdb.dbo.syscategories        cat ON j.category_id    = cat.category_id
JOIN ReportServer.dbo.ReportSchedule rs  ON rs.ScheduleID  = CAST(j.name AS uniqueidentifier)
JOIN ReportServer.dbo.Subscriptions s   ON s.SubscriptionID = rs.SubscriptionID
JOIN ReportServer.dbo.Catalog       c   ON c.ItemID         = s.Report_OID
WHERE cat.name = 'Report Server'
ORDER BY c.Path, j.name;
