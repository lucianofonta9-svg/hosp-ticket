"use server";

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
    await prisma.ticket.create({
      data: {
        sector: datos.sector,
        interno: datos.interno,
        categoria: datos.categoria,
        descripcion: datos.descripcion,
        es_guardia: datos.esGuardia,
        estado: datos.esResolucionInmediata ? "RESUELTO" : "EN_PROCESO",
        fecha_cierre: datos.esResolucionInmediata ? new Date() : null,
        tecnico: "Luciano Fontanarrosa",
        ubicacion: "Hospital Rafaela",
      },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function obtenerTicketsPendientes() {
  try {
    return await prisma.ticket.findMany({
      where: { estado: "EN_PROCESO" },
      orderBy: { fecha_creacion: 'asc' },
    });
  } catch (error) {
    return [];
  }
}

export async function finalizarTicket(id: number) {
  try {
    await prisma.ticket.update({
      where: { id },
      data: { estado: "RESUELTO", fecha_cierre: new Date() },
    });
    revalidatePath('/');
    revalidatePath('/historial');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function obtenerHistorialTickets() {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { estado: "RESUELTO" },
      orderBy: { fecha_cierre: 'desc' },
    });
    return tickets.map(t => ({
      ...t,
      fecha_creacion: t.fecha_creacion.toISOString(),
      fecha_cierre: t.fecha_cierre ? t.fecha_cierre.toISOString() : null,
    }));
  } catch (error) {
    return [];
  }
}

export async function obtenerTicketPorId(id: number) {
  return await prisma.ticket.findUnique({ where: { id } });
}

// CRUD COMPLETO 

//Actualiza datos del ticket exceptuando el estado y la fecha, 
// pensado para corrección de errores al cargar tickets.

export async function actualizarTicket(id: number, data: any) {
  try {
    await prisma.ticket.update({
      where: { id },
      data: {
        sector: data.sector,
        interno: data.interno,
        categoria: data.categoria,
        descripcion: data.descripcion,
        es_guardia: data.esGuardia
      }
    });
    revalidatePath('/');
    revalidatePath('/historial');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}


export async function eliminarTicket(id: number) {
  try {
    await prisma.ticket.delete({
      where: { id }
    });
    revalidatePath('/');
    revalidatePath('/historial');
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar:", error);
    return { success: false };
  }
}

// Cambia el estado de un ticket de "FINALIZADO" a "EN_PROCESO".

export async function reabrirTicket(id: number) {
  try {
    await prisma.ticket.update({
      where: { id },
      data: {
        estado: "EN_PROCESO",
        fecha_cierre: null 
      }
    });
    revalidatePath('/');
    revalidatePath('/historial');
    return { success: true };
  } catch (error) {
    console.error("Error al reabrir:", error);
    return { success: false };
  }
}