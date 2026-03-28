"use server"; // Indica que esto solo corre en el servidor (seguridad)

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function registrarTicket(datos: {
  sector: string;
  interno: string;
  categoria: string;
  descripcion: string;
  esResolucionInmediata: boolean;
  esGuardia: boolean;
}) {
  try {
    const nuevoTicket = await prisma.ticket.create({
      data: {
        sector: datos.sector,
        interno: datos.interno,
        categoria: datos.categoria,
        descripcion: datos.descripcion,
        es_guardia: datos.esGuardia,
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

export async function obtenerTicketsPendientes() {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        estado: "EN_PROCESO", // Solo traemos los que no se cerraron
      },
      orderBy: {
        fecha_creacion: 'asc', // El más viejo primero (el más urgente)
      },
    });
    return tickets;
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    return [];
  }
}

export async function finalizarTicket(id: number) {
  try {
    await prisma.ticket.update({
      where: { id: id },
      data: {
        estado: "RESUELTO",
        fecha_cierre: new Date(),
      },
    });

    // Esto hace que el ticket desaparezca de la lista /tickets automáticamente
    revalidatePath('/tickets');
    
    return { success: true };
  } catch (error) {
    console.error("Error al finalizar ticket:", error);
    return { success: false };
  }
}

export async function obtenerHistorialTickets() {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { estado: "RESUELTO" },
      orderBy: { fecha_cierre: 'desc' },
    });

    // Convertimos las fechas a string para que el Cliente las entienda
    return tickets.map(t => ({
      ...t,
      fecha_creacion: t.fecha_creacion.toISOString(),
      fecha_cierre: t.fecha_cierre ? t.fecha_cierre.toISOString() : null,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}