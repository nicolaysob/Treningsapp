-- Recompute best times after fixing GPS/time calculation.
DELETE FROM "PeakEffort" WHERE metric = 'time';

UPDATE "Activity"
SET "streamsFetchedAt" = NULL
WHERE sport IN ('RUN', 'RIDE');
