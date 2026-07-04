-- Zone seconds from Strava HR streams (per activity)
ALTER TABLE "Activity" ADD COLUMN "zoneEasySec" INTEGER;
ALTER TABLE "Activity" ADD COLUMN "zoneModerateSec" INTEGER;
ALTER TABLE "Activity" ADD COLUMN "zoneHardSec" INTEGER;
