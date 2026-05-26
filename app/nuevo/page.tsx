import { Suspense } from "react";
import NuevoTicket from "../componentes/NuevoTicket";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-500">Cargando formulario...</div>}>
      <NuevoTicket />
    </Suspense>
  );
}