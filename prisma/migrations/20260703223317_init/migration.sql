-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('RIDE', 'RUN', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "stravaAthleteId" BIGINT,
    "ftpWatts" INTEGER,
    "thresholdPaceSecPerKm" INTEGER,
    "hrThresholdBpm" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stravaActivityId" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sport" "Sport" NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "distanceM" DOUBLE PRECISION,
    "avgWatts" DOUBLE PRECISION,
    "npWatts" DOUBLE PRECISION,
    "avgHr" INTEGER,
    "elevationM" DOUBLE PRECISION,
    "avgPaceSecPerKm" INTEGER,
    "tss" DOUBLE PRECISION,
    "tssMethod" TEXT,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLoad" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dailyTss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctl" DOUBLE PRECISION NOT NULL,
    "atl" DOUBLE PRECISION NOT NULL,
    "tsb" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DailyLoad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeakEffort" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sport" "Sport" NOT NULL,
    "metric" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT,

    CONSTRAINT "PeakEffort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedWorkout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sport" "Sport" NOT NULL,
    "description" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,

    CONSTRAINT "PlannedWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stravaAthleteId_key" ON "User"("stravaAthleteId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_stravaActivityId_key" ON "Activity"("stravaActivityId");

-- CreateIndex
CREATE INDEX "Activity_userId_date_idx" ON "Activity"("userId", "date");

-- CreateIndex
CREATE INDEX "Activity_userId_sport_date_idx" ON "Activity"("userId", "sport", "date");

-- CreateIndex
CREATE INDEX "DailyLoad_userId_date_idx" ON "DailyLoad"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLoad_userId_date_key" ON "DailyLoad"("userId", "date");

-- CreateIndex
CREATE INDEX "PeakEffort_userId_sport_metric_idx" ON "PeakEffort"("userId", "sport", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "PeakEffort_userId_sport_metric_durationSec_key" ON "PeakEffort"("userId", "sport", "metric", "durationSec");

-- CreateIndex
CREATE INDEX "PlannedWorkout_userId_date_idx" ON "PlannedWorkout"("userId", "date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLoad" ADD CONSTRAINT "DailyLoad_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeakEffort" ADD CONSTRAINT "PeakEffort_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeakEffort" ADD CONSTRAINT "PeakEffort_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedWorkout" ADD CONSTRAINT "PlannedWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
