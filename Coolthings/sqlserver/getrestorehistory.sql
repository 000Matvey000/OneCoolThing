DECLARE @db sysname = N'YourDatabaseName';

SELECT  
    rh.restore_date,
    rh.destination_database_name,
    CASE rh.restore_type
        WHEN 'D' THEN 'Database (Full)'
        WHEN 'I' THEN 'Differential'
        WHEN 'L' THEN 'Log'
        WHEN 'F' THEN 'File'
        WHEN 'G' THEN 'Filegroup'
        WHEN 'P' THEN 'Partial'
        WHEN 'Q' THEN 'Differential Partial'
        WHEN 'R' THEN 'Revert'
        ELSE rh.restore_type
    END AS restore_type,
    bs.database_name AS source_database_name,
    bs.backup_start_date,
    bs.backup_finish_date,
    bs.first_lsn, bs.last_lsn, bs.checkpoint_lsn,
    bmf.physical_device_name AS backup_file,
    bs.user_name AS backup_taken_by,
    rh.user_name AS restored_by
FROM msdb.dbo.restorehistory rh
JOIN msdb.dbo.backupset bs
    ON rh.backup_set_id = bs.backup_set_id
JOIN msdb.dbo.backupmediafamily bmf
    ON bs.media_set_id = bmf.media_set_id
WHERE rh.destination_database_name = @db
ORDER BY rh.restore_date DESC, bs.backup_finish_date DESC;
