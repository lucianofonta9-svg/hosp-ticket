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
  sector?: string | null;
  nombrePueblo?: string | null;
  interno?: string;
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
    const fechaCreacion = parseFechaArgentina(datos.fechaManual);
    
    const fechaCierre = datos.esResolucionInmediata
      ? (datos.fechaCierreManual ? parseFechaArgentina(datos.fechaCierreManual) : new Date())
      : null;

    // Si sector es null (porque es un pueblo), sectorEncontrado será undefined, lo cual es seguro.
    const sectorEncontrado = DATOS_SECTORES.find(
      s => s.nombre === datos.sector && s.ubicacionId === Number(datos.ubicacion)
    );
    const internosFormateados = sectorEncontrado?.interno?.join(" - ") || "";

    await prisma.ticket.create({
      data: {
        sector: datos.sector || null,
        nombrePueblo: datos.nombrePueblo || null,
        interno: internosFormateados, 
        categoryId: Number(datos.categoryId),
        ubicacion: datos.ubicacion,
        usuarioSolicita: datos.usuarioSolicita,
        descripcion: datos.descripcion,
        solucion: datos.solucion || null, 
        esGuardia: datos.esGuardia,
        destacado: datos.destacado,         
        urgencia: datos.urgencia,
        tipoAsistencia: datos.tipoAsistencia,
        estado: datos.esResolucionInmediata ? "RESUELTO" : "EN_PROCESO",
        fechaCreacion: fechaCreacion,    
        fechaCierre: fechaCierre,                                      
        tecnico: nombreTecnico,
        tecnicoCierre: datos.esResolucionInmediata ? nombreTecnico : null,
        logs: {
          create: {
            estado: datos.esResolucionInmediata ? "RESUELTO" : "CREADO",
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
      return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
    });

    return ticketsOrdenados.map(t => ({
      ...t,
      fechaCreacion: t.fechaCreacion.toISOString(),
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
        fechaCierre: new Date(),
        tecnicoCierre: nombreTecnico,
        logs: {
          create: {
            estado: "RESUELTO",
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
      orderBy: { fechaCierre: 'desc' },
    });

    const ticketsMapeados = tickets.map(t => ({
      ...t,
      fechaCreacion: t.fechaCreacion.toISOString(),
      fechaCierre: t.fechaCierre ? t.fechaCierre.toISOString() : null,
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

    const sectorEncontrado = DATOS_SECTORES.find(
      (s: any) => s.nombre === data.sector && s.ubicacionId === Number(data.ubicacion)
    );
    const internosFormateados = sectorEncontrado?.interno?.join(" - ") || "";

    const datosActualizacion: any = {
      sector: data.sector || null,
      nombrePueblo: data.nombrePueblo || null,
      interno: internosFormateados, 
      category: { 
        connect: { id: Number(data.categoryId) } 
      },
      ubicacion: data.ubicacion,
      usuarioSolicita: data.usuarioSolicita,
      descripcion: data.descripcion,
      solucion: data.solucion || null,   
      esGuardia: data.esGuardia,
      destacado: data.destacado,         
      urgencia: data.urgencia,          
      tipoAsistencia: data.tipoAsistencia,
      logs: {
        create: {
          estado: "EDITADO",
          tecnico: nombreTecnico
        }
      }
    };

    if (data.fechaManual) {              
      datosActualizacion.fechaCreacion = parseFechaArgentina(data.fechaManual);
    }

    if (data.fechaCierreManual) {                                       
      datosActualizacion.fechaCierre = parseFechaArgentina(data.fechaCierreManual);
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
        fechaCierre: new Date(),
        tecnicoCierre: nombreTecnico,
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
        fechaCierre: null,
        tecnicoCierre: null,
        logs: {
          create: {
            estado: "REANUDADO",
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

    const estadoLog = nuevoEstado === "EN_PROCESO" ? "REANUDADO" : "PAUSADO";

    await prisma.ticket.update({
      where: { id },
      data: { 
        estado: nuevoEstado,
        logs: {
          create: {
            estado: estadoLog,
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

const parseFechaArgentina = (fechaStr: string) => {
  if (fechaStr && fechaStr.includes('T') && fechaStr.length === 16) {
    return new Date(`${fechaStr}:00-03:00`);
  }
  return new Date(fechaStr);
};

export async function actualizarSolucionTicket(id: number, solucion: string) {
  try {
    await prisma.ticket.update({
      where: { id },
      data: { solucion }
    });
    revalidatePath('/'); 
  } catch (error) {
    console.error("Error al guardar la nota:", error);
  }
}
export async function obtenerDatosDashboard(fechaDesde?: string, fechaHasta?: string) {
  try {
    let filtroWhere: any = {};
    
    if (fechaDesde || fechaHasta) {
      filtroWhere.fechaCreacion = {};
      if (fechaDesde) {
        filtroWhere.fechaCreacion.gte = new Date(`${fechaDesde}T00:00:00`);
      }
      if (fechaHasta) {
        filtroWhere.fechaCreacion.lte = new Date(`${fechaHasta}T23:59:59`);
      }
    }

    const agrupadosPorSector = await prisma.ticket.groupBy({
      by: ['sector'],
      where: filtroWhere,
      _count: { id: true },
    });
    const topSectores = agrupadosPorSector
      .map(s => ({ nombre: s.sector || "Sin sector", cantidad: s._count.id }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    const agrupadosPorUrgencia = await prisma.ticket.groupBy({
      by: ['urgencia'],
      where: filtroWhere,
      _count: { id: true }
    });
    const graficoUrgencia = agrupadosPorUrgencia.map(u => ({ 
      name: u.urgencia || "General", 
      cantidad: u._count.id 
    }));

    const todosLosTickets = await prisma.ticket.findMany({
      where: filtroWhere,
      select: {
        fechaCreacion: true,
        fechaCierre: true,
        tecnico: true,
        estado: true,
        tipoAsistencia: true,
        esGuardia: true,
        ubicacion: true,
        category: {
          select: { name: true }
        }
      }
    });

    let tiempoTotalMs = 0;
    let ticketsResueltos = 0;
    let totalTickets = 0;
    let ticketsGuardia = 0;
    
    const conteoPorTecnico: Record<string, { creados: number, cerrados: number }> = {};
    const conteoPorMes: Record<string, number> = {};
    const conteoPorCategoria: Record<string, number> = {};
    const conteoAsistencia: Record<string, number> = {};
    const conteoUbicacion: Record<string, number> = {};

    todosLosTickets.forEach((t: any) => {
      totalTickets++;
      if (t.esGuardia) ticketsGuardia++;

      let nombreTecnico = "Sin Técnico";
      if (t.tecnico && typeof t.tecnico === 'string' && t.tecnico.trim() !== "") {
          nombreTecnico = t.tecnico.trim();
      }
      
      if (!conteoPorTecnico[nombreTecnico]) {
        conteoPorTecnico[nombreTecnico] = { creados: 0, cerrados: 0 };
      }
      conteoPorTecnico[nombreTecnico].creados += 1;

      if (t.fechaCierre || t.estado === "FINALIZADO" || t.estado === "ELIMINADO" || t.estado === "RESUELTO") {
        conteoPorTecnico[nombreTecnico].cerrados += 1;
        
        if (t.fechaCreacion && t.fechaCierre) {
           const inicio = new Date(t.fechaCreacion).getTime();
           const fin = new Date(t.fechaCierre).getTime();
           if (!isNaN(inicio) && !isNaN(fin) && fin >= inicio) {
               tiempoTotalMs += (fin - inicio);
               ticketsResueltos += 1;
           }
        }
      }

      if (t.fechaCreacion) {
        const fecha = new Date(t.fechaCreacion);
        if (!isNaN(fecha.getTime())) {
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const monthKey = `${year}-${month}`; 
            
            if (!conteoPorMes[monthKey]) conteoPorMes[monthKey] = 0;
            conteoPorMes[monthKey] += 1;
        }
      }

      const nombreCategoria = t.category?.name || "General";
      if (!conteoPorCategoria[nombreCategoria]) conteoPorCategoria[nombreCategoria] = 0;
      conteoPorCategoria[nombreCategoria] += 1;

      const asistencia = t.tipoAsistencia || "Sin definir";
      if (!conteoAsistencia[asistencia]) conteoAsistencia[asistencia] = 0;
      conteoAsistencia[asistencia] += 1;

      const ubi = t.ubicacion || "Desconocida";
      if (!conteoUbicacion[ubi]) conteoUbicacion[ubi] = 0;
      conteoUbicacion[ubi] += 1;
    });

    let promedioResolucion = "Sin cierres registrados";
    if (ticketsResueltos > 0) {
      const horas = (tiempoTotalMs / ticketsResueltos) / (1000 * 60 * 60);
      promedioResolucion = horas < 24 ? `${horas.toFixed(1)} hs` : `${(horas / 24).toFixed(1)} días`;
    }

    const porcentajeGuardia = totalTickets > 0 ? ((ticketsGuardia / totalTickets) * 100).toFixed(1) : "0";

    const graficoTecnicos = Object.entries(conteoPorTecnico).map(([nombre, stats]) => ({
      nombre, creados: stats.creados, cerrados: stats.cerrados
    })).sort((a, b) => b.creados - a.creados);

    const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const graficoMeses = Object.entries(conteoPorMes)
      .sort(([a], [b]) => a.localeCompare(b)) 
      .map(([key, cantidad]) => {
         const [year, month] = key.split('-');
         const nombreMes = nombresMeses[parseInt(month, 10) - 1];
         return { mes: `${nombreMes} ${year.slice(2)}`, cantidad };
      });
    if (graficoMeses.length === 1) graficoMeses.unshift({ mes: "Inicio", cantidad: 0 });

    const graficoCategorias = Object.entries(conteoPorCategoria)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);

    const graficoAsistencia = Object.entries(conteoAsistencia).map(([name, cantidad]) => ({ name, cantidad }));
    
    const graficoUbicacion = Object.entries(conteoUbicacion)
      .map(([id, cantidad]) => ({ id, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return {
      metricas: { promedioResolucion, porcentajeGuardia, ticketsGuardia },
      graficoSector: topSectores,
      graficoUrgencia,
      graficoTecnicos,
      graficoMeses,
      graficoCategorias,
      graficoAsistencia,
      graficoUbicacion
    };
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error);
    return { error: true };
  }
}