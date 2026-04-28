import NuevoTicket from "./NuevoTicket";
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();

  // se obtiene user de la sesion
  const nombre = session?.user?.name ?? "Técnico";

  return <NuevoTicket userName={nombre} />;
}