/*
  Warnings:

  - The values [BET_ON_YOU] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('BET_WON', 'BET_LOST', 'PROP_ON_YOU', 'SYSTEM');
ALTER TABLE "public"."Notification" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
ALTER TABLE "Notification" ALTER COLUMN "type" SET DEFAULT 'SYSTEM';
COMMIT;
