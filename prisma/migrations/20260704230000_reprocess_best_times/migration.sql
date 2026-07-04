-- Reprocess best times with moving-time GPS segments.
DELETE FROM "PeakEffort" WHERE metric = 'time';

UPDATE "Activity"
SET "streamsFetchedAt" = NULL
WHERE sport IN ('RUN', 'RIDE');
