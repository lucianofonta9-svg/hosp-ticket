"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from "bcrypt";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { auth } from "@/auth";

const prisma = new PrismaClient();


export async function registrarTicket(datos: {
  sector: string;
  interno: string;
  categoryId: number;
  ubicacion: string; 
  usuarioSolicita: string; 
  descripcion: string;
  esResolucionInmediata: boolean;
  esGuardia: boolean;
}) {
  try {
    // obtiene la sesión actual
    const session = await auth();

    // verifica que haya un usuario (seguridad extra)
    if (!session?.user?.name) {
      return { success: false, error: "Usuario no autenticado" };
    }

    await prisma.ticket.create({
      data: {
        sector: datos.sector,
        interno: datos.interno,
        categoryId: Number(datos.categoryId),
        ubicacion: datos.ubicacion,
        usuario_solicita: datos.usuarioSolicita,
        descripcion: datos.descripcion,
        es_guardia: datos.esGuardia,
        estado: datos.esResolucionInmediata ? "RESUELTO" : "EN_PROCESO",
        fecha_cierre: datos.esResolucionInmediata ? new Date() : null,
        
        //nombre de la sesión
        tecnico: session.user.name, 
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
      where: {
        estado: {
          in: ["EN_PROCESO", "PAUSADO"]
        }
      },
      orderBy: [
        { estado: 'asc' },
        { fecha_creacion: 'asc' }
      ],
    });
  } catch (error) {
    console.error("Error al obtener tickets:", error);
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

export async function actualizarTicket(id: number, data: any) {
  try {
    await prisma.ticket.update({
      where: { id },
      data: {
        sector: data.sector,
        interno: data.interno,
        categoryId: Number(data.categoryId),
        ubicacion: data.ubicacion,
        usuario_solicita: data.usuarioSolicita,
        descripcion: data.descripcion,
        es_guardia: data.esGuardia
      }
    });
    revalidatePath('/');
    revalidatePath('/historial');
    return { success: true };
  } catch (e) {
    console.error(e);
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

export async function cambiarEstadoTicket(id: number, nuevoEstado: "EN_PROCESO" | "PAUSADO") {
  try {
    await prisma.ticket.update({
      where: { id },
      data: { estado: nuevoEstado }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function obtenerCategorias() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function crearCategoria(nombre: string) {
  try {
    const nueva = await prisma.category.create({
      data: { name: nombre }  
    });
    return { success: true, categoria: nueva };
  } catch (error) {
    return { success: false, message: "La categoría ya existe o hubo un error" };
  }
}


export async function autenticar(
  _prevState: string | undefined, 
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenciales inválidas.";
        default:
          return "Algo salió mal.";
      }
    }
    throw error;
  }
}


//temporal, porque hacer un login no es prioridad en el MVP
export async function crearUsuariosManuales() {
  try {
    const passwordHasheada = await bcrypt.hash("1q2w3e4r", 10);

    // lista de usuarios
    const usuarios = [
      { nombre: "Mauricio Gaya", username: "Mauricio", rol: "ADMIN" },
    ];

    // creamos todos juntos si es necesario
    for (const u of usuarios) {
      await prisma.user.upsert({
        where: { username: u.username },
        update: {}, // Si ya existe, no hace nada
        create: {
          nombre: u.nombre,
          username: u.username,
          password: passwordHasheada,
          rol: u.rol,
        },
      });
    }

    revalidatePath("/");
    return { success: true, message: "Los usuarios fueron creados/verificados." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error al crear usuarios." };
  }
}
