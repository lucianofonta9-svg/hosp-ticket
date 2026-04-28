import Link from 'next/link';
import { auth, signOut } from "@/auth";
import BotonNav from './BotonNav'; 

export default async function Navbar() {
  const session = await auth();

  // no se renderiza el navbar si no hay una sesion activa
  if (!session) return null;

  return (
    <nav className="bg-slate-900 text-white shadow-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* logo */}
          <Link href="/" className="flex items-center gap-1 group shrink-0">
            <span className="font-bold tracking-tight text-lg text-white">HOSP</span>
            <div className="bg-blue-100 px-1 py-0.5 rounded-lg group-hover:bg-blue-300 transition-colors text-slate-900">
              <span className="font-black text-lg">TICKET</span>
            </div>
          </Link>

          {/* navegación */}
          <div className="flex gap-8 items-center">
            <BotonNav href="/" label="Pendientes" />
            <BotonNav href="/historial" label="Historial" />
            <BotonNav href="/nuevo" label="Nuevo Ticket" />
          </div>

          {/* usuario y logout */}
          <div className="flex items-center gap-4 pl-6 border-l border-slate-700 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-blue-400 uppercase leading-none">Técnico</p>
              <p className="text-sm font-medium text-slate-200">{session.user?.name}</p>
            </div>

            <form action={async () => { "use server"; await signOut(); }}>
              <button 
                type="submit"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-full transition-all"
                title="Cerrar Sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </form>
          </div>

        </div>
      </div>
    </nav>
  );
}