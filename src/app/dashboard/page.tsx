import Link from "next/link";
import {
  ArrowRight,
  BanknoteArrowDown,
  BellRing,
  Calculator,
  CreditCard,
  LayoutDashboard,
  PlaneTakeoff,
  Send,
  WalletCards,
} from "lucide-react";

import {
  MonthlySalesChart,
  type MonthlySalesPoint,
} from "@/components/monthly-sales-chart";
import { TopbarActions } from "@/components/topbar-actions";
import { getDashboardSummary } from "@/lib/balance-data";
import { fmtUSD } from "@/lib/formatters";
import { getEnviosData } from "@/lib/movements-data";

const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const QUICK_LINKS = [
  {
    description: "Vista general del negocio",
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    description: "Registrar y revisar remesas",
    href: "/dashboard/envios",
    icon: Send,
    label: "Envíos",
  },
  {
    description: "Capital recibido en Colombia",
    href: "/dashboard/entradas",
    icon: BanknoteArrowDown,
    label: "Entradas",
  },
  {
    description: "Gastos y pagos del negocio",
    href: "/dashboard/salidas",
    icon: PlaneTakeoff,
    label: "Salidas",
  },
  {
    description: "Devoluciones desde Aruba",
    href: "/dashboard/salidas-ext",
    icon: WalletCards,
    label: "Salidas ext.",
  },
  {
    description: "Tareas abiertas del día",
    href: "/dashboard/pendientes",
    icon: BellRing,
    label: "Pendientes",
  },
  {
    description: "Control del impuesto bancario",
    href: "/dashboard/creditos",
    icon: CreditCard,
    label: "4×1000",
  },
  {
    description: "Saldo Colombia y Aruba",
    href: "/dashboard/balance",
    icon: Calculator,
    label: "Balance",
  },
];

function buildMonthlySales(envios: Awaited<ReturnType<typeof getEnviosData>>) {
  const byMonth = new Map<string, number>();

  for (const envio of envios) {
    const [year, month] = envio.fecha.split("-").map(Number);
    if (!year || !month) continue;

    const key = `${year}-${String(month).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + envio.pesos);
  }

  const sorted = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b));
  const recent = sorted.slice(-6);

  if (recent.length === 0) {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return {
        month: MONTH_LABELS[date.getMonth()],
        ventas: 0,
      };
    });
  }

  return recent.map(([key, ventas]) => {
    const [, month] = key.split("-").map(Number);
    return {
      month: MONTH_LABELS[(month ?? 1) - 1],
      ventas,
    };
  });
}

export default async function DashboardPage() {
  const [summary, envios] = await Promise.all([
    getDashboardSummary(),
    getEnviosData(),
  ]);
  const chartData: MonthlySalesPoint[] = buildMonthlySales(envios);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Período · {summary.periodLabel}</div>
          <h1>Dashboard</h1>
        </div>
        <TopbarActions showNewEnvio />
      </div>

      <div
        className="content"
        style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}
      >
        <div className="dashboard-shortcuts">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;

            return (
              <Link className="dashboard-shortcut" href={item.href} key={item.href}>
                <div className="dashboard-shortcut-icon">
                  <Icon size={22} />
                </div>
                <div>
                  <div className="dashboard-shortcut-title">{item.label}</div>
                  <div className="dashboard-shortcut-sub">{item.description}</div>
                </div>
                <div className="dashboard-shortcut-footer">
                  <span />
                  <ArrowRight size={15} />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="dashboard-chart-shell">
          <div className="dashboard-chart-summary">
            <div>
              <div className="mono dashboard-chart-kicker">Ventas mensuales</div>
              <h2>Cuánto se vendió por mes</h2>
            </div>
            <div className="dashboard-chart-total">
              <span>Total dólares</span>
              <strong>{fmtUSD(summary.totalDolares)}</strong>
            </div>
          </div>
          <MonthlySalesChart data={chartData} />
        </div>
      </div>
    </>
  );
}
