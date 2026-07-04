-- CreateIndex
CREATE INDEX "Account_userId_provider_idx" ON "Account"("userId", "provider");

-- CreateIndex
CREATE INDEX "Activity_userId_streamsFetchedAt_idx" ON "Activity"("userId", "streamsFetchedAt");
