-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "tecnico_cierre" TEXT;

-- CreateTable
CREATE TABLE "TicketLog" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "tecnico" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TicketLog" ADD CONSTRAINT "TicketLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
