/*
  Warnings:

  - You are about to drop the column `attributes` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "attributes" JSONB;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "attributes";
