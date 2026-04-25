import { SalidasPageClient } from "@/components/salidas-page-client";
import { getSalidasData } from "@/lib/movements-data";

export const dynamic = "force-dynamic";

export default async function SalidasPage() {
  const rows = await getSalidasData();

  return <SalidasPageClient initialRows={rows} />;
}
