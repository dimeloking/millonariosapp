import { PendientesPageClient } from "@/components/pendientes-page-client";
import { getPendientesData } from "@/lib/movements-data";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function PendientesPage() {
  const rows = await getPendientesData();

  return <PendientesPageClient initialRows={rows} />;
}
