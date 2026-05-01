import { PendientesPageClient } from "@/components/pendientes-page-client";
import { getPendientesData } from "@/lib/movements-data";

export const dynamic = "force-dynamic";

export default async function PendientesPage() {
  const rows = await getPendientesData();

  return <PendientesPageClient initialRows={rows} />;
}
