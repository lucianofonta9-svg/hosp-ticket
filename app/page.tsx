"use client";

import { useState } from 'react';
import { DATOS_SECTORES } from '../constants/sectores';
import { CATEGORIAS_PROBLEMAS } from '../constants/problemas';
import { registrarTicket } from './actions';

export default function Home() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState("");
  const [interno, setInterno] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [esResolucionInmediata, setEsResolucionInmediata] = useState(false);
  const [esGuardia, setEsGuardia] = useState(false);

  
//Funcion del boton 
  const manejarGuardado = async () => {
      const res = await registrarTicket({
        sector: sectorSeleccionado,
        interno,
        categoria,
        descripcion,
        esResolucionInmediata,
        esGuardia
      });

      if (res.success) {
        alert("¡Ticket guardado correctamente!");
        // Limpiamos los campos para el próximo
        setDescripcion("");
        setSectorSeleccionado("");
        setInterno("");
        setCategoria("");
      } else {
        alert("Error al guardar. Revisá la terminal.");
      }
    };
  // Función mágica: se ejecuta al cambiar el sector
  const manejarCambioSector = (nombreSector: string) => {
    setSectorSeleccionado(nombreSector);
    
    // Buscamos el objeto que coincida con el nombre
    const sectorEncontrado = DATOS_SECTORES.find(s => s.nombre === nombreSector);
    
    // Si lo encuentra, pone el interno. Si no, lo limpia.
    if (sectorEncontrado) {
      setInterno(sectorEncontrado.interno);
    } else {
      setInterno("");
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2 flex justify-center">Nuevo Ticket</h1>

      <div className="space-y-5 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        
        {/* FILA 1: FECHA Y TÉCNICO */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fecha</label>
            <input 
              type="date" 
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Técnico</label>
            <input type="text" value="Luciano Fontanarrosa" disabled className="w-full p-2 border rounded bg-gray-100 text-gray-400 cursor-not-allowed" />
          </div>
        </div>

        {/* FILA 2: SECTOR E INTERNO (AUTOMÁTICO) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Sector Origen</label>
            <select 
              value={sectorSeleccionado}
              onChange={(e) => manejarCambioSector(e.target.value)}
              className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
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
              // readOnly Lo hacemos de solo lectura porque se carga solo
              placeholder="Auto-completado"
              className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* FILA 3: CATEGORÍA */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Categoría del Problema</label>
          <select 
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">¿Qué tipo de problema es?</option>
            {CATEGORIAS_PROBLEMAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* FILA 4: DESCRIPCIÓN */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descripción detallada</label>
          <textarea 
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Detalle el problema aquí..."
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <input 
            type="checkbox" 
            id="guardia"
            checked={esGuardia}
            onChange={(e) => setEsGuardia(e.target.checked)}
            className="w-5 h-5 accent-red-600"
          />
          <label htmlFor="guardia" className="text-red-600 cursor-pointer">
            ¿Es un ticket de guardia?
          </label>
        </div>


        <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <input 
            type="checkbox" 
            id="resuelto"
            checked={esResolucionInmediata}
            onChange={(e) => setEsResolucionInmediata(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="resuelto" className="ml-3 text-sm font-medium text-blue-800">
            ¿El problema ya fue resuelto? (Cierre inmediato)
          </label>
        </div>

        {/* Mensaje dinámico según el checkbox */}
        <p className="text-xs text-gray-500 mt-2 italic">
          {esResolucionInmediata 
            ? "✓ El ticket se guardará como finalizado." 
            : "⏱ Se iniciará un contador de tiempo al registrar."}
        </p>


        <button 
  onClick={async () => {
    // 1. Llamamos a la función del servidor
    const res = await registrarTicket({
      sector: sectorSeleccionado,
      interno,
      categoria,
      descripcion,
      esResolucionInmediata,
      esGuardia: esGuardia
    });

    // 2. Respuesta visual para el usuario
    if (res.success) {
      alert(`¡Ticket guardado con éxito como ${esResolucionInmediata ? 'RESUELTO' : 'EN PROCESO'}!`);
      
      // 3. Limpiamos los campos para el próximo ticket
      setDescripcion("");
      setSectorSeleccionado("");
      setInterno("");
      setCategoria("");
    } else {
      alert("Error al conectar con la base de datos.");
    }
  }}
  className={`w-full py-3 rounded-lg font-bold mt-2 transition-all shadow-lg text-white ${
    esResolucionInmediata ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-700 hover:bg-blue-800'
  }`}
>
  {esResolucionInmediata ? 'FINALIZAR Y GUARDAR' : 'REGISTRAR E INICIAR CONTADOR'}
</button>

      </div>
    </main>
  );
}