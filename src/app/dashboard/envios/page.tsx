import { EnviosPageClient } from "@/components/envios-page-client";
import { getEnviosData } from "@/lib/movements-data";

export const dynamic = "force-dynamic";

export default async function EnviosPage() {
  const rows = await getEnviosData();

  return <EnviosPageClient initialRows={rows} />;
}
