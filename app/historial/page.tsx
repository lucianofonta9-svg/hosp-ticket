"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { obtenerHistorialTickets, eliminarTicket, reabrirTicket } from '../actions';

export default function HistorialPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filtroGeneral, setFiltroGeneral] = useState("");

  const cargarTickets = () => {
    obtenerHistorialTickets().then(setTickets);
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const confirmarEliminar = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este registro permanentemente?")) {
      await eliminarTicket(id);
      cargarTickets();
    }
  };

  const manejarReabrir = async (id: number) => {
    if (window.confirm("¿Deseas reabrir este ticket? Volverá al panel de pendientes.")) {
      await reabrirTicket(id);
      cargarTickets();
    }
  };

  // Filtro más potente que busca en sector o descripción
  const ticketsFiltrados = tickets.filter(t => 
    t.sector.toLowerCase().includes(filtroGeneral.toLowerCase()) ||
    t.descripcion.toLowerCase().includes(filtroGeneral.toLowerCase())
  );

  const calcularDuracion = (inicioStr: string, finStr: string | null) => {
    if (!finStr) return "N/A";
    const inicio = new Date(inicioStr);
    const fin = new Date(finStr);
    const diffMs = fin.getTime() - inicio.getTime();
    const totalSegundos = Math.floor(diffMs / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    return `${horas}h ${minutos}m ${segundos}s`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="flex justify-center items-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Historial Completo</h1>
      </div>

      <div className="max-w-7xl mx-auto">
        <input 
          type="text" 
          placeholder="Buscar por sector o descripción..." 
          className="w-full p-3 mb-6 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
          value={filtroGeneral}
          onChange={(e) => setFiltroGeneral(e.target.value)}
        />
  
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className="w-16" /> {/* ID */}
              <col className="w-32" /> {/* Inicio */}
              <col className="w-32" /> {/* Fin */}
              <col className="w-40" /> {/* Sector */}
              <col className="w-36" /> {/* Categoría */}
              <col className="w-auto" /> {/* Descripción */}
              <col className="w-28" /> {/* Tiempo */}
              <col className="w-40" /> {/* Gestión */}
            </colgroup>
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Creado</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cerrado</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sector</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-emerald-400">Categoría</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-orange-400">Total</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-20 text-center text-gray-400 italic font-medium">
                    No hay registros disponibles.
                  </td>
                </tr>
              ) : (
                ticketsFiltrados.map((t) => (
                  <tr key={t.id} className={`border-b border-gray-100 hover:bg-slate-50 transition-colors h-16 ${t.es_guardia ? 'bg-red-50/50' : ''}`}>
                    <td className="p-4 text-[10px] font-bold text-slate-400">#{t.id}</td>
                    
                    <td className="p-4 text-[10px] text-gray-500 font-mono">
                      {new Date(t.fecha_creacion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="p-4 text-[10px] text-gray-500 font-mono">
                      {new Date(t.fecha_cierre).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} {new Date(t.fecha_cierre).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="p-4 truncate">
                      <span className="font-bold text-xs text-slate-700">{t.sector}</span>
                      {t.es_guardia && (
                        <span className="ml-1 bg-red-600 text-white px-1 py-0.5 rounded text-[7px] font-black">G</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                        {t.category?.name || "General"}
                      </span>
                    </td>

                    <td className="p-4 text-[11px] text-gray-600 truncate" title={t.descripcion}>
                      {t.descripcion}
                    </td>

                    <td className="p-4 font-mono font-black text-blue-700 text-[10px]">
                      {calcularDuracion(t.fecha_creacion, t.fecha_cierre)}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link href={`/nuevo?edit=${t.id}`} className="p-1.5 bg-white border border-gray-200 text-slate-500 rounded-md hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                          </svg>
                        </Link>

                        <button onClick={() => manejarReabrir(t.id)} className="p-1.5 bg-white border border-gray-200 text-slate-500 rounded-md hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                          </svg>
                        </button>

                        <button onClick={() => confirmarEliminar(t.id)} className="p-1.5 bg-white border border-gray-200 text-slate-500 rounded-md hover:text-red-600 hover:border-red-200 transition-all shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}