-- Reprocess run/ride activities for best-time detection (was peak power/pace).
UPDATE "Activity"
SET "streamsFetchedAt" = NULL
WHERE sport IN ('RUN', 'RIDE');

DELETE FROM "PeakEffort"
WHERE metric IN ('power', 'pace');
