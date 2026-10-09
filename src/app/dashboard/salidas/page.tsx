import { SalidasPageClient } from "@/components/salidas-page-client";
import { getSalidasData } from "@/lib/movements-data";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function SalidasPage() {
  const rows = await getSalidasData();

  return <SalidasPageClient initialRows={rows} />;
}
