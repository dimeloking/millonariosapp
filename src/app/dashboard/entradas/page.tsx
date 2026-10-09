import { connection } from "next/server";
import { Suspense } from "react";
import { EntradasPageClient } from "@/components/entradas-page-client";
import { PageTopbarFallback } from "@/components/page-topbar-fallback";
import { getEntradasData } from "@/lib/movements-data";

// Shared business ledger read straight from the database on every request.
async function EntradasContent() {
  await connection();
  const rows = await getEntradasData();

  return <EntradasPageClient initialRows={rows} />;
}

export default function EntradasPage() {
  return (
    <Suspense fallback={<PageTopbarFallback title="Entradas" />}>
      <EntradasContent />
    </Suspense>
  );
}
