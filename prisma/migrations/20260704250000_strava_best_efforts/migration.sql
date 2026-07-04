-- Reimport best times from Strava activity best_efforts.
DELETE FROM "PeakEffort" WHERE metric = 'time';

UPDATE "Activity"
SET "streamsFetchedAt" = NULL
WHERE sport IN ('RUN', 'RIDE');
