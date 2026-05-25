"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from "bcrypt";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { auth } from "@/auth";
import { DATOS_SECTORES } from '../constants/sectores'; 

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function registrarTicket(datos: {
  sector: string;
  interno: string;
  categoryId: number;
  ubicacion: string; 
  usuarioSolicita: string; 
  descripcion: string;
  solucion?: string;             
  fechaManual: string; 
  fechaCierreManual?: string;         
  esResolucionInmediata: boolean;
  esGuardia: boolean;
  destacado: boolean;                 
  urgencia: "BAJA" | "MEDIA" | "CRITICA";
  tipoAsistencia: "PRESENCIAL" | "REMOTA";
}) {
  try {
    const session = await auth();

    if (!session?.user?.name) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const nombreTecnico = session.user.name;
    const fechaCreacion = new Date(datos.fechaManual);
    
    const fechaCierre = datos.esResolucionInmediata
      ? (datos.fechaCierreManual ? new Date(datos.fechaCierreManual) : new Date())
      : null;

    // Busca el sector cruzando nombre y ID de ubicación, y une los internos con guion
    const sectorEncontrado = DATOS_SECTORES.find(
      s => s.nombre === datos.sector && s.ubicacionId === Number(datos.ubicacion)
    );
    const internosFormateados = sectorEncontrado?.interno?.join(" - ") || "";

    await prisma.ticket.create({
      data: {
        sector: datos.sector,
        interno: internosFormateados, 
        categoryId: Number(datos.categoryId),
        ubicacion: datos.ubicacion,
        usuario_solicita: datos.usuarioSolicita,
        descripcion: datos.descripcion,
        solucion: datos.solucion || null, 
        es_guardia: datos.esGuardia,
        destacado: datos.destacado,         
        urgencia: datos.urgencia,
        tipo_asistencia: datos.tipoAsistencia,
        estado: datos.esResolucionInmediata ? "RESUELTO" : "EN_PROCESO",
        fecha_creacion: fechaCreacion,    
        fecha_cierre: fechaCierre,                                      
        tecnico: nombreTecnico,
        tecnico_cierre: datos.esResolucionInmediata ? nombreTecnico : null,
        logs: {
          create: {
            estado: datos.esResolucionInmediata ? "FINALIZADO" : "CREADO",
            tecnico: nombreTecnico,
            fecha: fechaCreacion          
          }
        }
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
    const tickets = await prisma.ticket.findMany({
      where: {
        estado: {
          in: ["EN_PROCESO", "PAUSADO"]
        }
      },
      include: {
        category: true,
        logs: { orderBy: { fecha: 'asc' } }
      },
    });

    const pesosUrgencia = {
      CRITICA: 1,
      MEDIA: 2,
      BAJA: 3,
    };

    const ticketsOrdenados = tickets.sort((a, b) => {
      if (a.estado !== b.estado) {
        return a.estado.localeCompare(b.estado);
      }
      const pesoA = pesosUrgencia[a.urgencia as keyof typeof pesosUrgencia] || 3;
      const pesoB = pesosUrgencia[b.urgencia as keyof typeof pesosUrgencia] || 3;
      if (pesoA !== pesoB) {
        return pesoA - pesoB;
      }
      return new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime();
    });

    return ticketsOrdenados.map(t => ({
      ...t,
      fecha_creacion: t.fecha_creacion.toISOString(),
    }));
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    return [];
  }
}

export async function finalizarTicket(id: number) {
  try {
    const session = await auth();
    const nombreTecnico = session?.user?.name || "Sistema";

    await prisma.ticket.update({
      where: { id },
      data: { 
        estado: "RESUELTO", 
        fecha_cierre: new Date(),
        tecnico_cierre: nombreTecnico,
        logs: {
          create: {
            estado: "FINALIZADO",
            tecnico: nombreTecnico
          }
        }
      },
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
      where: { 
        estado: {
          in: ["RESUELTO", "ELIMINADO"]
        }
      },
      include: {
        category: true,
        logs: { orderBy: { fecha: 'asc' } }
      },
      orderBy: { fecha_cierre: 'desc' },
    });

    const ticketsMapeados = tickets.map(t => ({
      ...t,
      fecha_creacion: t.fecha_creacion.toISOString(),
      fecha_cierre: t.fecha_cierre ? t.fecha_cierre.toISOString() : null,
    }));

    return ticketsMapeados.sort((a, b) => {
      if (a.estado === "ELIMINADO" && b.estado !== "ELIMINADO") return 1;
      if (a.estado !== "ELIMINADO" && b.estado === "ELIMINADO") return -1;
      return 0; 
    });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return [];
  }
}

export async function obtenerTicketPorId(id: number) {
  return await prisma.ticket.findUnique({ 
    where: { id },
    include: { logs: true } 
  });
}

export async function actualizarTicket(id: number, data: any) {
  try {
    const session = await auth();

    if (!session?.user?.name) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const nombreTecnico = session.user.name;

    // Busca el sector cruzando nombre y ID de ubicación, y une los internos con guion
    const sectorEncontrado = DATOS_SECTORES.find(
      (s: any) => s.nombre === data.sector && s.ubicacionId === Number(data.ubicacion)
    );
    const internosFormateados = sectorEncontrado?.interno?.join(" - ") || "";

    const datosActualizacion: any = {
      sector: data.sector,
      interno: internosFormateados, 
      category: { 
        connect: { id: Number(data.categoryId) } 
      },
      ubicacion: data.ubicacion,
      usuario_solicita: data.usuarioSolicita,
      descripcion: data.descripcion,
      solucion: data.solucion || null,   
      es_guardia: data.esGuardia,
      destacado: data.destacado,         
      urgencia: data.urgencia,          
      tipo_asistencia: data.tipoAsistencia,
      logs: {
        create: {
          estado: "EDITADO",
          tecnico: nombreTecnico
        }
      }
    };

    if (data.fechaManual) {              
      datosActualizacion.fecha_creacion = new Date(data.fechaManual);
    }

    if (data.fechaCierreManual) {                                       
      datosActualizacion.fecha_cierre = new Date(data.fechaCierreManual);
    }

    await prisma.ticket.update({
      where: { id },
      data: datosActualizacion
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
    const session = await auth();
    const nombreTecnico = session?.user?.name || "Sistema";

    await prisma.ticket.update({
      where: { id },
      data: {
        estado: "ELIMINADO",
        fecha_cierre: new Date(),
        tecnico_cierre: nombreTecnico,
        logs: {
          create: {
            estado: "ELIMINADO",
            tecnico: nombreTecnico
          }
        }
      }
    });

    revalidatePath('/');
    revalidatePath('/historial');
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar lógicamente el ticket:", error);
    return { success: false };
  }
}

export async function reabrirTicket(id: number) {
  try {
    const session = await auth();
    const nombreTecnico = session?.user?.name || "Sistema";

    await prisma.ticket.update({
      where: { id },
      data: {
        estado: "EN_PROCESO",
        fecha_cierre: null,
        tecnico_cierre: null,
        logs: {
          create: {
            estado: "REABIERTO",
            tecnico: nombreTecnico
          }
        }
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
    const session = await auth();
    const nombreTecnico = session?.user?.name || "Sistema";

    await prisma.ticket.update({
      where: { id },
      data: { 
        estado: nuevoEstado,
        logs: {
          create: {
            estado: nuevoEstado,
            tecnico: nombreTecnico
          }
        }
      }
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

export async function crearCategoria(name: string) {
  try {
    const categoria = await prisma.category.create({
      data: { 
        name: name.trim() 
      }
    });
    return categoria; 
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error("La categoría ya existe");
    }
    console.error("Error al crear categoría:", error);
    throw new Error("No se pudo crear la categoría");
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

export async function crearUsuariosManuales() {
  try {
    const passwordHasheada = await bcrypt.hash("1q2w3e4r", 10);

    const usuarios = [
      { nombre: "Fernando Cabral", username: "Fernando", rol: "ADMIN" },
      { nombre: "Pablo Torcivia", username: "Pablo", rol: "ADMIN" },
      { nombre: "Vladimir Szkylnyj", username: "Vladimir", rol: "ADMIN" },
    ];

    for (const u of usuarios) {
      await prisma.user.upsert({
        where: { username: u.username },
        update: {},
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

export async function alternarDestacadoTicket(id: number, estadoActual: boolean) {
  try {
    await prisma.ticket.update({
      where: { id },
      data: { destacado: !estadoActual }
    });
    revalidatePath('/');
    revalidatePath('/historial');
    return { success: true };
  } catch (error) {
    console.error("Error al alternar destacado:", error);
    return { success: false };
  }
}