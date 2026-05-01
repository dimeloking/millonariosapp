import { SalidasExternasPageClient } from "@/components/salidas-externas-page-client";
import { getEnviosData, getSalidasExternasData } from "@/lib/movements-data";

export const dynamic = "force-dynamic";

export default async function SalidasExternasPage() {
  const [envios, rows] = await Promise.all([
    getEnviosData(),
    getSalidasExternasData(),
  ]);

  return <SalidasExternasPageClient envios={envios} initialRows={rows} />;
}
