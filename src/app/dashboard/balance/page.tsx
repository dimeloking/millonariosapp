import { BalanceView } from '@/components/balance-view';
import { getBalancePeriodData } from '@/lib/balance-data';

export const dynamic = 'force-dynamic';

type BalancePageProps = {
  searchParams?: Promise<{
    mes?: string | string[] | undefined;
  }>;
};

function normalizeMonthParam(value: string | string[] | undefined) {
  const month = Array.isArray(value) ? value[0] : value;

  if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return month;
  }

  return undefined;
}

export default async function BalancePage({ searchParams }: BalancePageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedMonth = normalizeMonthParam(params.mes);
  const data = await getBalancePeriodData(selectedMonth);

  return <BalanceView key={data.periodo.mes} data={data} />;
}
