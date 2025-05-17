/*
  Warnings:

  - You are about to drop the column `game` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `LeagueOfLegendOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ValorantOrder` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `gameId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameTypeId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LeagueOfLegendOrder" DROP CONSTRAINT "LeagueOfLegendOrder_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ValorantOrder" DROP CONSTRAINT "ValorantOrder_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "game",
ADD COLUMN     "gameId" INTEGER NOT NULL,
ADD COLUMN     "gameTypeId" INTEGER NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "LeagueOfLegendOrder";

-- DropTable
DROP TABLE "ValorantOrder";

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gameId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderAttribute" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OrderAttribute_orderId_key_key" ON "OrderAttribute"("orderId", "key");

-- AddForeignKey
ALTER TABLE "GameType" ADD CONSTRAINT "GameType_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_gameTypeId_fkey" FOREIGN KEY ("gameTypeId") REFERENCES "GameType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAttribute" ADD CONSTRAINT "OrderAttribute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
