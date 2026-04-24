import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./componentes/Navbar"; 
import { auth } from "@/auth"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Tickets - Hospital Rafaela",
  description: "Gestión interna de informática",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        {/* Pasamos la sesión como prop a la Navbar para que decida qué mostrar */}
        <Navbar/> 
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}