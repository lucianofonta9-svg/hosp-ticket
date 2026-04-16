"use client";
import { useState } from 'react';
import Timer from './Timer';
import Link from 'next/link';
import { eliminarTicket, cambiarEstadoTicket } from '../actions'; 

export default function TicketCard({ ticket, finalizarAction }: { ticket: any, finalizarAction: any }) {
  const [expandido, setExpandido] = useState(false);

  const esLargo = ticket.descripcion.length > 100;
  const esPausado = ticket?.estado === "PAUSADO";

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

  return (
    <div className={`flex flex-col justify-between p-5 rounded-2xl shadow-sm border-l-10px transition-all ${
      esPausado ? 'bg-gray-100 border-gray-400 opacity-80' : 
      ticket.es_guardia ? 'bg-white border-red-600' : 'bg-white border-blue-500'
    } ${expandido ? 'h-auto min-h-64' : 'h-64'}`}>
      
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {ticket.ubicacion} {ticket.interno && `| Int: ${ticket.interno}`}
          </span>
          <div className="flex gap-1">
            {esPausado && (
              <span className="bg-gray-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                Pausado
              </span>
            )}
            {ticket.es_guardia && (
              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase">
                Guardia
              </span>
            )}
          </div>
        </div>
        
        <h2 className={`text-xl font-black leading-tight truncate ${esPausado ? 'text-gray-500' : 'text-slate-900'}`}>
          {ticket.sector}
        </h2>

        {/* Muestra quién solicita el ticket */}
        <p className={`text-[10px] font-bold uppercase mt-1 ${esPausado ? 'text-gray-400' : 'text-blue-600'}`}>
          Solicita: {ticket.usuario_solicita}
        </p>
        
        <p className={`mt-2 text-sm leading-snug ${esPausado ? 'text-gray-400 italic' : 'text-gray-600 italic'} ${!expandido && 'line-clamp-2'}`}>
          "{ticket.descripcion}"
        </p>

        {esLargo && (
          <button 
            onClick={() => setExpandido(!expandido)}
            className="text-blue-600 text-[10px] font-bold mt-1 hover:underline uppercase"
          >
            {expandido ? 'Ver menos -' : 'Ver más +'}
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-4 border-gray-100">
        <div className="flex items-center gap-2">
          {/* Botón Editar */}
          <Link 
            href={`/nuevo?edit=${ticket.id}`}
            className="bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 p-2 rounded-xl transition-colors shadow-sm border border-slate-200"
            title="Editar ticket"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </Link>

          {/* Botón Pausar/Reanudar */}
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>
            )}
          </button>

          {/* Botón Eliminar */}
          <button 
            onClick={confirmarEliminar}
            className="bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 p-2 rounded-xl transition-colors shadow-sm border border-slate-200"
            title="Eliminar ticket"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9l-.34 9m-4.74 0l-.34-9m9.27-3.91L18.74 21a2 2 0 0 1-2 2H7.26a2 2 0 0 1-2-2L5.26 5.09m4.13-3.09h4.22a2 2 0 0 1 2 2v.92m-9.22 0h11.22" />
            </svg>
          </button>

          <div className="flex flex-col ml-1">
            <span className="text-[9px] text-gray-400 font-bold uppercase leading-none mb-1">Tiempo</span>
            <div className={`font-mono font-bold text-sm leading-none ${esPausado ? 'text-gray-400' : 'text-blue-700'}`}>
              <Timer inicio={ticket.fecha_creacion} pausado={esPausado} />
            </div>
          </div>
        </div>

        {/* Solo mostramos el botón finalizar si NO está pausado */}
        {!esPausado && (
          <form action={finalizarAction}>
            <input type="hidden" name="id" value={ticket.id} />
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-2 px-3 rounded-xl transition-all shadow-md active:scale-95 uppercase"
            >
              Finalizar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}