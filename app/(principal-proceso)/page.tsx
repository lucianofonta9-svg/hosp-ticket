import { obtenerTicketsPendientes, finalizarTicket } from '../actions';
import TicketCard from '../componentes/TicketCard';



export default async function Home() {
  const tickets = await obtenerTicketsPendientes();

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-300">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Pendientes 📌
          </h1>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border text-sm font-bold text-gray-500">
            {tickets.length} Tickets Pendientes ⏳
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {tickets.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-400 text-lg italic">No hay tickets pendientes.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                finalizarAction={async () => {
                  "use server";
                  await finalizarTicket(ticket.id);
                }} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}