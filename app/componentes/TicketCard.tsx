"use client";
import { useState } from 'react';
import Timer from './Timer';
import Link from 'next/link';
import { eliminarTicket } from '../actions'; 

export default function TicketCard({ ticket, finalizarAction }: { ticket: any, finalizarAction: any }) {
  const [expandido, setExpandido] = useState(false);

  // Verifica si el texto es largo (más de 100 caracteres)
  const esLargo = ticket.descripcion.length > 100;

  // Función para manejar la eliminación con confirmación
  const confirmarEliminar = async () => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este ticket permanentemente?");
    if (confirmar) {
      await eliminarTicket(ticket.id);
    }
  };

  return (
    <div className={`flex flex-col justify-between p-5 rounded-2xl shadow-sm border-l-10px bg-white transition-all ${
      ticket.es_guardia ? 'border-red-600' : 'border-blue-500'
    } ${expandido ? 'h-auto min-h-64' : 'h-64'}`}>
      
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Sector {ticket.interno && `| Int: ${ticket.interno}`}
          </span>
          {ticket.es_guardia && (
            <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
              GUARDIA
            </span>
          )}
        </div>
        
        <h2 className="text-xl font-black text-slate-900 leading-tight truncate">
          {ticket.sector}
        </h2>
        
        <p className={`mt-3 text-sm text-gray-600 italic leading-snug ${!expandido && 'line-clamp-3'}`}>
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </Link>

          {/* Botón Eliminar */}
          <button 
            onClick={confirmarEliminar}
            className="bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 p-2 rounded-xl transition-colors shadow-sm border border-slate-200"
            title="Eliminar ticket"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9l-.34 9m-4.74 0l-.34-9m9.27-3.91L18.74 21a2 2 0 0 1-2 2H7.26a2 2 0 0 1-2-2L5.26 5.09m4.13-3.09h4.22a2 2 0 0 1 2 2v.92m-9.22 0h11.22" />
            </svg>
          </button>

          <div className="flex flex-col ml-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Tiempo</span>
            <div className="text-blue-700 font-mono font-bold text-sm leading-none">
              <Timer inicio={ticket.fecha_creacion} />
            </div>
          </div>
        </div>

        <form action={finalizarAction}>
          <input type="hidden" name="id" value={ticket.id} />
          <button 
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95 uppercase"
          >
            Finalizar
          </button>
        </form>
      </div>
    </div>
  );
}