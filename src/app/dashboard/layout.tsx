import { connection } from 'next/server';
import { Suspense } from 'react';
import { Sidebar } from '@/components/sidebar';
import { getDashboardSummary } from '@/lib/balance-data';
import { getTrmData } from '@/lib/trm-data';

// Ledger totals are shared business data read straight from the database and the
// "current month" depends on the request time, so this stays request-time work.
async function DashboardSidebar() {
  await connection();

  const [summary, trm] = await Promise.all([
    getDashboardSummary(),
    getTrmData(),
  ]);

  return <Sidebar summary={summary} trm={trm} />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        background: '#0a0b0d',
        overflow: 'hidden',
      }}
    >
      <Suspense fallback={<aside aria-hidden="true" />}>
        <DashboardSidebar />
      </Suspense>
      <main
        style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </main>
    </div>
  );
}
