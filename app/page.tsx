import { obtenerTicketsPendientes, finalizarTicket } from './actions';
import Timer from './timer';
import Link from 'next/link';

export default async function TicketsPage() {
  const tickets = await obtenerTicketsPendientes();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tickets en Proceso</h1>
        </div>

        <div className="grid gap-4">
          {tickets.length === 0 ? (
            <p className="text-gray-500 italic text-center py-10">No hay tickets pendientes.</p>
          ) : (
            tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`bg-white p-6 rounded-xl shadow-md border-l-8 ${
                  ticket.es_guardia ? 'border-red-600 bg-red-50' : 'border-orange-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    {ticket.es_guardia && (
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded mb-2 inline-block">
                        GUARDIA
                      </span>
                    )}
                    <h2 className="text-xl font-bold text-gray-900">{ticket.sector}</h2>
                    <p className="text-sm text-gray-500">
                      Interno: {ticket.interno} | Categoría: {ticket.categoria}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-400">Transcurrido:</p>
                    <Timer inicio={ticket.fecha_creacion} />
                  </div>
                </div>

                <p className="mt-4 text-gray-700 bg-white p-3 rounded border italic shadow-sm">
                  "{ticket.descripcion}"
                </p>

                <div className="mt-4 flex justify-end border-t pt-4">
                  {/* Solución al error de TypeScript: envolvemos en una función void */}
                  <form action={async () => {
                    "use server";
                    await finalizarTicket(ticket.id);
                  }}>
                    <button 
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md active:scale-95"
                    >
                      ✓ FINALIZAR TICKET
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}