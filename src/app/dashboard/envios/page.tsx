import { connection } from "next/server";
import { Suspense } from "react";
import { EnviosPageClient } from "@/components/envios-page-client";
import { PageTopbarFallback } from "@/components/page-topbar-fallback";
import { getEnviosData } from "@/lib/movements-data";

// Shared business ledger read straight from the database on every request.
async function EnviosContent() {
  await connection();
  const rows = await getEnviosData();

  return <EnviosPageClient initialRows={rows} />;
}

export default function EnviosPage() {
  return (
    <Suspense fallback={<PageTopbarFallback title="Envíos" />}>
      <EnviosContent />
    </Suspense>
  );
}
