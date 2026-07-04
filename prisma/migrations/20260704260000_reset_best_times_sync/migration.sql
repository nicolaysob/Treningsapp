-- Ensure best times are reprocessed after sync fix.
UPDATE "Activity"
SET "streamsFetchedAt" = NULL
WHERE sport IN ('RUN', 'RIDE');
