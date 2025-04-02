/*
  Warnings:

  - Added the required column `slug` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Made the column `currentFunding` on table `Campaign` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "currentFunding" SET NOT NULL;
