"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 text-white shadow-md border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Lado Izquierdo: Tu Logo con estilo */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="font-bold tracking-tight text-lg">HOSP</span>
            <div className="bg-blue-100 px-1 py-0.5 rounded-lg group-hover:bg-blue-300 transition-colors text-slate-900">
              <span className="font-black text-lg">TICKET</span>
            </div>
          </Link>

          {/* Lado Derecho: Rutas actualizadas al nuevo orden */}
          <div className="flex gap-6 items-center">
            {/* "/" ahora es Pendientes */}
            <Link 
              href="/" 
              className={`text-m font-medium transition-colors ${pathname === '/' ? 'text-blue-300' : 'hover:text-blue-300'}`}
            >
              Pendientes
            </Link>

            <Link 
              href="/historial" 
              className={`text-m font-medium transition-colors ${pathname === '/historial' ? 'text-blue-300' : 'hover:text-blue-300'}`}
            >
              Historial
            </Link>

            {/* "/nuevo" ahora es el formulario */}
            <Link 
              href="/nuevo" 
              className={`text-m font-medium transition-colors ${pathname === '/nuevo' ? 'text-blue-300' : 'hover:text-blue-300'}`}
            >
              Nuevo Ticket
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}