"use client";
import { useState, useEffect } from 'react';

export default function Timer({ inicio }: { inicio: Date }) {
  const [tiempo, setTiempo] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      const diff = ahora.getTime() - new Date(inicio).getTime();
      
      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff / (1000 * 60)) % 60);
      const segundos = Math.floor((diff / 1000) % 60);

      setTiempo(`${horas}h ${minutos}m ${segundos}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [inicio]);

  return <span className="font-mono font-bold text-orange-600">{tiempo}</span>;
}