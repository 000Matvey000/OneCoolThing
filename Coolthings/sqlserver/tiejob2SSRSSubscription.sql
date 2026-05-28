SELECT distinct
sj.[name] AS [Job Name],
rs.SubscriptionID,
c.[Name] AS [Report Name],
c.[Path]


FROM msdb..sysjobs AS sj 

INNER JOIN ReportServer..ReportSchedule AS rs
ON sj.[name] = CAST(rs.ScheduleID AS NVARCHAR(128)) 

INNER JOIN ReportServer..Subscriptions AS su
ON rs.SubscriptionID = su.SubscriptionID

INNER JOIN ReportServer..[Catalog] c
ON su.Report_OID = c.ItemID
