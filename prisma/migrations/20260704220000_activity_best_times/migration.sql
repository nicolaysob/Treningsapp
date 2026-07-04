-- Best times now come directly from Activity distance + moving_time.
DELETE FROM "PeakEffort" WHERE metric = 'time';

UPDATE "Activity"
SET "streamsFetchedAt" = NULL
WHERE sport IN ('RUN', 'RIDE');
