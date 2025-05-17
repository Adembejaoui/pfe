/*
  Warnings:

  - Added the required column `currentDivision` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentTier` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desiredDivision` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desiredTier` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currentDivision" TEXT NOT NULL,
ADD COLUMN     "currentLP" TEXT,
ADD COLUMN     "currentTier" TEXT NOT NULL,
ADD COLUMN     "desiredDivision" TEXT NOT NULL,
ADD COLUMN     "desiredTier" TEXT NOT NULL,
ADD COLUMN     "gameDetails" TEXT,
ADD COLUMN     "lpGain" TEXT,
ADD COLUMN     "queueType" TEXT,
ADD COLUMN     "server" TEXT,
ALTER COLUMN "price" DROP DEFAULT,
ALTER COLUMN "boostType" DROP DEFAULT,
ALTER COLUMN "clientId" DROP DEFAULT,
ALTER COLUMN "currentLevel" DROP DEFAULT,
ALTER COLUMN "desiredLevel" DROP DEFAULT,
ALTER COLUMN "game" DROP DEFAULT;
