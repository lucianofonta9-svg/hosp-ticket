"use client";
import { useState, useEffect } from 'react';
import Timer from './Timer';
import Link from 'next/link';
import { eliminarTicket, cambiarEstadoTicket, alternarDestacadoTicket } from '../actions'; 
// ESENCIAL: Importar las ubicaciones para traducir el ID numérico
import { UBICACIONES } from '../../constants/ubicaciones';

export default function TicketCard({ ticket, finalizarAction }: { ticket: any, finalizarAction: any }) {
  const [expandido, setExpandido] = useState(false);
  const [mostrarLogs, setMostrarLogs] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Estado local para forzar el cambio visual inmediato de la estrella amarilla
  const [isDestacado, setIsDestacado] = useState(ticket.destacado);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar el estado local si las propiedades del ticket cambian desde el servidor
  useEffect(() => {
    setIsDestacado(ticket.destacado);
  }, [ticket.destacado]);

  const esLargo = ticket.descripcion.length > 80; 
  const esPausado = ticket?.estado === "PAUSADO";

  // ESENCIAL: Traducir el ID al nombre real para la interfaz
  const obtenerNombreUbicacion = (idString: string) => {
    const idNumero = Number(idString);
    const lugar = UBICACIONES.find(u => u.id === idNumero);
    return lugar ? lugar.nombre : "Ubicación Desconocida";
  };

  const confirmarEliminar = async () => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este ticket permanentemente?");
    if (confirmar) {
      await eliminarTicket(ticket.id);
    }
  };

  const alternarPausa = async () => {
    const nuevoEstado = esPausado ? "EN_PROCESO" : "PAUSADO";
    await cambiarEstadoTicket(ticket.id, nuevoEstado);
  };

  const manejarDestacado = async () => {
    // Cambio visual inmediato en el cliente
    setIsDestacado(!isDestacado);
    // Persistencia real en la base de datos de fondo
    await alternarDestacadoTicket(ticket.id, ticket.destacado);
  };

  const formatearFechaCard = (fecha: Date | string) => {
    return new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fecha));
  };

  const formatearHoraLog = (fecha: string | Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fecha));
  };
  
  // NUEVO: Función para determinar el color del borde según la urgencia
  const obtenerColorUrgencia = (urgencia: string, esGuardia: boolean) => {
    if (urgencia === "CRITICA") return "border-red-500";
    if (urgencia === "MEDIA") return "border-amber-500";
    if (urgencia === "BAJA") return "border-emerald-500";
    // Si no tiene urgencia o es un ticket de guardia genérico, usa rojo o azul por defecto
    return esGuardia ? "border-red-600" : "border-blue-500";
  };

  return (
    <div className={`flex flex-col justify-between p-5 rounded-2xl shadow-sm border-l-10 transition-all ${
      esPausado ? 'bg-gray-100 border-gray-400 opacity-80' : `bg-white ${obtenerColorUrgencia(ticket.urgencia, ticket.esGuardia)}`
    } ${expandido || mostrarLogs ? 'h-auto' : 'h-70'}`}>
      
      <div className="w-full">
        <div className="flex justify-between items-start ">
          <div className="flex flex-col gap-1 w-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {obtenerNombreUbicacion(ticket.ubicacion)} {ticket.interno && `| Interno: ${ticket.interno}`}
            </span>
          </div>

          <div className="flex gap-1">
            {esPausado && (
              <span className="bg-gray-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                Pausado
              </span>
            )}
            {ticket.esGuardia && (
              <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse uppercase">
                Guardia
              </span>
            )}
          </div>
        </div>
        
        <h2 className={`text-xl mb-2 mt-2 font-bold leading-tight truncate ${esPausado ? 'text-gray-500' : 'text-slate-900'}`}>
          {ticket.sector}
        </h2>

        <p className={`text-sm leading-snug break-words ${esPausado ? 'text-gray-400 italic' : 'text-gray-600 italic'} ${!expandido ? 'line-clamp-2' : ''}`}>
          "{ticket.descripcion}"
        </p>

        {esLargo && (
          <button 
            onClick={() => setExpandido(!expandido)}
            className="text-blue-600 text-[10px] font-bold mt-2 hover:underline uppercase block"
          >
            {expandido ? 'Ver menos -' : 'Ver más +'}
          </button>
        )}

        {/* HISTORIAL CRONOLÓGICO */}
        {mostrarLogs && ticket.logs && (
          <div className="mt-4 pt-3 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Trayectoria</p>
            <div className="space-y-3 relative before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-100">
              {ticket.logs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 relative pl-5">
                  <div className="absolute left-0 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                  <span className="text-[10px] font-bold text-blue-600 w-10">{formatearHoraLog(log.fecha)}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    log.estado === 'CREADO' ? 'bg-blue-100 text-blue-700' :
                    log.estado === 'EDITADO' ? 'bg-purple-100 text-purple-700' :
                    log.estado === 'REANUDADO' ? 'bg-indigo-100 text-indigo-700' :
                    log.estado === 'PAUSADO' ? 'bg-orange-100 text-orange-700' :
                    log.estado === 'EN_PROCESO' ? 'bg-sky-100 text-sky-700' :
                    log.estado === 'FINALIZADO' || log.estado === 'RESUELTO' ? 'bg-emerald-100 text-emerald-700' :
                    log.estado === 'ELIMINADO' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                    {log.estado}
                  </span>
                  <span className="text-[10px] text-gray-500 italic truncate">por {log.tecnico}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BLOQUE DE ACCIONES REORGANIZADO */}
      <div className="mt-4 flex flex-col gap-3 border-t pt-4 border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link 
              href={`/nuevo?edit=${ticket.id}`}
              className="bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 p-2 rounded-xl transition-colors shadow-sm border border-slate-200"
              title="Editar ticket"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </Link>

            <button 
              onClick={() => setMostrarLogs(!mostrarLogs)}
              className={`p-2 rounded-xl transition-all shadow-sm border ${
                mostrarLogs 
                  ? 'bg-blue-600 border-blue-700 text-white shadow-blue-200' 
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
              }`}
              title="Ver trayectoria"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>
            
            <button 
              onClick={alternarPausa}
              className={`p-2 rounded-xl transition-colors shadow-sm border ${
                esPausado 
                ? 'bg-orange-100 border-orange-200 text-orange-600 hover:bg-orange-200' 
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-orange-50 hover:text-orange-500'
              }`}
              title={esPausado ? "Reanudar ticket" : "Pausar ticket"}
            >
              {esPausado ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              )}
            </button>
            
            <button 
              onClick={manejarDestacado}
              className={`p-2 rounded-xl transition-colors shadow-sm border ${
                isDestacado 
                ? 'bg-amber-100 border-amber-300 text-amber-500 hover:bg-amber-200' 
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-500'
              }`}
              title={isDestacado ? "Quitar destacado" : "Destacar ticket"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill={isDestacado ? "currentColor" : "none"} 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className={`w-4 h-4 ${isDestacado ? 'fill-amber-400 text-amber-500' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.316.604-.316.756 0l2.22 4.502 4.968.721c.354.051.496.489.24.741l-3.597 3.507 1.056 4.951c.075.354-.297.625-.615.457L12 15.698l-4.444 2.333c-.318.168-.693-.103-.615-.457l1.056-4.951-3.597-3.507c-.256-.252-.114-.69.24-.741l4.968-.721 2.22-4.502Z" />
              </svg>
            </button>

            <button 
              onClick={confirmarEliminar}
              className="bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 p-2 rounded-xl transition-colors shadow-sm border border-slate-200"
              title="Eliminar ticket"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9l-.34 9m-4.74 0l-.34-9m9.27-3.91L18.74 21a2 2 0 0 1-2 2H7.26a2 2 0 0 1-2-2L5.26 5.09m4.13-3.09h4.22a2 2 0 0 1 2 2v.92m-9.22 0h11.22" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col ml-1 items-end">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-tight leading-none mb-1">Creado:</span>
            <span className="text-xs font-bold text-slate-700 py-0.5 rounded font-mono">
              {mounted ? formatearFechaCard(ticket.fechaCreacion) : '--/-- --:--'}
            </span>
          </div>
        </div>

        {/* Fila inferior unificada: Datos a la izquierda, botón a la derecha */}
        <div className="flex justify-between items-end mt-2 pt-1">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-tight leading-none">Urgencia:
              <span className={`px-1 py-0.2 rounded-full text-[9px] font-bold uppercase border ml-1 ${
                  ticket.urgencia === 'CRITICA' ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' :
                  ticket.urgencia === 'MEDIA' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}>
                {ticket.urgencia}
              </span>
            </p>
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-tight leading-none">
              Solicita: <span className="text-slate-600 font-bold">{ticket.usuarioSolicita}</span>
            </p>
          </div>

          {!esPausado && (
            <form action={finalizarAction}>
              <input type="hidden" name="id" value={ticket.id} />
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-2 px-3 rounded-xl transition-all shadow-md active:scale-95 uppercase w-auto"
              >
                Finalizar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}