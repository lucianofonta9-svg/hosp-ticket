"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DATOS_SECTORES } from '../../constants/sectores';
import { UBICACIONES } from '../../constants/ubicaciones'; 
import { registrarTicket, obtenerTicketPorId, actualizarTicket, obtenerCategorias, crearCategoria } from '../actions';

interface NuevoTicketProps {
  userName: string;
}

export default function NuevoTicket({ userName }: NuevoTicketProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryId = searchParams.get('edit');
  const editId = queryId ? Number(queryId) : null;

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState("");
  const [interno, setInterno] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [ubicacion, setUbicacion] = useState(""); 
  const [usuarioSolicita, setUsuarioSolicita] = useState(""); 
  const [descripcion, setDescripcion] = useState("");
  const [esResolucionInmediata, setEsResolucionInmediata] = useState(false);
  const [esGuardia, setEsGuardia] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nuevaCatNombre, setNuevaCatNombre] = useState("");
  const [mostrandoInputCat, setMostrandoInputCat] = useState(false);

  const limpiarFormulario = () => {
    setSectorSeleccionado("");
    setInterno("");
    setCategoriaId("");
    setUbicacion(""); 
    setUsuarioSolicita(""); 
    setDescripcion("");
    setEsGuardia(false);
    setEsResolucionInmediata(false);
    setFecha(new Date().toISOString().split('T')[0]);
  };

  useEffect(() => {
    obtenerCategorias().then(setCategorias);
  }, []);

  useEffect(() => {
    if (editId) {
      setCargando(true);
      obtenerTicketPorId(editId).then((ticket) => {
        if (ticket) {
          setSectorSeleccionado(ticket.sector);
          setInterno(ticket.interno || "");
          // CORRECCIÓN: Usamos ticket.categoryId directamente de la relación
          setCategoriaId(ticket.categoryId?.toString() || "");
          setUbicacion(ticket.ubicacion || ""); 
          setUsuarioSolicita(ticket.usuario_solicita || ""); 
          setDescripcion(ticket.descripcion);
          setEsGuardia(ticket.es_guardia);
          // Seteamos la fecha del ticket para que no se ponga la de hoy al editar
          if (ticket.fecha_creacion) {
            setFecha(new Date(ticket.fecha_creacion).toISOString().split('T')[0]);
          }
        }
        setCargando(false);
      });
    } else {
      limpiarFormulario();
    }
  }, [editId]);

  const manejarCambioSector = (nombreSector: string) => {
    setSectorSeleccionado(nombreSector);
    const sectorEncontrado = DATOS_SECTORES.find(s => s.nombre === nombreSector);
    setInterno(sectorEncontrado ? sectorEncontrado.interno : "");
  };

  const manejarCrearCategoria = async () => {
    if (!nuevaCatNombre.trim()) return;
    
    // CORRECCIÓN: Manejo de la respuesta para asegurar que se guarde el ID
    const res = await crearCategoria(nuevaCatNombre.trim());
    
    if (res && res.id) { // Asumiendo que crearCategoria devuelve el objeto creado
      setCategorias(prev => [...prev, res]);
      setCategoriaId(res.id.toString());
      setNuevaCatNombre("");
      setMostrandoInputCat(false);
    } else {
      alert("Error al crear la categoría");
    }
  };

  const manejarGuardado = async () => {
    // CORRECCIÓN: Validación mejorada
    if (!sectorSeleccionado || !categoriaId || !ubicacion || !descripcion) {
        return alert("Por favor, complete todos los campos obligatorios.");
    }

    const datos = {
      sector: sectorSeleccionado,
      interno,
      categoryId: parseInt(categoriaId),
      ubicacion, 
      usuarioSolicita, 
      descripcion,
      esResolucionInmediata,
      esGuardia,
      tecnico: userName // Enviamos el técnico que viene por props
    };

    const res = editId ? await actualizarTicket(editId, datos) : await registrarTicket(datos);

    if (res.success) {
      router.push('/'); 
      router.refresh(); // CORRECCIÓN: Forzamos el refresco para ver los cambios
    } else {
      alert("Error al procesar la solicitud.");
    }
  };

  if (cargando) return <p className="text-center py-20 font-bold text-gray-500 italic text-lg animate-pulse">Cargando...</p>;

  return (
    <main className="p-8 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black mb-6 text-slate-800 border-b pb-2 flex justify-center uppercase tracking-tighter">
        {editId ? 'Editar Ticket  ✏️' : 'Crear Ticket 📋'}
      </h1>

      <div className="space-y-5 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        
        {/* FILA 1: FECHA Y UBICACIÓN */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fecha</label>
            <input 
              type="date" 
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ubicación</label>
            <select 
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            >
              <option value="">Seleccione lugar...</option>
              {UBICACIONES.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FILA 2: TÉCNICO Y USUARIO */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Técnico</label>
            <input 
              type="text" 
              value={userName} 
              disabled 
              className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed font-bold" 
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

        {/* FILA 3: SECTOR E INTERNO */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Sector</label>
            <select 
              value={sectorSeleccionado}
              onChange={(e) => manejarCambioSector(e.target.value)}
              className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            >
              <option value="">Seleccione sector...</option>
              {DATOS_SECTORES.map(s => (
                <option key={s.nombre} value={s.nombre}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Interno</label>
            <input 
              type="text" 
              value={interno}
              onChange={(e) => setInterno(e.target.value)}
              placeholder="Ej: 104"
              className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            />
          </div>
        </div>

        {/* CATEGORÍA DINÁMICA */}
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
                title="Nueva categoría"
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
                className="flex-1 p-2 border rounded border-blue-400 outline-none focus:ring-2 focus:ring-blue-200"
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

        {/* OPCIONES ESPECIALES */}
        <div className="flex justify-evenly gap-2 w-full">
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg flex-1">
            <input 
              type="checkbox" 
              id="guardia"
              checked={esGuardia}
              onChange={(e) => setEsGuardia(e.target.checked)}
              className="w-5 h-5 accent-red-600 cursor-pointer"
            />
            <label htmlFor="guardia" className="text-red-600 font-bold cursor-pointer select-none text-sm uppercase">
              Guardia
            </label>
          </div>

          {!editId && (
            <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200 flex-1">
              <input 
                type="checkbox" 
                id="resuelto"
                checked={esResolucionInmediata}
                onChange={(e) => setEsResolucionInmediata(e.target.checked)}
                className="w-5 h-5 accent-green-600 cursor-pointer"
              />
              <label htmlFor="resuelto" className="ml-3 font-bold text-green-800 select-none cursor-pointer text-sm uppercase">
                Solucionado
              </label>
            </div>
          )}  
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-3 pt-2">
            {editId && (
                <button 
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-1/3 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all uppercase text-xs"
                >
                  Cancelar
                </button>
            )}
            <button 
                onClick={manejarGuardado}
                className={`flex-1 py-3 rounded-lg font-black transition-all shadow-lg text-white uppercase tracking-wider ${
                    editId ? 'bg-orange-500 hover:bg-orange-600' : 
                    esResolucionInmediata ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-700 hover:bg-blue-800'
                }`}
            >
                {editId ? 'Guardar Cambios' : esResolucionInmediata ? 'Finalizar y Guardar' : 'Crear Ticket'}
            </button>
        </div>
      </div>
    </main>
  );
}