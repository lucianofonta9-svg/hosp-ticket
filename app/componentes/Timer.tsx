"use client";
import { useState, useEffect } from 'react';

export default function Timer({ inicio, pausado = false }: { inicio: string | Date, pausado?: boolean }) {
  const [tiempo, setTiempo] = useState("");

  useEffect(() => {
    // Si está pausado, no ejecutamos el intervalo y mantenemos el valor actual
    if (pausado) return;

    const actualizar = () => {
      // Validamos que 'inicio' sea una fecha válida para evitar errores de JS
      const fechaInicio = new Date(inicio).getTime();
      if (isNaN(fechaInicio)) {
        setTiempo("--h --m --s");
        return;
      }

      const diff = new Date().getTime() - fechaInicio;
      const segundos = Math.floor(diff / 1000);
      const h = Math.floor(segundos / 3600);
      const m = Math.floor((segundos % 3600) / 60);
      const s = segundos % 60;
      
      setTiempo(`${h}h ${m}m ${s}s`);
    };

    actualizar();
    const interval = setInterval(actualizar, 1000);
    
    return () => clearInterval(interval);
  }, [inicio, pausado]); // Si 'pausado' cambia, el efecto se reinicia o se detiene

  return <span>{tiempo || "0h 0m 0s"}</span>;
}