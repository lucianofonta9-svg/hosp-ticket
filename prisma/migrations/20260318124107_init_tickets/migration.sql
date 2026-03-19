-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cierre" TIMESTAMP(3),
    "sector" TEXT NOT NULL,
    "interno" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tecnico" TEXT NOT NULL DEFAULT 'Luciano Fontanarrosa',
    "estado" TEXT NOT NULL DEFAULT 'EN_PROCESO',
    "ubicacion" TEXT NOT NULL DEFAULT 'Hospital Rafaela',

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);
