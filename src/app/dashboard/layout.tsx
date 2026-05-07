import { Sidebar } from '@/components/sidebar';
import { getDashboardSummary } from '@/lib/balance-data';
import { getTrmData } from '@/lib/trm-data';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [summary, trm] = await Promise.all([
    getDashboardSummary(),
    getTrmData(),
  ]);

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
      <Sidebar summary={summary} trm={trm} />
      <main
        style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </main>
    </div>
  );
}
