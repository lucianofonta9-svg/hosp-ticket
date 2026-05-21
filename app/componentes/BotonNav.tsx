"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BotonNav({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-5 py-2 text-xs font-black uppercase rounded-full transition-all duration-200 ${
        isActive
          ? 'bg-slate-800 text-blue-400 shadow-sm scale-100'
          : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300 active:scale-95'
      }`}
    >
      {label}
    </Link>
  );
}

//recordatorio: cambiar funcion edit 