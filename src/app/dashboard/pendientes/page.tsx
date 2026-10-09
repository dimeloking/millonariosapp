import { connection } from "next/server";
import { Suspense } from "react";
import { PageTopbarFallback } from "@/components/page-topbar-fallback";
import { PendientesPageClient } from "@/components/pendientes-page-client";
import { getPendientesData } from "@/lib/movements-data";

// Shared business ledger read straight from the database on every request.
async function PendientesContent() {
  await connection();
  const rows = await getPendientesData();

  return <PendientesPageClient initialRows={rows} />;
}

export default function PendientesPage() {
  return (
    <Suspense fallback={<PageTopbarFallback title="Pendientes" />}>
      <PendientesContent />
    </Suspense>
  );
}
