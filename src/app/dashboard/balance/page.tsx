import { Suspense } from 'react';
import { BalanceView } from '@/components/balance-view';
import { PageTopbarFallback } from '@/components/page-topbar-fallback';
import { getBalancePeriodData } from '@/lib/balance-data';

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

// Reads the `mes` search param and the shared ledger at request time.
async function BalanceContent({ searchParams }: BalancePageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedMonth = normalizeMonthParam(params.mes);
  const data = await getBalancePeriodData(selectedMonth);

  return <BalanceView key={data.periodo.mes} data={data} />;
}

export default function BalancePage({ searchParams }: BalancePageProps) {
  return (
    <Suspense fallback={<PageTopbarFallback title="Balance" />}>
      <BalanceContent searchParams={searchParams} />
    </Suspense>
  );
}
