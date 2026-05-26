/*
  Warnings:

  - You are about to drop the column `es_guardia` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_cierre` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_creacion` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tecnico_cierre` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_asistencia` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_solicita` on the `Ticket` table. All the data in the column will be lost.
  - The `estado` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `usuarioSolicita` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `estado` on the `TicketLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('EN_PROCESO', 'PAUSADO', 'RESUELTO', 'ELIMINADO');

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "es_guardia",
DROP COLUMN "fecha_cierre",
DROP COLUMN "fecha_creacion",
DROP COLUMN "tecnico_cierre",
DROP COLUMN "tipo_asistencia",
DROP COLUMN "usuario_solicita",
ADD COLUMN     "esGuardia" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fechaCierre" TIMESTAMP(3),
ADD COLUMN     "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tecnicoCierre" TEXT,
ADD COLUMN     "tipoAsistencia" "TipoAsistencia" NOT NULL DEFAULT 'PRESENCIAL',
ADD COLUMN     "usuarioSolicita" TEXT NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "Estado" NOT NULL DEFAULT 'EN_PROCESO';

-- AlterTable
ALTER TABLE "TicketLog" DROP COLUMN "estado",
ADD COLUMN     "estado" "Estado" NOT NULL;
