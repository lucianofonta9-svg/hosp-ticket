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

  const [fechaHora, setFechaHora] = useState(obtenerFechaHoraLocalActual());
  const [fechaHoraCierre, setFechaHoraCierre] = useState(obtenerFechaHoraLocalActual()); 
  const [tieneCierre, setTieneCierre] = useState(false); 
  const [sectorSeleccionado, setSectorSeleccionado] = useState("");
  const [nombrePueblo, setNombrePueblo] = useState(""); // NUEVO ESTADO
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

  // Verificamos si la ubicación seleccionada es "Pueblo"
  const esPueblo = ubicacionId !== "" && UBICACIONES.find(u => u.id === ubicacionId)?.nombre.toLowerCase() === "pueblo";

  const limpiarFormulario = () => {
    setSectorSeleccionado("");
    setNombrePueblo("");
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
    
    return DATOS_SECTORES
      .filter(sector => sector.ubicacionId === ubicacionId)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
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
          setSectorSeleccionado(ticket.sector || "");
          setNombrePueblo(ticket.nombrePueblo || "");
          setCategoriaId(ticket.categoryId?.toString() || "");
          setUsuarioSolicita(ticket.usuarioSolicita || ""); 
          setDescripcion(ticket.descripcion);
          setSolucion(ticket.solucion || "");
          setEsGuardia(ticket.esGuardia);
          setDestacado(ticket.destacado || false);
          setUrgencia(ticket.urgencia || "BAJA");
          setTipoAsistencia(ticket.tipoAsistencia || "PRESENCIAL");

          if (ticket.fechaCreacion) {
            const d = new Date(ticket.fechaCreacion);
            const tzOffset = d.getTimezoneOffset() * 60000;
            setFechaHora(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
          }

          if (ticket.fechaCierre) {                                            
            setTieneCierre(true);
            const d = new Date(ticket.fechaCierre);
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
    const nuevaUbicacionId = id === "" ? "" : Number(id);
    setUbicacionId(nuevaUbicacionId);
    
    if (nuevaUbicacionId !== "") {
      const isPuebloActual = UBICACIONES.find(u => u.id === nuevaUbicacionId)?.nombre.toLowerCase() === "pueblo";
      
      if (isPuebloActual) {
        setSectorSeleccionado(""); // Limpiamos sector si es pueblo
      } else {
        const sectoresDeUbicacion = DATOS_SECTORES.filter(s => s.ubicacionId === nuevaUbicacionId);
        if (sectoresDeUbicacion.length === 1) {
          setSectorSeleccionado(sectoresDeUbicacion[0].nombre);
        } else {
          setSectorSeleccionado("");
        }
      }
    } else {
      setSectorSeleccionado("");
    }
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
    // Validaciones diferenciadas
    if (ubicacionId === "" || !categoriaId) {
        return alert("Por favor, complete todos los campos obligatorios.");
    }
    
    if (esPueblo && !nombrePueblo.trim()) {
        return alert("Por favor, ingrese el nombre del pueblo.");
    }

    if (!esPueblo && !sectorSeleccionado) {
        return alert("Por favor, seleccione un sector.");
    }

    const sectorEncontrado = !esPueblo ? DATOS_SECTORES.find(
      (s: any) => s.nombre === sectorSeleccionado && s.ubicacionId === Number(ubicacionId)
    ) : null;
    
    const internoAutomatico = sectorEncontrado?.interno ? sectorEncontrado.interno.join(" - ") : "";

    const datos = {
      sector: esPueblo ? null : sectorSeleccionado,
      nombrePueblo: esPueblo ? nombrePueblo.trim() : null,
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

    const res = editId ? await actualizarTicket(Number(editId), datos) : await registrarTicket(datos);

    if (res.success) {
      alert("Ticket procesado con éxito");
      limpiarFormulario();
      if (editId) router.push('/');
    } else {
      alert("Error al procesar la solicitud.");
    }
  };

  if (cargando) return <p className="text-center py-20 font-bold text-slate-500 italic text-lg animate-pulse">Cargando...</p>;

  const esUnicoSector = sectoresFiltrados.length === 1;

  return (
    <main className="min-h-screen bg-gray-200 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 border-b pb-4 flex justify-start border-gray-300">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            {editId ? 'Editar Ticket  ✏️' : 'Crear Ticket 📋'}
          </h1>
        </div>

        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Fecha y Hora de Apertura</label>
              <input 
                type="datetime-local" 
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                className="block w-full min-w-0 p-2.5 md:p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-xs md:text-sm font-medium text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Solicitante</label>
              <input 
                type="text" 
                value={usuarioSolicita}
                onChange={(e) => setUsuarioSolicita(e.target.value)}
                placeholder="Nombre y apellido"
                className="w-full p-2.5 md:p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Efector</label>
              <select 
                value={ubicacionId}
                onChange={(e) => manejarCambioUbicacion(e.target.value)}
                className="w-full p-2.5 md:p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
              >
                <option value="">Seleccione efector...</option>
                {UBICACIONES.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>

            {/* RENDERIZADO CONDICIONAL DE SECTOR / PUEBLO */}
            {esPueblo ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Nombre del Pueblo</label>
                <input 
                  type="text" 
                  value={nombrePueblo}
                  onChange={(e) => setNombrePueblo(e.target.value)}
                  placeholder="Ej: Susana, Lehmann..."
                  className="w-full p-2.5 md:p-3 border border-blue-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50 text-sm font-medium text-slate-800"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Sector</label>
                <select 
                  value={sectorSeleccionado}
                  onChange={(e) => setSectorSeleccionado(e.target.value)}
                  disabled={ubicacionId === "" || esUnicoSector}
                  className={`w-full p-2.5 md:p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700 ${ubicacionId === "" || esUnicoSector ? 'cursor-not-allowed bg-gray-100 text-slate-500' : 'bg-white'}`}
                >
                  <option value="">
                    {ubicacionId === "" ? "Primero seleccione efector..." : "Seleccione sector..."}
                  </option>
                  {sectoresFiltrados.map(s => (
                    <option key={s.nombre} value={s.nombre}>{s.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ... resto del formulario sin cambios ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Asistencia</label>
              <select 
                value={tipoAsistencia}
                onChange={(e) => setTipoAsistencia(e.target.value as any)}
                className="w-full p-2.5 md:p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
              >
                <option value="PRESENCIAL">PRESENCIAL</option>
                <option value="REMOTA">REMOTA</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Urgencia</label>
              <select 
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value as any)}
                className="w-full p-2.5 md:p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-bold text-slate-700"
              >
                <option value="BAJA">🟢 BAJA</option>
                <option value="MEDIA">🟡 MEDIA</option>
                <option value="CRITICA">🔴 CRÍTICA</option>
              </select>
            </div>
          </div>
              
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Categoría</label>
            {!mostrandoInputCat ? (
              <div className="flex gap-2 w-full">
                <select 
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="flex-1 min-w-0 p-2.5 md:p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700"
                >
                  <option value="">Seleccione categoría...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={() => setMostrandoInputCat(true)}
                  className="bg-slate-100 px-4 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-200 transition-colors shadow-sm shrink-0"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full animate-in fade-in slide-in-from-left-2 duration-200">
                <input 
                  type="text" 
                  value={nuevaCatNombre}
                  onChange={(e) => setNuevaCatNombre(e.target.value)}
                  className="w-full sm:flex-1 p-2.5 md:p-3 border border-blue-400 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm font-medium text-slate-700"
                  placeholder="Nombre de la categoría..."
                  autoFocus
                />
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <button type="button" onClick={manejarCrearCategoria} className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2.5 sm:py-0 rounded-xl font-bold text-xs uppercase hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap">Guardar</button>
                  <button type="button" onClick={() => setMostrandoInputCat(false)} className="flex-1 sm:flex-none bg-gray-100 text-gray-500 px-4 py-2.5 sm:py-0 rounded-xl text-xs font-bold uppercase hover:bg-gray-200 border border-gray-300 shadow-sm transition-colors">X</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Descripción (Opcional)</label>
            <textarea 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-2.5 md:p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700 min-h-[100px]"
              placeholder="Detalles de la descripción aquí..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Nota (Opcional)</label>
            <textarea 
              value={solucion}
              onChange={(e) => setSolucion(e.target.value)}
              className="w-full p-2.5 md:p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium text-slate-700 min-h-[100px]"
              placeholder="Añade una nota aquí..."
            />
          </div>

          {(esResolucionInmediata || tieneCierre) && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2 tracking-tight">Fecha y Hora de Cierre</label>
              <input 
                type="datetime-local" 
                value={fechaHoraCierre}
                onChange={(e) => setFechaHoraCierre(e.target.value)}
                className="block w-full min-w-0 p-2.5 md:p-3 border border-emerald-400 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-xs md:text-sm font-medium text-slate-700"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-evenly gap-3 w-full pt-2">
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl w-full sm:flex-1 shadow-sm">
              <input 
                type="checkbox" 
                id="guardia"
                checked={esGuardia}
                onChange={(e) => setEsGuardia(e.target.checked)}
                className="w-5 h-5 accent-red-600 cursor-pointer"
              />
              <label htmlFor="guardia" className="text-red-700 font-bold cursor-pointer select-none text-xs sm:text-sm uppercase tracking-tight">
                Ticket de Guardia
              </label>
            </div>

            {!editId && (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl w-full sm:flex-1 shadow-sm">
                <input 
                  type="checkbox" 
                  id="resuelto"
                  checked={esResolucionInmediata}
                  onChange={(e) => setEsResolucionInmediata(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer"
                />
                <label htmlFor="resuelto" className="font-bold text-emerald-800 select-none cursor-pointer text-xs sm:text-sm uppercase tracking-tight">
                  Ticket resuelto
                </label>
              </div>
            )}  
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              {editId && (
                  <button 
                    type="button"
                    onClick={() => router.push('/')}
                    className="w-full sm:w-1/3 py-3.5 bg-gray-100 text-slate-600 rounded-xl font-bold hover:bg-gray-200 transition-all uppercase text-xs tracking-widest border border-gray-300 shadow-sm"
                  >
                    Cancelar
                  </button>
              )}
              <button 
                  onClick={manejarGuardado}
                  className={`w-full sm:flex-1 py-3.5 rounded-xl font-black transition-all shadow-md text-white uppercase tracking-wider text-sm active:scale-95 ${
                      editId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 
                      'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  }`}
              >
                  {editId ? 'Guardar Cambios ✏️' : esResolucionInmediata ? 'Finalizar y Guardar ✅' : 'Crear Ticket'}
              </button>
          </div>
        </div>
      </div>
    </main>
  );
}