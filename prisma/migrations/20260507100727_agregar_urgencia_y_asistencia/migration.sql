-- CreateEnum
CREATE TYPE "Urgencia" AS ENUM ('BAJA', 'MEDIA', 'CRITICA');

-- CreateEnum
CREATE TYPE "TipoAsistencia" AS ENUM ('PRESENCIAL', 'REMOTA');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "tipo_asistencia" "TipoAsistencia" NOT NULL DEFAULT 'PRESENCIAL',
ADD COLUMN     "urgencia" "Urgencia" NOT NULL DEFAULT 'BAJA';
