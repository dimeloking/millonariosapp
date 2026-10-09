import { connection } from "next/server";
import { Suspense } from "react";
import { PageTopbarFallback } from "@/components/page-topbar-fallback";
import { SalidasPageClient } from "@/components/salidas-page-client";
import { getSalidasData } from "@/lib/movements-data";

// Shared business ledger read straight from the database on every request.
async function SalidasContent() {
  await connection();
  const rows = await getSalidasData();

  return <SalidasPageClient initialRows={rows} />;
}

export default function SalidasPage() {
  return (
    <Suspense fallback={<PageTopbarFallback title="Salidas" />}>
      <SalidasContent />
    </Suspense>
  );
}
