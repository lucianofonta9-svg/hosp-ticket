"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { autenticar } from "../actions";

export default function LoginPage() {
  // Hook para manejar el estado de la autenticación
  const [errorMessage, dispatch] = useActionState(autenticar, undefined);

  return (
    <main className="flex items-center justify-center md:h-screen bg-slate-100">
    
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        
        {/* Formulario de Acceso */}
        <form action={dispatch} className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex justify-center">Iniciar sesión</h1>
           
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Usuario</label>
              <input
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900 bg-slate-50"
                name="username"
                placeholder="Nombre de usuario"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Contraseña</label>
              <input
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900 bg-slate-50"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <LoginButton />

          {/* Alerta de error si falla la autenticación */}
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2 rounded">
              <p className="text-xs text-red-700 font-bold text-center">
                {errorMessage}
              </p>
            </div>
          )}
        </form>

      
        <p className="text-center text-[11px] text-slate-400 mt-4">
          Acceso restringido a personal de soporte técnico autorizado.
        </p>
      </div>
    </main>
  );
}

/**
 * Componente interno para el botón de envío.
 * Utiliza useFormStatus para detectar si la acción está en proceso.
 */

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`mt-4 flex w-full justify-center rounded-lg py-3 text-sm font-bold uppercase tracking-wider text-white transition-all shadow-md ${
        pending 
          ? "bg-blue-400 cursor-not-allowed" 
          : "bg-blue-700 hover:bg-blue-800 active:scale-[0.98]"
      }`}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Verificando...
        </span>
      ) : (
        "Entrar al Sistema"
      )}
    </button>
  );
}