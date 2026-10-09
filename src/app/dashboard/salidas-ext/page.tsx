import { SalidasExternasPageClient } from "@/components/salidas-externas-page-client";
import { getEnviosData, getSalidasExternasData } from "@/lib/movements-data";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function SalidasExternasPage() {
  const [envios, rows] = await Promise.all([
    getEnviosData(),
    getSalidasExternasData(),
  ]);

  return <SalidasExternasPageClient envios={envios} initialRows={rows} />;
}
