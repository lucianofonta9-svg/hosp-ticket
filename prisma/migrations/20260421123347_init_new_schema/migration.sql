/*
  Warnings:

  - You are about to drop the column `categoria` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_solicita` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "categoria",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "usuario_solicita" TEXT NOT NULL,
ALTER COLUMN "interno" DROP NOT NULL,
ALTER COLUMN "tecnico" DROP DEFAULT,
ALTER COLUMN "ubicacion" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
