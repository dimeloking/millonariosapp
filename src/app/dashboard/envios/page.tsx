import { EnviosPageClient } from "@/components/envios-page-client";
import { getEnviosData } from "@/lib/movements-data";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function EnviosPage() {
  const rows = await getEnviosData();

  return <EnviosPageClient initialRows={rows} />;
}
