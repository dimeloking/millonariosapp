import { BalanceView } from "@/components/balance-view";
import { getBalancePeriodData } from "@/lib/balance-data";

export const dynamic = "force-dynamic";

export default async function BalancePage() {
  const data = await getBalancePeriodData("2026-03");

  return <BalanceView data={data} />;
}
