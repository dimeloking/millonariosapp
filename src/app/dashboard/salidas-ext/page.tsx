import { connection } from "next/server";
import { Suspense } from "react";
import { PageTopbarFallback } from "@/components/page-topbar-fallback";
import { SalidasExternasPageClient } from "@/components/salidas-externas-page-client";
import { getEnviosData, getSalidasExternasData } from "@/lib/movements-data";

// Shared business ledger read straight from the database on every request.
async function SalidasExternasContent() {
  await connection();
  const [envios, rows] = await Promise.all([
    getEnviosData(),
    getSalidasExternasData(),
  ]);

  return <SalidasExternasPageClient envios={envios} initialRows={rows} />;
}

export default function SalidasExternasPage() {
  return (
    <Suspense fallback={<PageTopbarFallback title="Salidas ext." />}>
      <SalidasExternasContent />
    </Suspense>
  );
}
