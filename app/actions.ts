"use server"; // Indica que esto solo corre en el servidor (seguridad)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function registrarTicket(datos: {
  sector: string;
  interno: string;
  categoria: string;
  descripcion: string;
  esResolucionInmediata: boolean;
}) {
  try {
    const nuevoTicket = await prisma.ticket.create({
      data: {
        sector: datos.sector,
        interno: datos.interno,
        categoria: datos.categoria,
        descripcion: datos.descripcion,
        // Si el checkbox está marcado, el estado es RESUELTO
        estado: datos.esResolucionInmediata ? "RESUELTO" : "EN_PROCESO",
        // Si ya está resuelto, grabamos la fecha de cierre ahora mismo
        fecha_cierre: datos.esResolucionInmediata ? new Date() : null,
        // Datos fijos por ahora (luego vendrán del Login)
        tecnico: "Luciano Fontanarrosa",
        ubicacion: "Hospital Rafaela",
      },
    });

    console.log("Ticket guardado con ID:", nuevoTicket.id);
    return { success: true };
  } catch (error) {
    console.error("Error al guardar en BD:", error);
    return { success: false };
  }
}