"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DATOS_SECTORES } from '../../constants/sectores';
import { UBICACIONES } from '../../constants/ubicaciones'; 
import { registrarTicket, obtenerTicketPorId, actualizarTicket, obtenerCategorias, crearCategoria } from '../actions';

const obtenerFechaHoraLocalActual = () => {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function NuevoTicket() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryId = searchParams.get('edit');
  const editId = queryId ? Number(queryId) : null;

  // ESTADOS
  const [fechaHora, setFechaHora] = useState(obtenerFechaHoraLocalActual());
  const [fechaHoraCierre, setFechaHoraCierre] = useState(obtenerFechaHoraLocalActual()); 
  const [tieneCierre, setTieneCierre] = useState(false); 
  const [sectorSeleccionado, setSectorSeleccionado] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [ubicacionId, setUbicacionId] = useState<number | "">(""); 
  const [usuarioSolicita, setUsuarioSolicita] = useState(""); 
  const [descripcion, setDescripcion] = useState("");
  const [solucion, setSolucion] = useState("");
  const [esResolucionInmediata, setEsResolucionInmediata] = useState(false);
  const [esGuardia, setEsGuardia] = useState(false);
  const [destacado, setDestacado] = useState(false); 
  const [urgencia, setUrgencia] = useState<"BAJA" | "MEDIA" | "CRITICA">("BAJA");
  const [tipoAsistencia, setTipoAsistencia] = useState<"PRESENCIAL" | "REMOTA">("PRESENCIAL");
  
  const [cargando, setCargando] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nuevaCatNombre, setNuevaCatNombre] = useState("");
  const [mostrandoInputCat, setMostrandoInputCat] = useState(false);

  const limpiarFormulario = () => {
    setSectorSeleccionado("");
    setCategoriaId("");
    setUbicacionId(""); 
    setUsuarioSolicita(""); 
    setDescripcion("");
    setSolucion("");
    setEsGuardia(false);
    setEsResolucionInmediata(false);
    setTieneCierre(false);
    setDestacado(false);
    setUrgencia("BAJA");
    setTipoAsistencia("PRESENCIAL");
    setFechaHora(obtenerFechaHoraLocalActual());
    setFechaHoraCierre(obtenerFechaHoraLocalActual());
  };

  const sectoresFiltrados = useMemo(() => {
    if (ubicacionId === "") return [];
    return DATOS_SECTORES.filter(sector => sector.ubicacionId === ubicacionId);
  }, [ubicacionId]);

  useEffect(() => {
    obtenerCategorias().then(setCategorias);
  }, []);

  useEffect(() => {
    if (editId) {
      setCargando(true);
      obtenerTicketPorId(editId).then((ticket: any) => {
        if (ticket) {
          setUbicacionId(Number(ticket.ubicacion) || ""); 
          setSectorSeleccionado(ticket.sector);
          setCategoriaId(ticket.categoryId?.toString() || "");
          setUsuarioSolicita(ticket.usuario_solicita || ""); 
          setDescripcion(ticket.descripcion);
          setSolucion(ticket.solucion || "");
          setEsGuardia(ticket.es_guardia);
          setDestacado(ticket.destacado || false);
          setUrgencia(ticket.urgencia || "BAJA");
          setTipoAsistencia(ticket.tipo_asistencia || "PRESENCIAL");

          if (ticket.fecha_creacion) {
            const d = new Date(ticket.fecha_creacion);
            const tzOffset = d.getTimezoneOffset() * 60000;
            setFechaHora(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
          }

          if (ticket.fecha_cierre) {                                            
            setTieneCierre(true);
            const d = new Date(ticket.fecha_cierre);
            const tzOffset = d.getTimezoneOffset() * 60000;
            setFechaHoraCierre(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
          }
        }
        setCargando(false);
      });
    } else {
      limpiarFormulario();
    }
  }, [editId]);

  const manejarCambioUbicacion = (id: string) => {
    setUbicacionId(id === "" ? "" : Number(id));
    setSectorSeleccionado("");
  };

  const manejarCrearCategoria = async () => {
    if (!nuevaCatNombre.trim()) return;
    const res = await crearCategoria(nuevaCatNombre.trim());
    if (res && res.id) {
      setCategorias(prev => [...prev, res]);
      setCategoriaId(res.id.toString());
      setNuevaCatNombre("");
      setMostrandoInputCat(false);
    } else {
      alert("Error al crear la categoría");
    }
  };

  const manejarGuardado = async () => {
    if (ubicacionId === "" || !sectorSeleccionado || !categoriaId || !descripcion) {
        return alert("Por favor, complete todos los campos obligatorios.");
    }

    const sectorEncontrado = DATOS_SECTORES.find(s => s.nombre === sectorSeleccionado);
    const internoAutomatico = sectorEncontrado ? sectorEncontrado.interno : "";

    const datos = {
      sector: sectorSeleccionado,
      interno: internoAutomatico, 
      categoryId: parseInt(categoriaId),
      ubicacion: ubicacionId.toString(), 
      usuarioSolicita, 
      descripcion,
      solucion,
      fechaManual: fechaHora,
      fechaCierreManual: (esResolucionInmediata || tieneCierre || solucion.trim() !== "") ? fechaHoraCierre : undefined, 
      esResolucionInmediata,
      urgencia,
      tipoAsistencia,
      esGuardia,
      destacado 
    };

    const res = editId ? await actualizarTicket(editId, datos) : await registrarTicket(datos);

    if (res.success) {
      router.push('/'); 
      router.refresh(); 
    } else {
      alert("Error al procesar la solicitud.");
    }
  };

  if (cargando) return <p className="text-center py-20 font-bold text-gray-500 italic text-lg animate-pulse">Cargando...</p>;

  return (
    <main className="p-8 max-w-2xl mx-auto bg-gray-200 min-h-screen font-sans">
      <h1 className="text-2xl font-black mb-6 text-slate-800 border-b pb-2 flex justify-center uppercase tracking-tighter">
        {editId ? 'Editar Ticket  ✏️' : 'Crear Ticket 📋'}
      </h1>

      <div className="space-y-5 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        
        {/* GRUPO 1: FECHA - USUARIO SOLICITANTE */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fecha y Hora de Apertura</label>
            <input 
              type="datetime-local" 
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Usuario Solicitante</label>
            <input 
              type="text" 
              value={usuarioSolicita}
              onChange={(e) => setUsuarioSolicita(e.target.value)}
              placeholder="Nombre y apellido"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            />
          </div>
        </div>

        {/* GRUPO 2: UBICACIÓN - SECTOR */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ubicación (Lugar)</label>
            <select 
              value={ubicacionId}
              onChange={(e) => manejarCambioUbicacion(e.target.value)}
              className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            >
              <option value="">Seleccione lugar...</option>
              {UBICACIONES.map(u => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Sector</label>
            <select 
              value={sectorSeleccionado}
              onChange={(e) => setSectorSeleccionado(e.target.value)}
              disabled={ubicacionId === ""}
              className={`w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 ${ubicacionId === "" ? 'cursor-not-allowed bg-gray-50' : ''}`}
            >
              <option value="">
                {ubicacionId === "" ? "Primero elija ubicación..." : "Seleccione sector..."}
              </option>
              {sectoresFiltrados.map(s => (
                <option key={s.nombre} value={s.nombre}>{s.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* GRUPO 3: ASISTENCIA - URGENCIA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-gray-500 mb-1">Asistencia</label>
            <select 
              value={tipoAsistencia}
              onChange={(e) => setTipoAsistencia(e.target.value as any)}
              className="w-full p-2 border rounded bg-white font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PRESENCIAL">🏢 PRESENCIAL</option>
              <option value="REMOTA">💻 REMOTA</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-gray-500 mb-1">Urgencia</label>
            <select 
              value={urgencia}
              onChange={(e) => setUrgencia(e.target.value as any)}
              className="w-full p-2 border rounded bg-white font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="BAJA">🟢 BAJA</option>
              <option value="MEDIA">🟡 MEDIA</option>
              <option value="CRITICA">🔴 CRÍTICA</option>
            </select>
          </div>
        </div>
            
        {/* GRUPO 4: CATEGORÍA DEL PROBLEMA */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Categoría del Problema</label>
          {!mostrandoInputCat ? (
            <div className="flex gap-2">
              <select 
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
              >
                <option value="">Seleccione tipo...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button 
                type="button"
                onClick={() => setMostrandoInputCat(true)}
                className="bg-slate-100 px-3 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
              <input 
                type="text" 
                value={nuevaCatNombre}
                onChange={(e) => setNuevaCatNombre(e.target.value)}
                className="flex-1 p-2 border rounded border-blue-400 outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 font-medium"
                placeholder="Nombre de la categoría..."
                autoFocus
              />
              <button type="button" onClick={manejarCrearCategoria} className="bg-blue-600 text-white px-4 rounded-lg font-bold text-xs uppercase hover:bg-blue-700">Guardar</button>
              <button type="button" onClick={() => setMostrandoInputCat(false)} className="bg-gray-100 text-gray-500 px-3 rounded-lg text-xs font-bold uppercase hover:bg-gray-200">X</button>
            </div>
          )}
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descripción del problema</label>
          <textarea 
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none font-sans text-slate-700"
            placeholder="Detalle el problema aquí..."
          />
        </div>

        {/* CAMPO SOLUCIÓN */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Solución técnica (Opcional)</label>
          <textarea 
            value={solucion}
            onChange={(e) => setSolucion(e.target.value)}
            className="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none font-sans text-slate-700"
            placeholder="Escriba los detalles de la solución aquí si ya fue resuelto..."
          />
        </div>

        {/* CAMPO FECHA DE CIERRE MANUAL */}
        {(esResolucionInmediata || tieneCierre || solucion.trim() !== "") && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Fecha y Hora de Cierre (Manual)</label>
            <input 
              type="datetime-local" 
              value={fechaHoraCierre}
              onChange={(e) => setFechaHoraCierre(e.target.value)}
              className="w-full p-2 border rounded bg-white border-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
            />
          </div>
        )}

        {/* OPCIONES ESPECIALES */}
        <div className="flex justify-evenly gap-2 w-full pt-2">
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl flex-1">
            <input 
              type="checkbox" 
              id="guardia"
              checked={esGuardia}
              onChange={(e) => setEsGuardia(e.target.checked)}
              className="w-5 h-5 accent-red-600 cursor-pointer"
            />
            <label htmlFor="guardia" className="text-red-700 font-bold cursor-pointer select-none text-sm uppercase tracking-tight">
              Ticket de Guardia
            </label>
          </div>

          {!editId && (
            <div className="flex items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex-1 gap-2">
              <input 
                type="checkbox" 
                id="resuelto"
                checked={esResolucionInmediata}
                onChange={(e) => setEsResolucionInmediata(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
              <label htmlFor="resuelto" className="font-bold text-emerald-800 select-none cursor-pointer text-sm uppercase tracking-tight">
                Resolución Inmediata
              </label>
            </div>
          )}  
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
            {editId && (
                <button 
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-1/3 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all uppercase text-xs tracking-widest border border-gray-200"
                >
                  Cancelar
                </button>
            )}
            <button 
                onClick={manejarGuardado}
                className={`flex-1 py-3.5 rounded-xl font-black transition-all shadow-lg text-white uppercase tracking-wider text-sm active:scale-95 ${
                    editId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 
                    esResolucionInmediata ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-blue-700 hover:bg-blue-800 shadow-blue-100'
                }`}
            >
                {editId ? 'Guardar Cambios ✏️' : esResolucionInmediata ? 'Finalizar y Guardar ✅' : 'Crear Ticket ➕'}
            </button>
        </div>
      </div>
    </main>
  );
}