import NuevoTicket from "./NuevoTicket";
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();

  // Obtenemos el nombre del técnico de la sesión o usamos uno por defecto
  const nombre = session?.user?.name ?? "Técnico";

  return <NuevoTicket userName={nombre} />;
}