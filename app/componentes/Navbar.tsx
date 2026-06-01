import Link from 'next/link';
import { auth, signOut } from "@/auth";
import BotonNav from './BotonNav'; 

export default async function Navbar() {
  const session = await auth();

  if (!session) return null;

  return (
    <nav className="bg-slate-900 text-gray-200 shadow-md border-b border-slate-700 relative z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-2">
        <div className="flex items-center justify-between md:justify-start h-16 w-full">
          
          {/* Lado izquierdo: logo */}
          <div className="md:w-1/3 flex justify-start">
            <Link href="/nuevo" className="flex items-center gap-1 group shrink-0">
              <span className="font-bold tracking-tight text-xl">HOSP</span>
              <div className="bg-slate-700 px-1.5 py-1 rounded-lg group-hover:bg-slate-200 group-hover:text-slate-800 transition-colors text-slate-200">
                <span className="font-bold tracking-tight text-xl">TICKET</span>
              </div>
            </Link>
          </div>

          {/* Checkbox oculto para controlar el menú móvil con CSS */}
          <input type="checkbox" id="menu-toggle" className="peer hidden" />

          {/* Botón Hamburguesa (Solo visible en móvil) */}
          <label htmlFor="menu-toggle" className="md:hidden flex items-center p-2 cursor-pointer hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>

          {/* Contenedor del Menú (Oculto en móvil por defecto, colapsable) */}
          <div className="absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-700 md:border-none p-4 md:p-0 flex-col hidden peer-checked:flex md:static md:w-2/3 md:flex md:flex-row shadow-xl md:shadow-none">
            
            {/* Centro: Contenedor de Píldora Oscura */}
            <div className="md:w-1/2 flex justify-center text-lg mb-6 md:mb-0 font-normal">
              <div className="whitespace-nowrap flex flex-col md:flex-row items-stretch md:items-center bg-slate-950 p-1.5 text-gray-200 rounded-2xl md:rounded-full border border-slate-800 shadow-inner gap-2 md:gap-1 w-full md:w-auto">
                
                <BotonNav href="/" label="Pendientes" />
                <BotonNav href="/dashboard" label="Dashboard" />
                
                <BotonNav href="/historial" label="Historial" />
                <BotonNav href="/nuevo" label="Nuevo Ticket" />
              </div>
            </div>

            {/* Lado derecho: usuario y logout */}
            <div className="md:w-1/2 flex flex-col md:flex-row items-center justify-end shrink-0 gap-4 md:gap-0">
              <div className="text-center md:text-right border-b md:border-b-0 border-slate-800 pb-4 md:pb-0 md:border-r md:pr-4 w-full md:w-auto">
                <p className="inline-block align-middle px-2 py-1 mb-1 text-[10px] font-bold bg-slate-700 rounded-full text-gray-200 uppercase leading-none">
                  Usuario
                </p>
                <p className="text-lg md:text-base text-gray-200 font-bold">{session.user?.name}</p>
              </div>

              <form action={async () => { "use server"; await signOut(); }} className="w-full font-bold md:w-auto">
                <button 
                  type="submit"
                  className="flex items-center justify-center w-full md:w-auto md:ml-1 gap-0.5 p-3 md:p-2 text-gray-200 hover:text-red-400 hover:bg-slate-800 rounded-xl md:rounded-full transition-all bg-slate-800 md:bg-transparent mt-2 md:mt-0"
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
      </div>
    </nav>
  );
}