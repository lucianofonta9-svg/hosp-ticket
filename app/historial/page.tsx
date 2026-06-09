"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { obtenerHistorialTickets, eliminarTicket, reabrirTicket, alternarDestacadoTicket, obtenerCategorias } from '../actions';
import { UBICACIONES } from '../../constants/ubicaciones';


export default function HistorialPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filtroGeneral, setFiltroGeneral] = useState("");
  const [logsAbiertos, setLogsAbiertos] = useState<number | null>(null);
  const [descripcionesAbiertas, setDescripcionesAbiertas] = useState<number[]>([]);

  // Estados para los filtros
  const [filtrosVisibles, setFiltrosVisibles] = useState(false); // Nuevo estado para ocultar/mostrar panel
  const [categorias, setCategorias] = useState<any[]>([]);
  const [filtroUbicacion, setFiltroUbicacion] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroUrgencia, setFiltroUrgencia] = useState("");
  const [filtroSector, setFiltroSector] = useState("");
  const [filtroAsistencia, setFiltroAsistencia] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [soloDestacados, setSoloDestacados] = useState(false);
  const [ordenFecha, setOrdenFecha] = useState("creacion_desc");

  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 50;

  const cargarTickets = () => {
    obtenerHistorialTickets().then(setTickets);
  };

  useEffect(() => {
    cargarTickets();
    obtenerCategorias().then(setCategorias);
  }, []);

  // Resetear a la página 1 cuando cambie cualquier filtro u orden
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroGeneral, filtroUbicacion, filtroCategoria, filtroUrgencia, filtroSector, filtroAsistencia, fechaInicio, fechaFin, soloDestacados, ordenFecha]);

  const limpiarFiltros = () => {
    setFiltroGeneral("");
    setFiltroUbicacion("");
    setFiltroCategoria("");
    setFiltroUrgencia("");
    setFiltroSector("");
    setFiltroAsistencia("");
    setFechaInicio("");
    setFechaFin("");
    setSoloDestacados(false);
    setOrdenFecha("creacion_desc");
    setPaginaActual(1);
  };

  const confirmarEliminar = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este registro? Pasará al estado de Eliminado.")) {
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

  const manejarDestacado = async (id: number, estadoActual: boolean) => {
    await alternarDestacadoTicket(id, estadoActual);
    cargarTickets(); 
  };

  const alternarDescripcion = (id: number) => {
    setDescripcionesAbiertas(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const obtenerNombreUbicacion = (idString: string) => {
    const idNumero = Number(idString);
    const lugar = UBICACIONES.find(u => u.id === idNumero);
    return lugar ? lugar.nombre : "Desconocida";
  };

  const sectoresUnicos = Array.from(new Set(tickets.map(t => t.sector))).sort();

  // 1. Filtrado de todos los datos
  const ticketsFiltrados = tickets.filter(t => {
    const coincideGeneral = filtroGeneral === "" || 
      t.sector.toLowerCase().includes(filtroGeneral.toLowerCase()) ||
      t.descripcion.toLowerCase().includes(filtroGeneral.toLowerCase()) ||
      (t.solucion && t.solucion.toLowerCase().includes(filtroGeneral.toLowerCase())) ||
      t.tecnico.toLowerCase().includes(filtroGeneral.toLowerCase()) ||
      (t.usuarioSolicita && t.usuarioSolicita.toLowerCase().includes(filtroGeneral.toLowerCase()));

    const coincideUbicacion = filtroUbicacion === "" || t.ubicacion === filtroUbicacion;
    const coincideCategoria = filtroCategoria === "" || (t.category && t.category.id.toString() === filtroCategoria);
    const coincideUrgencia = filtroUrgencia === "" || t.urgencia === filtroUrgencia;
    const coincideSector = filtroSector === "" || t.sector === filtroSector;
    const coincideAsistencia = filtroAsistencia === "" || t.tipoAsistencia === filtroAsistencia;
    const coincideDestacado = soloDestacados ? t.destacado === true : true;
      
    let coincideFecha = true;
    if (fechaInicio || fechaFin) {
      const fechaTicket = new Date(t.fechaCreacion);
      if (fechaInicio) {
        const inicio = new Date(fechaInicio + "T00:00:00"); 
        if (fechaTicket < inicio) coincideFecha = false;
      }
      if (fechaFin) {
        const fin = new Date(fechaFin + "T23:59:59");
        if (fechaTicket > fin) coincideFecha = false;
      }
    }

    return coincideGeneral && coincideUbicacion && coincideCategoria && coincideUrgencia && coincideSector && coincideAsistencia && coincideDestacado && coincideFecha;
  });

  // 2. Ordenamiento de los datos filtrados
  const ticketsOrdenados = [...ticketsFiltrados].sort((a, b) => {
    if (ordenFecha === "creacion_desc") {
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
    }
    if (ordenFecha === "creacion_asc") {
      return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
    }
    
    // Para fecha de cierre, manejamos posibles nulos poniéndolos al final o al principio
    const fechaCierreA = a.fechaCierre ? new Date(a.fechaCierre).getTime() : 0;
    const fechaCierreB = b.fechaCierre ? new Date(b.fechaCierre).getTime() : 0;
    
    if (ordenFecha === "cierre_desc") {
      return fechaCierreB - fechaCierreA;
    }
    if (ordenFecha === "cierre_asc") {
      const valA = a.fechaCierre ? fechaCierreA : Infinity;
      const valB = b.fechaCierre ? fechaCierreB : Infinity;
      return valA - valB;
    }
    return 0;
  });

  // 3. Paginación aplicada sobre los datos ya filtrados y ordenados
  const totalPaginas = Math.ceil(ticketsOrdenados.length / registrosPorPagina);
  const ticketsPaginados = ticketsOrdenados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
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

  const formatearFecha = (fecha: string | Date) => {
    return new Intl.DateTimeFormat('es-AR', { 
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' 
    }).format(new Date(fecha));
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-300">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Historial 🗄️
          </h1>
          <div className="flex items-center gap-3">
            {/* BOTÓN PARA MOSTRAR/OCULTAR FILTROS */}
            <button
              onClick={() => setFiltrosVisibles(!filtrosVisibles)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors shadow-sm flex items-center gap-2 ${
                filtrosVisibles 
                ? 'bg-white  text-slate-600 hover:bg-gray-50' 
                : 'bg-white  text-slate-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
              </svg>
              <span className="hidden md:inline">
                {filtrosVisibles ? 'Ocultar Filtros' : 'Filtros'} 
              </span>
             
            </button>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border text-sm font-bold text-gray-500">
              {ticketsOrdenados.length} <span className="hidden md:inline">Registros</span> 🗂️
            </div>
          </div>
        </div>

        {/* PANEL DE FILTROS CONDICIONAL */}
        {filtrosVisibles && (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-300 mb-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Buscar texto</label>
                <input 
                  type="text" 
                  placeholder="Sector, descripción, técnico, solicitante o solución..." 
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
                  value={filtroGeneral}
                  onChange={(e) => setFiltroGeneral(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Desde</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Hasta</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Efector</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
                  value={filtroUbicacion}
                  onChange={(e) => setFiltroUbicacion(e.target.value)}
                >
                  <option value="">Todas</option>
                  {UBICACIONES.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Sector</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
                  value={filtroSector}
                  onChange={(e) => setFiltroSector(e.target.value)}
                >
                  <option value="">Todos</option>
                  {sectoresUnicos.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Categoría</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Todas</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Urgencia</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
                  value={filtroUrgencia}
                  onChange={(e) => setFiltroUrgencia(e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="CRITICA">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Asistencia</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
                  value={filtroAsistencia}
                  onChange={(e) => setFiltroAsistencia(e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="REMOTA">Remota</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Ordenar por</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
                  value={ordenFecha}
                  onChange={(e) => setOrdenFecha(e.target.value)}
                >
                  <option value="creacion_desc">Creación (Más recientes)</option>
                  <option value="creacion_asc">Creación (Más antiguos)</option>
                  <option value="cierre_desc">Cierre (Más recientes)</option>
                  <option value="cierre_asc">Cierre (Más antiguos)</option>
                </select>
              </div>

            </div>

            <div className="flex justify-between gap-1 pt-6 border-t border-gray-200">
               <button 
              onClick={() => setSoloDestacados(!soloDestacados)}
              className={`px-4 py-2 transition-colors flex items-center gap-2 p-3 border rounded-xl shadow-sm outline-none bg-white text-sm font-medium text-slate-700 ${
                soloDestacados 
                ? 'bg-amber-100 border-amber-300 text-amber-700 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill={soloDestacados ? "currentColor" : "none"} 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.316.604-.316.756 0l2.22 4.502 4.968.721c.354.051.496.489.24.741l-3.597 3.507 1.056 4.951c.075.354-.297.625-.615.457L12 15.698l-4.444 2.333c-.318.168-.693-.103-.615-.457l1.056-4.951-3.597-3.507c-.256-.252-.114-.69.24-.741l4.968-.721 2.22-4.502Z" />
              </svg>
              {soloDestacados ? 'Destacados' : 'Destacados'}
            </button>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-6 py-3 bg-gray-100 text-slate-600 rounded-xl font-bold hover:bg-gray-200 transition-all uppercase text-xs tracking-widest border border-gray-300 shadow-sm"
              >
                Limpiar Filtros 🧹
              </button>
              
            </div>
          </div>
        )}
  
        <div className="bg-white shadow-sm rounded-xl border border-gray-300 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="p-3 font-bold border-b border-slate-900">ID</th>
                <th className="p-3 font-bold border-b border-slate-900 text-center">Acciones</th>
                <th className="p-3 font-bold border-b border-slate-900 text-center">Guardia</th>
                <th className="p-3 font-bold border-b border-slate-900">Creado</th>
                <th className="p-3 font-bold border-b border-slate-900">Cerrado</th>
                <th className="p-3 font-bold border-b border-slate-900">Ubicación</th>
                <th className="p-3 font-bold border-b border-slate-900">Sector</th>
                <th className="p-3 font-bold border-b border-slate-900">Interno</th>
                <th className="p-3 font-bold border-b border-slate-900">Solicitante</th>
                <th className="p-3 font-bold border-b border-slate-900">Técnico</th>
                <th className="p-3 font-bold border-b border-slate-900">Cerrado por</th>
                <th className="p-3 font-bold border-b border-slate-900">Categoría</th>
                <th className="p-3 font-bold border-b border-slate-900">Urgencia</th>
                <th className="p-3 font-bold border-b border-slate-900">Asistencia</th>
                <th className="p-3 font-bold border-b border-slate-900">Descripción</th>
                <th className="p-3 font-bold border-b border-slate-900">Notas</th>
                <th className="p-3 font-bold border-b border-slate-900">Tiempo de resolución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ticketsPaginados.length === 0 ? (
                <tr>
                  <td colSpan={17} className="text-center py-20">
                    <p className="text-gray-400 text-lg italic">Cargando registros...</p>
                  </td>
                </tr>
              ) : (
                ticketsPaginados.map((t) => {
                  const descAbierta = descripcionesAbiertas.includes(t.id);
                  const logsAbiertosFila = logsAbiertos === t.id;
                  const esEliminado = t.estado === "ELIMINADO";

                  return (
                    <React.Fragment key={t.id}>
                      <tr className={`hover:bg-gray-50 transition-colors ${
                        esEliminado ? 'bg-gray-200/60 opacity-60 text-gray-400' : 
                        t.esGuardia ? 'bg-red-50/50 text-slate-800' : 
                        t.destacado ? 'bg-amber-50/50 text-slate-800' : 'text-slate-800'
                      }`}>
                        
                        <td className="p-3 align-top font-bold">#{t.id}</td>

                        <td className="p-3 align-top">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            {!esEliminado && (
                              <>
                                <button onClick={() => manejarDestacado(t.id, t.destacado)} className={`p-1.5 rounded-md border transition-colors shadow-sm ${t.destacado ? 'bg-amber-50 border-amber-300 text-amber-500' : 'bg-white border-gray-200 text-slate-400 hover:text-amber-500'}`} title={t.destacado ? "Quitar destacado" : "Destacar"}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill={t.destacado ? "#f59e0b" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={t.destacado ? "#f59e0b" : "currentColor"} className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.316.604-.316.756 0l2.22 4.502 4.968.721c.354.051.496.489.24.741l-3.597 3.507 1.056 4.951c.075.354-.297.625-.615.457L12 15.698l-4.444 2.333c-.318.168-.693-.103-.615-.457l1.056-4.951-3.597-3.507c-.256-.252-.114-.69.24-.741l4.968-.721 2.22-4.502Z" />
                                  </svg>
                                </button>

                                <Link href={`/nuevo?edit=${t.id}`} className="p-1.5 rounded-md bg-white border border-gray-200 text-slate-500 shadow-sm hover:text-blue-600 hover:bg-gray-50 transition-colors" title="Editar">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                  </svg>
                                </Link>
                              </>
                            )}

                            <button onClick={() => setLogsAbiertos(logsAbiertosFila ? null : t.id)} className={`p-1.5 rounded-md border shadow-sm transition-colors ${logsAbiertosFila ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-gray-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`} title="Trayectoria">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            </button>

                            <button onClick={() => manejarReabrir(t.id)} className="p-1.5 rounded-md bg-white border border-gray-200 text-slate-500 shadow-sm hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Reabrir">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                              </svg>
                            </button>

                            {!esEliminado && (
                              <button onClick={() => confirmarEliminar(t.id)} className="p-1.5 rounded-md bg-white border border-gray-200 text-slate-500 shadow-sm hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-center align-top font-medium">
                          {t.esGuardia ? "Sí" : "-"}
                        </td>

                        <td className="p-3 align-top">{formatearFecha(t.fechaCreacion)}</td>
                        <td className="p-3 align-top">{formatearFecha(t.fechaCierre)}</td>
                        <td className="p-3 align-top">{obtenerNombreUbicacion(t.ubicacion)}</td>
                        <td className="p-3 align-top font-bold">{t.sector}</td>
                        <td className="p-3 align-top font-medium">{t.interno || "-"}</td>
                        <td className="p-3 align-top">{t.usuarioSolicita}</td>
                        <td className="p-3 align-top">{t.tecnico}</td>
                        <td className="p-3 align-top">{t.tecnicoCierre || "-"}</td>
                        <td className="p-3 align-top">{t.category?.name || "Gral"}</td>
                        <td className="p-3 align-top">{t.urgencia}</td>
                        <td className="p-3 align-top">{t.tipoAsistencia}</td>
                        
                        <td className="p-3 max-w-xs align-top">
                          <div className={descAbierta ? "whitespace-normal" : "line-clamp-2"}>
                            {t.descripcion}
                          </div>
                          {t.descripcion?.length > 50 && (
                            <button onClick={() => alternarDescripcion(t.id)} className="text-blue-600 font-medium text-xs mt-1 hover:underline block">
                              {descAbierta ? 'Ver menos' : 'Ver más'}
                            </button>
                          )}
                        </td>

                        <td className="p-3 max-w-xs align-top">
                          <div className={descAbierta ? "whitespace-normal" : "line-clamp-2"}>
                            {esEliminado ? "[TICKET ELIMINADO SIN SOLUCIÓN]" : (t.solucion || "-")}
                          </div>
                          {t.solucion?.length > 50 && !esEliminado && (
                            <button onClick={() => alternarDescripcion(t.id)} className="text-blue-600 font-medium text-xs mt-1 hover:underline block">
                              {descAbierta ? 'Ver menos' : 'Ver más'}
                            </button>
                          )}
                        </td>

                        <td className="p-3 align-top font-medium">{calcularDuracion(t.fechaCreacion, t.fechaCierre)}</td>

                      </tr>

                      {/* TRAYECTORIA */}
                      {logsAbiertosFila && (
                        <tr className="bg-gray-50">
                          <td colSpan={17} className="p-6 border-b border-gray-200">
                            <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <p className="font-black text-slate-800 mb-4 border-b pb-2">
                                Trayectoria del ticket #{t.id}
                              </p>
                              <div className="space-y-3">
                                {t.logs?.map((log: any) => (
                                  <div key={log.id} className="flex items-center gap-4 text-sm text-slate-700">
                                    <span className="w-32">{formatearFecha(log.fecha)}</span>
                                    <span className="font-bold w-24 text-slate-800">{log.estado}</span>
                                    <span>Por: {log.tecnico}</span>
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

        {/* CONTROLES DE PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div className="flex justify-between items-center mt-4 bg-white p-4 rounded-xl border border-gray-300 shadow-sm">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm font-medium text-slate-700">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}

      </div>
    </div>
  );
}