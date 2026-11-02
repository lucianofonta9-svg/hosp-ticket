"use client";

import { useState, useEffect } from 'react';
import { UBICACIONES } from '../../constants/ubicaciones'; 

// Elegí los IDs de los 2 efectores que querés mostrar en el Nav
const idsPermitidos = [1, 2]; // <-- Cambiá estos números por los tuyos

export default function EfectorSelector() {
  const [efector, setEfector] = useState("");

  useEffect(() => {
    const guardado = localStorage.getItem("efectorDefault");
    if (guardado) {
      setEfector(guardado);
    }
  }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value;
    setEfector(valor);
    if (valor === "") {
      localStorage.removeItem("efectorDefault");
    } else {
      localStorage.setItem("efectorDefault", valor);
    }
  };

  // Filtramos la lista original
  const ubicacionesFiltradas = UBICACIONES.filter(u => idsPermitidos.includes(u.id as number));

  return (
    <select 
      value={efector}
      onChange={manejarCambio}
      title="Efector predeterminado"
      className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-32 lg:w-40 cursor-pointer shadow-inner shrink-0 mb-4 md:mb-0"
    >
      <option value="">Efector...</option>
      {ubicacionesFiltradas.map(u => (
        <option key={u.id} value={u.id}>{u.nombre}</option>
      ))}
    </select>
  );
}