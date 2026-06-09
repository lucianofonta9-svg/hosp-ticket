"use client"; 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SyncTickets() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Lógica del refresco automático
  useEffect(() => {
    // setInterval ejecuta una función cada X milisegundos (45000 = 45 segundos)
    const intervalo = setInterval(() => {
      router.refresh(); 
    }, 45000); 

    // Limpiamos el intervalo si el componente se desmonta para evitar fugas de memoria
    return () => clearInterval(intervalo);
  }, [router]);

  // 2. Lógica del botón manual
  const handleManualSync = () => {
    setIsSyncing(true); // Activa la animación de carga
    
    // router.refresh() le pide al servidor de Next.js que vuelva a ejecutar 
    // las consultas de base de datos de la página actual sin recargar el navegador
    router.refresh(); 
    
    // Desactiva la animación después de menos de 1 segundo
    setTimeout(() => {
      setIsSyncing(false);
    }, 700);
  };

  // 3. Interfaz del botón
  return (
    <button 
      onClick={handleManualSync}
      disabled={isSyncing}
      className="bg-white px-4 py-2 rounded-full shadow-sm border text-sm font-bold  text-gray-500 flex gap-1 justify-center items-center hover:bg-slate-200 hover:text-slate-900 cursor-pointer"
      title="Actualizar"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="currentColor" 
        className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
      <span className="hidden md:inline">
        {isSyncing ? 'Cargando...' : 'Actualizar'}
      </span>
    </button>
  );
}