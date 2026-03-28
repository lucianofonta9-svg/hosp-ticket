"use client";
import { useState, useEffect } from 'react';
import { obtenerHistorialTickets } from '../actions';
import Link from 'next/link';

export default function HistorialPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filtroSector, setFiltroSector] = useState("");

  useEffect(() => {
    obtenerHistorialTickets().then(setTickets);
  }, []);

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
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Historial de Tickets</h1>
          <Link href="/tickets" className="text-blue-600 hover:underline">← Volver</Link>
        </div>

        <input 
          type="text" 
          placeholder="Buscar por sector..." 
          className="w-full p-2 mb-4 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={filtroSector}
          onChange={(e) => setFiltroSector(e.target.value)}
        />

        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          {/* Clave: table-fixed y anchos definidos en el colgroup */}
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className="w-40" /> 
              <col className="w-56" /> 
              <col className="w-auto" /> 
              <col className="w-36" /> 
            </colgroup>
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-4 text-xs font-bold uppercase">Finalizado</th>
                <th className="p-4 text-xs font-bold uppercase">Sector</th>
                <th className="p-4 text-xs font-bold uppercase">Descripción</th>
                <th className="p-4 text-xs font-bold uppercase text-orange-400">Tiempo Total</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400 italic">
                    No se encontraron tickets.
                  </td>
                </tr>
              ) : (
                ticketsFiltrados.map((t) => (
                  <tr key={t.id} className={`border-b hover:bg-gray-50 h-16 ${t.es_guardia ? 'bg-red-50' : ''}`}>
                    <td className="p-4 text-xs text-gray-500 truncate">
                      {new Date(t.fecha_cierre).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 truncate">
                      <span className="font-bold text-sm">{t.sector}</span>
                      {t.es_guardia && (
                        <span className="ml-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] font-black">
                          G
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm italic text-gray-600 truncate">
                      {t.descripcion}
                    </td>
                    <td className="p-4 font-mono font-bold text-blue-700 text-sm whitespace-nowrap">
                      {calcularDuracion(t.fecha_creacion, t.fecha_cierre)}
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