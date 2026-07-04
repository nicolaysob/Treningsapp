-- Remove indoor cycling records and reprocess outdoor rides only.
DELETE FROM "PeakEffort" pe
USING "Activity" a
WHERE pe."activityId" = a.id
  AND pe.sport = 'RIDE'
  AND a.raw->>'sport_type' = 'VirtualRide';

UPDATE "Activity"
SET "streamsFetchedAt" = NULL
WHERE sport = 'RIDE'
  AND (raw->>'sport_type' IS DISTINCT FROM 'VirtualRide');
