import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./componentes/Navbar"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Tickets - Hospital Rafaela",
  description: "Gestión interna de informática",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased font-light bg-gray-50`}>
        <Navbar/> 
        <main className="bg-gray-200">
          {children}
        </main>
      </body>
    </html>
  );
}