"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BotonNav({ href, label }: { href: string, label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`text-sm font-medium transition-colors ${isActive ? 'text-blue-300' : 'hover:text-blue-300 text-slate-300'}`}
    >
      {label}
    </Link>
  );
}