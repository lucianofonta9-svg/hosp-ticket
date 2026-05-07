"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { obtenerHistorialTickets, eliminarTicket, reabrirTicket } from '../actions';

export default function HistorialPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filtroGeneral, setFiltroGeneral] = useState("");
  const [logsAbiertos, setLogsAbiertos] = useState<number | null>(null);
  const [descripcionesAbiertas, setDescripcionesAbiertas] = useState<number[]>([]);

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

  const alternarDescripcion = (id: number) => {
    setDescripcionesAbiertas(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

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
    return `${horas}h ${minutos}m`;
  };

  const formatearHoraLog = (fecha: string | Date) => {
    return new Intl.DateTimeFormat('es-AR', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    }).format(new Date(fecha));
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA IDÉNTICA AL HOME */}
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-300">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Historial de Soporte
          </h1>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border text-sm font-bold text-gray-500">
            {ticketsFiltrados.length} Registros Encontrados
          </div>
        </div>

        {/* Buscador alineado a la izquierda */}
        <div className="w-full max-w-md mb-6">
          <input 
            type="text" 
            placeholder="Buscar por sector o descripción..." 
            className="w-full p-3 px-5 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-sm transition-all"
            value={filtroGeneral}
            onChange={(e) => setFiltroGeneral(e.target.value)}
          />
        </div>
  
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className="w-16" /> 
              <col className="w-40" /> 
              <col className="w-40" /> 
              <col className="w-40" /> 
              <col className="w-32" /> 
              <col className="w-auto" /> 
              <col className="w-28" /> 
              <col className="w-44" /> 
            </colgroup>
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Creado</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cerrado</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sector</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-emerald-400">Cat.</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-orange-400">Total</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ticketsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-20 text-center text-gray-400 italic font-medium">
                    No hay registros coincidentes.
                  </td>
                </tr>
              ) : (
                ticketsFiltrados.map((t) => {
                  const descAbierta = descripcionesAbiertas.includes(t.id);
                  const logsAbiertosFila = logsAbiertos === t.id;

                  return (
                    <React.Fragment key={t.id}>
                      <tr className={`hover:bg-slate-50 transition-colors ${t.es_guardia ? 'bg-red-50/30' : ''}`}>
                        <td className="p-4 text-[10px] font-bold text-slate-400">#{t.id}</td>
                        <td className="p-4 text-[10px] text-gray-500 font-mono italic">
                          {new Date(t.fecha_creacion).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-[10px] text-gray-500 font-mono italic">
                          {new Date(t.fecha_cierre).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4">
                          <span className="font-black text-xs text-slate-700 leading-tight uppercase tracking-tighter">{t.sector}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-[9px] font-black text-emerald-700 uppercase">{t.category?.name || "Gral"}</span>
                        </td>
                        
                        <td className="p-4 align-top">
                          <div className="flex flex-col">
                            <p className={`text-[11px] text-gray-600 leading-snug break-words ${!descAbierta ? 'truncate line-clamp-1' : 'whitespace-normal'}`}>
                              "{t.descripcion}"
                            </p>
                            <button 
                              onClick={() => alternarDescripcion(t.id)}
                              className="text-blue-600 text-[8px] font-black uppercase mt-1 hover:underline w-fit"
                            >
                              {descAbierta ? 'Ver menos -' : 'Ver más +'}
                            </button>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-black text-blue-700 text-[10px]">
                          {calcularDuracion(t.fecha_creacion, t.fecha_cierre)}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => setLogsAbiertos(logsAbiertosFila ? null : t.id)}
                              className={`p-1.5 rounded-md transition-all border ${logsAbiertosFila ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-gray-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'}`}
                              title="Trayectoria"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            </button>

                            <Link href={`/nuevo?edit=${t.id}`} className="p-1.5 bg-white border border-gray-200 text-slate-500 rounded-md hover:text-blue-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                              </svg>
                            </Link>

                            <button onClick={() => manejarReabrir(t.id)} className="p-1.5 bg-white border border-gray-200 text-slate-500 rounded-md hover:text-emerald-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                              </svg>
                            </button>

                            <button onClick={() => confirmarEliminar(t.id)} className="p-1.5 bg-white border border-gray-200 text-slate-500 rounded-md hover:text-red-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* TRAYECTORIA MÁS ANCHA Y CENTRADA */}
                      {logsAbiertosFila && (
                        <tr className="bg-slate-50 animate-in fade-in slide-in-from-top-1 duration-200">
                          <td colSpan={8} className="p-6 border-b border-gray-200">
                            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest border-b pb-2 flex justify-between">
                                Trayectoria completa del ticket <span>ID: #{t.id}</span>
                              </p>
                              <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                {t.logs?.map((log: any) => (
                                  <div key={log.id} className="flex items-center gap-6 relative pl-10">
                                    <div className="absolute left-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                                    <span className="text-[11px] font-bold text-slate-500 w-32 shrink-0 italic">{formatearHoraLog(log.fecha)}</span>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-md uppercase min-w-[100px] text-center ${
                                      log.estado === 'CREADO' ? 'bg-blue-100 text-blue-700' :
                                      log.estado === 'FINALIZADO' || log.estado === 'RESUELTO' ? 'bg-emerald-100 text-emerald-700' :
                                      log.estado === 'PAUSADO' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {log.estado}
                                    </span>
                                    <span className="text-sm text-gray-600 italic">
                                      Acción realizada por: <span className="font-bold text-slate-800 not-italic">{log.tecnico}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}