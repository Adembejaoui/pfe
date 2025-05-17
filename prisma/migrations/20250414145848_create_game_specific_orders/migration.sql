/*
  Warnings:

  - You are about to drop the column `boostType` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `currentDivision` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `currentLP` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `currentLevel` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `currentTier` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `desiredDivision` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `desiredLevel` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `desiredTier` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `gameDetails` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `lpGain` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `queueType` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `server` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "boostType",
DROP COLUMN "currentDivision",
DROP COLUMN "currentLP",
DROP COLUMN "currentLevel",
DROP COLUMN "currentTier",
DROP COLUMN "desiredDivision",
DROP COLUMN "desiredLevel",
DROP COLUMN "desiredTier",
DROP COLUMN "gameDetails",
DROP COLUMN "lpGain",
DROP COLUMN "price",
DROP COLUMN "queueType",
DROP COLUMN "server",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "LeagueOfLegendOrder" (
    "orderId" INTEGER NOT NULL,
    "boostType" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "price" DOUBLE PRECISION NOT NULL,
    "currentLevel" INTEGER NOT NULL,
    "desiredLevel" INTEGER NOT NULL,
    "currentTier" TEXT NOT NULL,
    "currentDivision" TEXT NOT NULL,
    "desiredTier" TEXT NOT NULL,
    "desiredDivision" TEXT NOT NULL,
    "currentLP" TEXT,
    "lpGain" TEXT,
    "queueType" TEXT,
    "server" TEXT,

    CONSTRAINT "LeagueOfLegendOrder_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "ValorantOrder" (
    "orderId" INTEGER NOT NULL,
    "boostType" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "price" DOUBLE PRECISION NOT NULL,
    "currentRank" TEXT NOT NULL,
    "currentDivision" TEXT NOT NULL,
    "desiredRank" TEXT NOT NULL,
    "desiredDivision" TEXT NOT NULL,
    "currentLP" TEXT,
    "queueType" TEXT,
    "server" TEXT,

    CONSTRAINT "ValorantOrder_pkey" PRIMARY KEY ("orderId")
);

-- AddForeignKey
ALTER TABLE "LeagueOfLegendOrder" ADD CONSTRAINT "LeagueOfLegendOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValorantOrder" ADD CONSTRAINT "ValorantOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
