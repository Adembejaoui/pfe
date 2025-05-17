/*
  Warnings:

  - You are about to drop the `OrderAttribute` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameId,slug]` on the table `GameType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `GameType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderAttribute" DROP CONSTRAINT "OrderAttribute_orderId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GameType" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "attributes" JSONB;

-- DropTable
DROP TABLE "OrderAttribute";

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GameType_gameId_slug_key" ON "GameType"("gameId", "slug");
