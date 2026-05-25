
USE ReportServer;
GO

--use this query to get a list of all items and their permissions, including inherited permissions, in the SSRS ReportServer database. You can filter the results by UserOrGroup to find specific permissions for a user or group.

with reportserversec_cte as (
SELECT
    c.Path                                      AS ItemPath,
    c.Name                                      AS ItemName,
    CASE c.Type
        WHEN 1 THEN 'Folder'
        WHEN 2 THEN 'Report'
        WHEN 3 THEN 'Resource'
        WHEN 4 THEN 'Linked Report'
        WHEN 5 THEN 'Data Source'
        WHEN 6 THEN 'Report Model'
        WHEN 7 THEN 'Report Part'
        WHEN 8 THEN 'Shared Dataset'
        ELSE 'Other'
    END                                         AS ItemType,
    u.UserName                                  AS UserOrGroup,
    r.RoleName                                  AS RoleName,
    r.Description                               AS RoleDescription,
    CASE
        WHEN c.PolicyID = p.PolicyID THEN 'Explicit'
        ELSE 'Inherited'
    END                                         AS SecuritySource,
    parent.Path                                 AS InheritedFromPath
FROM dbo.Catalog c
LEFT JOIN dbo.Policies p
    ON c.PolicyID = p.PolicyID
LEFT JOIN dbo.PolicyUserRole pur
    ON p.PolicyID = pur.PolicyID
LEFT JOIN dbo.Users u
    ON pur.UserID = u.UserID
LEFT JOIN dbo.Roles r
    ON pur.RoleID = r.RoleID
OUTER APPLY
(
    SELECT TOP 1
        pc.Path
    FROM dbo.Catalog pc
    WHERE pc.PolicyID = c.PolicyID
      AND pc.ItemID <> c.ItemID
      AND c.Path LIKE pc.Path + '/%'
    ORDER BY LEN(pc.Path) DESC
) parent
WHERE c.Type IN (1, 2)  -- 1 = Folder, 2 = Report
)

select * from reportserversec_cte where UserOrGroup like '%yourmom%'

