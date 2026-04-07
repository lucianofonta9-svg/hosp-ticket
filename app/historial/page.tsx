"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { obtenerHistorialTickets, eliminarTicket, reabrirTicket } from '../actions';

export default function HistorialPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filtroSector, setFiltroSector] = useState("");

  // Función para refrescar la lista después de una acción
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

  const ticketsFiltrados = tickets.filter(t => 
    t.sector.toLowerCase().includes(filtroSector.toLowerCase())
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
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Historial de Tickets</h1>
      </div>

      <div className="max-w-6xl mx-auto">
        <input 
          type="text" 
          placeholder="Filtrar por sector..." 
          className="w-full p-3 mb-6 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
          value={filtroSector}
          onChange={(e) => setFiltroSector(e.target.value)}
        />
  
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className="w-32" /> 
              <col className="w-48" /> 
              <col className="w-auto" /> 
              <col className="w-32" /> 
              <col className="w-44" /> 
            </colgroup>
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Finalizado</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sector</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-orange-400">Tiempo</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Gestión</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-400 italic font-medium">
                    No hay registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                ticketsFiltrados.map((t) => (
                  <tr key={t.id} className={`border-b border-gray-100 hover:bg-slate-50 transition-colors h-16 ${t.es_guardia ? 'bg-red-50/50' : ''}`}>
                    <td className="p-4 text-[11px] text-gray-500 font-mono">
                      {new Date(t.fecha_cierre).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 truncate">
                      <span className="font-bold text-sm text-slate-700">{t.sector}</span>
                      {t.es_guardia && (
                        <span className="ml-2 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[8px] font-black animate-pulse">
                          G
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs italic text-gray-500 truncate">
                      "{t.descripcion}"
                    </td>
                    <td className="p-4 font-mono font-bold text-blue-700 text-xs">
                      {calcularDuracion(t.fecha_creacion, t.fecha_cierre)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* BOTÓN EDITAR */}
                        <Link 
                          href={`/nuevo?edit=${t.id}`}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all shadow-sm"
                          title="Corregir datos"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                          </svg>
                        </Link>

                        {/* BOTÓN REABRIR */}
                        <button 
                          onClick={() => manejarReabrir(t.id)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-all shadow-sm"
                          title="Reabrir ticket"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                          </svg>
                        </button>

                        {/* BOTÓN ELIMINAR */}
                        <button 
                          onClick={() => confirmarEliminar(t.id)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all shadow-sm"
                          title="Eliminar permanentemente"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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