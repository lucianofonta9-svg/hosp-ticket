import Link from 'next/link';
import { auth, signOut } from "@/auth";
import BotonNav from './BotonNav'; 

export default async function Navbar() {
  const session = await auth();

  if (!session) return null;

  return (
    <nav className="bg-slate-900 text-gray-200 shadow-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center h-16 w-full">
          
         {/* Lado izquierdo: logo */}
          <div className="w-1/3 flex justify-start">
            <Link href="/" className="flex items-center gap-1.5 group shrink-0">
              <span className="font-bold tracking-tight text-xl">HOSP</span>
              <div className="bg-gray-200 px-1.5 py-1 rounded-lg group-hover:bg-blue-300 transition-colors text-slate-900">
                <span className="font-black text-xl">TICKET</span>
              </div>
            </Link>
          </div>

          {/* Centro: Contenedor de Píldora Oscura */}
          <div className="w-1/3 flex justify-center text-lg">
            <div className="flex items-center bg-slate-950 p-1.5 text-gray-200 rounded-full border border-slate-800 shadow-inner gap-1">
              <BotonNav href="/" label="Pendientes" />
              <BotonNav href="/historial" label="Historial" />
              <BotonNav href="/nuevo" label="Nuevo Ticket" />
            </div>
          </div>

          {/* Lado derecho: usuario y logout */}
          <div className="w-1/3 flex items-center justify-end shrink-0">
            <div className="text-right hidden sm:block border-r border-slate-700 pr-4">
              <p className="text-xs font-bold text-blue-400 uppercase leading-none">Técnico</p>
              <p className="text-l font-medium text-gray-200 text-bold">{session.user?.name}</p>
            </div>

            <form action={async () => { "use server"; await signOut(); }}>
              <button 
                type="submit"
                className="flex items-center justify-center gap-0.5 p-2 text-gray-200 hover:text-red-400 hover:bg-slate-800 rounded-full transition-all"
                title="Cerrar Sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 m-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /> 
                </svg> 
                Salir
              </button>
            </form>
          </div>

        </div>
      </div>
    </nav>
  );
}