/*
  Warnings:

  - You are about to drop the column `target` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "target",
ADD COLUMN     "targetFunding" DOUBLE PRECISION NOT NULL DEFAULT 0;
