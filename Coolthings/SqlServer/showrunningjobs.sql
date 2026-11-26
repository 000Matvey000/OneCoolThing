SELECT j.name AS JobName,
       r.run_requested_date AS StartTime,
       r.last_executed_step_id AS LastStepID,
       r.run_requested_source AS StartSource,
       r.job_id
FROM msdb.dbo.sysjobs j
JOIN msdb.dbo.sysjobactivity r ON j.job_id = r.job_id
WHERE r.stop_execution_date IS NULL  -- Only running jobs
AND r.start_execution_date IS NOT NULL;
