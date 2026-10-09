import { EntradasPageClient } from "@/components/entradas-page-client";
import { getEntradasData } from "@/lib/movements-data";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function EntradasPage() {
  const rows = await getEntradasData();

  return <EntradasPageClient initialRows={rows} />;
}
