/*
  Warnings:

  - You are about to drop the `GameType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameType" DROP CONSTRAINT "GameType_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_gameTypeId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "gameTypes" JSONB;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "gameTypeId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "GameType";
