-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BET_WON', 'BET_LOST', 'BET_ON_YOU', 'SYSTEM');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "leagueId" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM';

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;
