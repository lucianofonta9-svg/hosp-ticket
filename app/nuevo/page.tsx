"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DATOS_SECTORES } from '../../constants/sectores';
import { CATEGORIAS_PROBLEMAS } from '../../constants/problemas';
import { UBICACIONES } from '../../constants/ubicaciones'; 
import { registrarTicket, obtenerTicketPorId, actualizarTicket } from '../actions';

export default function NuevoTicket() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryId = searchParams.get('edit');
  const editId = queryId ? Number(queryId) : null;

  // Estados del formulario
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState("");
  const [interno, setInterno] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ubicacion, setUbicacion] = useState(""); 
  const [usuarioSolicita, setUsuarioSolicita] = useState(""); 
  const [descripcion, setDescripcion] = useState("");
  const [esResolucionInmediata, setEsResolucionInmediata] = useState(false);
  const [esGuardia, setEsGuardia] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Función para resetear todos los campos a blanco
  const limpiarFormulario = () => {
    setSectorSeleccionado("");
    setInterno("");
    setCategoria("");
    setUbicacion(""); 
    setUsuarioSolicita(""); 
    setDescripcion("");
    setEsGuardia(false);
    setEsResolucionInmediata(false);
    setFecha(new Date().toISOString().split('T')[0]);
  };

  // Efecto principal: Carga datos si hay ID, sino limpia los campos
  useEffect(() => {
    if (editId) {
      setCargando(true);
      obtenerTicketPorId(editId).then((ticket) => {
        if (ticket) {
          setSectorSeleccionado(ticket.sector);
          setInterno(ticket.interno || "");
          setCategoria(ticket.categoria);
          setUbicacion(ticket.ubicacion || ""); 
          setUsuarioSolicita(ticket.usuario_solicita || ""); 
          setDescripcion(ticket.descripcion);
          setEsGuardia(ticket.es_guardia);
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

  const manejarGuardado = async () => {
    const datos = {
      sector: sectorSeleccionado,
      interno,
      categoria,
      ubicacion, 
      usuarioSolicita, 
      descripcion,
      esResolucionInmediata,
      esGuardia
    };

    let res;
    if (editId) {
      res = await actualizarTicket(editId, datos);
    } else {
      res = await registrarTicket(datos);
    }

    if (res.success) {
      alert(editId ? "¡Ticket actualizado correctamente!" : "¡Ticket guardado con éxito!");
      router.push('/'); 
    } else {
      alert("Error al procesar la solicitud en la base de datos.");
    }
  };

  if (cargando) return <p className="text-center py-20 font-bold text-gray-500 italic text-lg animate-pulse">Cargando datos del ticket...</p>;

  return (
    <main className="p-8 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black mb-6 text-slate-800 border-b pb-2 flex justify-center uppercase tracking-tighter">
        {editId ? 'Editar Ticket  ✏️' : 'Crear Ticket 📋'}
      </h1>

      <div className="space-y-5 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        
        {/* FILA 1: UBICACIÓN Y USUARIO SOLICITA (NUEVO) */}
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Persona que solicita</label>
            <input 
              type="text" 
              value={usuarioSolicita}
              onChange={(e) => setUsuarioSolicita(e.target.value)}
              placeholder="Nombre y apellido"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>
        </div>

        {/* FILA 2: FECHA Y TÉCNICO */}
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
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Técnico Responsable</label>
            <input type="text" value="Luciano Fontanarrosa" disabled className="w-full p-2 border rounded bg-gray-100 text-gray-400 cursor-not-allowed font-medium" />
          </div>
        </div>

        {/* FILA 3: SECTOR E INTERNO */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Sector Origen</label>
            <select 
              value={sectorSeleccionado}
              onChange={(e) => manejarCambioSector(e.target.value)}
              className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="">Seleccione sector...</option>
              {DATOS_SECTORES.map(s => (
                <option key={s.nombre} value={s.nombre}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Interno Telefónico</label>
            <input 
              type="text" 
              value={interno}
              onChange={(e) => setInterno(e.target.value)}
              placeholder="Auto-completado"
              className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>
        </div>

        {/* FILA 4: CATEGORÍA */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Categoría del Problema</label>
          <select 
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          >
            <option value="">¿Qué tipo de problema es?</option>
            {CATEGORIAS_PROBLEMAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* FILA 5: DESCRIPCIÓN */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descripción detallada</label>
          <textarea 
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none font-sans"
            placeholder="Detalle el problema aquí..."
          />
        </div>


        {/* Contenedor para centrar chexboxs */}
        <div className="flex justify-evenly gap-2 w-full">
              {/* CHECKBOX GUARDIA */}
        <div className="flex items-center  gap-2 p-3 bg-red-50 border border-red-200 rounded-lg flex-1">
          <input 
            type="checkbox" 
            id="guardia"
            checked={esGuardia}
            onChange={(e) => setEsGuardia(e.target.checked)}
            className="w-5 h-5 accent-red-600 cursor-pointer"
          />
          <label htmlFor="guardia" className="text-red-600 font-bold cursor-pointer select-none">
            Ticket de Guardia
          </label>
        </div>

        {/* CHECKBOX RESOLUCIÓN INMEDIATA (SOLO SI NO ESTAMOS EDITANDO) */}
        {!editId && (
          <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200 flex-1">
            <input 
              type="checkbox" 
              id="resuelto"
              checked={esResolucionInmediata}
              onChange={(e) => setEsResolucionInmediata(e.target.checked)}
              
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="resuelto" className="ml-3 font-bold text-blue-800 select-none cursor-pointer">
              Cierre inmediato
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
                {editId ? '💾 Guardar Cambios' : esResolucionInmediata ? '🏁 Finalizar y Guardar' : 'Crear'}
            </button>
        </div>
      </div>
    </main>
  );
}