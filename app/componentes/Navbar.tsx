import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white shadow-md border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Lado Izquierdo: Logo */}
          <Link href="/" className="flex items-center gap-0.5 group">
            <span className="font-bold tracking-tight text-lg">HOSP</span>
            <div className="bg-blue-600 px-0.5 py-0.5 rounded-lg group-hover:bg-blue-500 transition-colors text-white">
              <span className="font-black text-lg">TICKET</span>
            </div>
          </Link>

          {/* Lado Derecho: Links */}
          <div className="flex gap-6 items-center">

            <Link href="/tickets" className="text-sm font-medium hover:text-blue-400 transition-colors">
              Pendientes
            </Link>

            <Link href="/historial" className="text-sm font-medium hover:text-blue-400 transition-colors">
              Historial
            </Link>

            <Link href="/" className="text-sm font-medium hover:text-blue-400 transition-colors">
              Nuevo Ticket
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
}