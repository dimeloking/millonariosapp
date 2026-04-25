import { EntradasPageClient } from "@/components/entradas-page-client";
import { getEntradasData } from "@/lib/movements-data";

export const dynamic = "force-dynamic";

export default async function EntradasPage() {
  const rows = await getEntradasData();

  return <EntradasPageClient initialRows={rows} />;
}
