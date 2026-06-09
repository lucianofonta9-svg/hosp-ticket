"use client";
import React, { useState, useEffect } from 'react';
import { obtenerDatosDashboard } from '../actions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend } from 'recharts';
import { UBICACIONES } from '../../constants/ubicaciones';

const COLORES_URGENCIA: Record<string, string> = {
  "BAJA": "#10b981",
  "MEDIA": "#f59e0b",
  "CRITICA": "#ef4444",
};

const COLORES_ASISTENCIA: Record<string, string> = {
  "PRESENCIAL": "#3b82f6",
  "REMOTA": "#8b5cf6",
  "Sin definir": "#cbd5e1"
};

export default function DashboardPage() {
  const [datos, setDatos] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    
    const cargarDatos = () => {
      obtenerDatosDashboard().then((res) => {
        setDatos(res);
        setCargando(false);
      });
    };

    
    cargarDatos();

    
    const intervalo = setInterval(cargarDatos, 60000);

    
    return () => clearInterval(intervalo);
  }, []);

  const alternarPantallaCompleta = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  if (cargando) {
    return <div className="h-screen w-screen bg-gray-900 flex justify-center items-center font-bold text-slate-400 font-sans">Cargando métricas...</div>;
  }

  if (!datos || datos.error) {
    return (
      <div className="h-screen w-screen bg-gray-200 flex justify-center items-center font-sans">
        <p className="text-red-500 font-bold">Error cargando los datos. Revisá la consola.</p>
      </div>
    );
  }

  const graficoUbicacionFormateado = datos.graficoUbicacion.map((u: any) => ({
    nombre: UBICACIONES.find(ubi => ubi.id === Number(u.id))?.nombre || "Otros",
    cantidad: u.cantidad
  }));

  return (
    <div className="h-screen w-full bg-gray-200 p-3 flex flex-col overflow-hidden font-sans">
      
      {/* CABECERA Y MÉTRICAS */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-3 h-auto lg:h-14 shrink-0 px-2 gap-2 lg:gap-0">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard 📊</h1>
        
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-2 lg:gap-4 w-full lg:w-auto">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-300 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">Tiempo promedio de resolución</span>
            <span className="text-xl font-bold text-emerald-600">{datos.metricas.promedioResolucion}</span>
          </div>

          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-300 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">Porcentaje de tickets de guardia</span>
            <span className="text-xl font-bold text-red-600">{datos.metricas.porcentajeGuardia}%</span>
          </div>

          <button 
            onClick={alternarPantallaCompleta}
            className="bg-slate-800 hidden md:inline hover:bg-slate-700 text-white p-3 rounded-xl transition-colors shadow-md"
            title="Pantalla Completa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 ">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* GRILLA DE GRÁFICOS RESPONSIVA */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-3 min-h-0 overflow-y-auto lg:overflow-visible pb-10 lg:pb-0">
        
        {/* FILA 1 */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[250px] lg:min-h-0">
          <h2 className="text-[10px] font-bold uppercase text-slate-500 tracking-tight text-center mb-1">Urgencia</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart className="font-sans">
                <Pie data={datos.graficoUrgencia} cx="50%" cy="45%" innerRadius="45%" outerRadius="75%" paddingAngle={4} dataKey="cantidad">
                  {datos.graficoUrgencia.map((entry: any, index: number) => <Cell key={index} fill={COLORES_URGENCIA[entry.name] || "#cbd5e1"} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[250px] lg:min-h-0">
          <h2 className="text-[10px] font-bold uppercase text-slate-500 tracking-tight text-center mb-1">Asistencia</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart className="font-sans">
                <Pie data={datos.graficoAsistencia} cx="50%" cy="45%" innerRadius="45%" outerRadius="75%" paddingAngle={4} dataKey="cantidad">
                  {datos.graficoAsistencia.map((entry: any, index: number) => <Cell key={index} fill={COLORES_ASISTENCIA[entry.name] || "#cbd5e1"} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[250px] lg:min-h-0">
          <h2 className="text-[10px] font-bold uppercase text-slate-500 tracking-tight mb-1">Categorías mas frecuentes</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos.graficoCategorias} layout="vertical" margin={{ top: 5, right: 15, left: 5, bottom: 5 }} className="font-sans">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{fontSize: 10, className: 'font-sans'}} allowDecimals={false} />
                <YAxis dataKey="nombre" type="category" tick={{fontSize: 9, className: 'font-sans'}} width={130} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="cantidad" name="Tickets" fill="#f43f5e" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILA 2 */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[250px] lg:min-h-0">
          <h2 className="text-[10px] font-bold uppercase text-slate-500 tracking-tight mb-1">Sectores con mas demanda</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos.graficoSector} margin={{ top: 5, right: 5, left: -25, bottom: 15 }} className="font-sans">
                <XAxis dataKey="nombre" tick={{fontSize: 9, className: 'font-sans'}} interval={0} angle={-20} textAnchor="end" height={35} />
                <YAxis tick={{fontSize: 10, className: 'font-sans'}} allowDecimals={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[250px] lg:min-h-0">
          <h2 className="text-[10px] font-bold uppercase text-slate-500 tracking-tight mb-1">Efectores con mas demanda</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graficoUbicacionFormateado} margin={{ top: 5, right: 5, left: -25, bottom: 15 }} className="font-sans">
                <XAxis dataKey="nombre" tick={{fontSize: 9, className: 'font-sans'}} interval={0} angle={-20} textAnchor="end" height={35} />
                <YAxis tick={{fontSize: 10, className: 'font-sans'}} allowDecimals={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="cantidad" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[250px] lg:min-h-0">
          <h2 className="text-[10px] font-bold uppercase text-slate-500 tracking-tight mb-1">Tickets creados/cerrados por técnico</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos.graficoTecnicos} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} className="font-sans">
                <XAxis dataKey="nombre" tick={{fontSize: 10, className: 'font-sans'}} />
                <YAxis tick={{fontSize: 10, className: 'font-sans'}} allowDecimals={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }} />
                <Bar dataKey="creados" name="Creados" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="cerrados" name="Resueltos" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[250px] lg:min-h-0">
          <h2 className="text-[10px] font-bold uppercase text-slate-500 tracking-tight mb-1">Evolución Histórica</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datos.graficoMeses} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} className="font-sans">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{fontSize: 10, className: 'font-sans'}} />
                <YAxis tick={{fontSize: 10, className: 'font-sans'}} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="cantidad" name="Tickets" stroke="#8b5cf6" fill="#c4b5fd" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}