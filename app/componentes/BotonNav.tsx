"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BotonNav({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-5 py-2 text-xs font-black uppercase rounded-full transition-all duration-300 ease-out border ${
        isActive
          ? 'bg-slate-700 border-slate-700 text-slate-200 shadow-sm scale-100'
          : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-700 hover:border-slate-700 active:scale-95'
      }`}
    >
      {label}
    </Link>
  );
}