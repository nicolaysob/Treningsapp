/*
  Warnings:

  - Added the required column `updatedAt` to the `PeakEffort` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "streamsFetchedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PeakEffort" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
