import { Sparkline } from "@/components/sparkline";
import { OperatorChip } from "@/components/operator-chip";
import { NewEnvioButton } from "@/components/new-envio-button";
import {
  ENVIOS,
  ENTRADAS,
  SALIDAS,
  totalGanancias,
  totalEnviosFlorines,
  totalEnviosDolares,
  totalEntradas,
  totalSalidas,
  sparkEnviosDiarios,
  BALANCE,
} from "@/lib/data";
import { fmtCOP, fmtUSD, fmtAWG, fmtNum, fmtDate } from "@/lib/formatters";

function KpiCard({
  label,
  value,
  unit,
  delta,
  positive,
  accent,
  spark,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  positive?: boolean;
  accent?: boolean;
  spark?: number[];
}) {
  return (
    <div className={`kpi ${accent ? "accent" : ""}`}>
      <div className="label mono">{label}</div>
      <div className="value serif">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      {delta && (
        <div className={`delta ${positive ? "up" : "down"}`}>
          {positive ? "▲" : "▼"} {delta}
        </div>
      )}
      {spark && (
        <div style={{ position: "absolute", bottom: 10, right: 12, opacity: 0.7 }}>
          <Sparkline data={spark} color={accent ? "#d4a574" : "#7aa7d9"} />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const ganancia = totalGanancias();
  const florines = totalEnviosFlorines();
  const dolares = totalEnviosDolares();
  const entradas = totalEntradas();
  const salidas = totalSalidas();
  const spark = sparkEnviosDiarios();

  // Donut data — operator split
  const byOp: Record<string, number> = {};
  for (const e of ENVIOS) {
    byOp[e.operador] = (byOp[e.operador] ?? 0) + e.pesos;
  }
  const totalOp = Object.values(byOp).reduce((s, v) => s + v, 0);
  const opColors: Record<string, string> = {
    ROYMAN: "#7aa7d9",
    ERIKA: "#d4a574",
    LINA: "#c5a3d6",
    "JUAN PABLO": "#9bd6c3",
  };

  // Donut SVG
  const RADIUS = 56;
  const CX = 70;
  const CY = 70;
  let cumAngle = 0;
  const slices = Object.entries(byOp).map(([op, val]) => {
    const pct = val / totalOp;
    const startAngle = cumAngle;
    cumAngle += pct * 360;
    return { op, val, pct, startAngle, endAngle: cumAngle };
  });
  function polarToXY(deg: number, r: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }
  function arcPath(start: number, end: number) {
    const s = polarToXY(start, RADIUS);
    const e = polarToXY(end, RADIUS);
    const large = end - start > 180 ? 1 : 0;
    return `M ${CX} ${CY} L ${s.x} ${s.y} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${e.x} ${e.y} Z`;
  }

  const recent = [...ENVIOS].slice(-8).reverse();
  const recentEntradas = [...ENTRADAS].slice(-4).reverse();
  const recentSalidas = [...SALIDAS].slice(-4).reverse();

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="crumb">Período · Marzo 2026</div>
          <h1>Dashboard</h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" style={{ fontSize: 12 }}>
            Exportar
          </button>
          <NewEnvioButton label="+ Nuevo envío" style={{ fontSize: 12 }} />
        </div>
      </div>

      {/* Content */}
      <div className="content" style={{ padding: "28px 32px", flex: 1, overflowY: "auto" }}>
        {/* KPI grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <KpiCard
            label="Ganancias del mes"
            value={fmtCOP(ganancia)}
            accent
            delta={`${fmtNum((ganancia / totalEntradas()) * 100)}% margen`}
            positive
            spark={spark}
          />
          <KpiCard
            label="Total enviado"
            value={fmtAWG(florines)}
            delta={`${fmtUSD(dolares)}`}
            positive
          />
          <KpiCard
            label="Entradas del mes"
            value={fmtCOP(entradas)}
            delta={`${ENTRADAS.length} transacciones`}
            positive
          />
          <KpiCard
            label="Salidas / Gastos"
            value={fmtCOP(salidas)}
            delta={`${SALIDAS.length} gastos`}
            positive={false}
          />
        </div>

        {/* Second row: Summary + Operator chart + Activity */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Recent envíos */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Envíos recientes</div>
                <div className="panel-sub">Últimas 8 operaciones</div>
              </div>
              <div className="panel-actions">
                <a
                  href="/dashboard/envios"
                  className="btn btn-ghost"
                  style={{ fontSize: 11, padding: "5px 10px" }}
                >
                  Ver todos →
                </a>
              </div>
            </div>
            <div className="table-wrap" style={{ maxHeight: 360, overflowY: "auto" }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th style={{ textAlign: "right" }}>Pesos</th>
                    <th style={{ textAlign: "right" }}>Florines</th>
                    <th style={{ textAlign: "right" }}>Ganancia</th>
                    <th>Operador</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e, i) => (
                    <tr key={i}>
                      <td className="mono" style={{ fontSize: 11, color: "#858a93" }}>
                        {fmtDate(e.fecha)}
                      </td>
                      <td className="td-name">{e.nombre}</td>
                      <td className="num">{fmtCOP(e.pesos)}</td>
                      <td className="num">{fmtAWG(e.florines)}</td>
                      <td className="num pos">{fmtCOP(e.ganancia)}</td>
                      <td>
                        <OperatorChip name={e.operador} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operator donut */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Por operador</div>
                <div className="panel-sub">Distribución de envíos</div>
              </div>
            </div>
            <div
              style={{
                padding: 18,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div className="donut" style={{ position: "relative", width: 140, height: 140 }}>
                <svg width={140} height={140} viewBox="0 0 140 140">
                  <circle cx={CX} cy={CY} r={RADIUS} fill="#16191e" />
                  {slices.map((s, i) => (
                    <path
                      key={i}
                      d={arcPath(s.startAngle, s.endAngle)}
                      fill={opColors[s.op] ?? "#5a5f68"}
                      opacity={0.85}
                    />
                  ))}
                  <circle cx={CX} cy={CY} r={38} fill="#101215" />
                  <text
                    x={CX}
                    y={CY - 6}
                    textAnchor="middle"
                    fill="#e8eaed"
                    fontSize={11}
                    fontFamily="Instrument Serif, Georgia"
                  >
                    {ENVIOS.length}
                  </text>
                  <text
                    x={CX}
                    y={CY + 8}
                    textAnchor="middle"
                    fill="#5a5f68"
                    fontSize={9}
                    fontFamily="ui-monospace,monospace"
                  >
                    ENVÍOS
                  </text>
                </svg>
              </div>
              <div className="legend" style={{ marginTop: 14, width: "100%" }}>
                {slices.map((s, i) => (
                  <div key={i} className="legend-row">
                    <div
                      className="dot"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: opColors[s.op] ?? "#5a5f68",
                      }}
                    />
                    <span className="k" style={{ flex: 1, fontSize: 12, color: "#b8bcc4" }}>
                      {s.op}
                    </span>
                    <span className="v mono" style={{ color: "#e8eaed", fontSize: 11 }}>
                      {(s.pct * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Third row: Entradas + Salidas feed */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Entradas feed */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Entradas recientes</div>
              <div className="panel-actions">
                <a
                  href="/dashboard/entradas"
                  className="btn btn-ghost"
                  style={{ fontSize: 11, padding: "5px 10px" }}
                >
                  Ver →
                </a>
              </div>
            </div>
            <div>
              {recentEntradas.map((e, i) => (
                <div key={i} className="activity-row">
                  <div className="activity-icon in">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M8 2v9M4 7l4 4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <div className="activity-name" style={{ fontSize: 12 }}>
                      {e.descripcion}
                    </div>
                    <div className="activity-sub">{fmtDate(e.fecha)}</div>
                  </div>
                  <div className="activity-amount">
                    <div style={{ color: "#7cc08a" }}>{fmtCOP(e.total)}</div>
                    {e.entradaDolar && <div className="sub">{fmtUSD(e.entradaDolar)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salidas feed */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Salidas recientes</div>
              <div className="panel-actions">
                <a
                  href="/dashboard/salidas"
                  className="btn btn-ghost"
                  style={{ fontSize: 11, padding: "5px 10px" }}
                >
                  Ver →
                </a>
              </div>
            </div>
            <div>
              {recentSalidas.map((e, i) => (
                <div key={i} className="activity-row">
                  <div className="activity-icon out">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M8 14V5M4 9l4-4 4 4" />
                    </svg>
                  </div>
                  <div>
                    <div className="activity-name" style={{ fontSize: 12 }}>
                      {e.descripcion}
                    </div>
                    <div className="activity-sub">
                      <span>{fmtDate(e.fecha)}</span>
                      <span className="tag" style={{ marginLeft: 6 }}>
                        {e.categoria}
                      </span>
                    </div>
                  </div>
                  <div className="activity-amount">
                    <div style={{ color: "#e07575" }}>{fmtCOP(e.valor)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Balance snapshot */}
        <div className="balance-hero">
          <div
            className="mono"
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "#858a93",
              marginBottom: 12,
            }}
          >
            Resumen financiero · Marzo 2026
          </div>
          <div
            className="serif"
            style={{
              fontSize: 64,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              position: "relative",
              zIndex: 1,
            }}
          >
            {fmtUSD(BALANCE.totalDolares)}
            <span
              className="mono"
              style={{ fontSize: 14, color: "#858a93", marginLeft: 8, fontWeight: 400 }}
            >
              USD en circulación
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid #22262d",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#5a5f68",
                }}
              >
                Ganancias mes
              </div>
              <div className="serif" style={{ fontSize: 28, marginTop: 6, color: "#d4a574" }}>
                {fmtCOP(BALANCE.gananciasMes)}
              </div>
            </div>
            <div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#5a5f68",
                }}
              >
                Cambio promedio
              </div>
              <div className="serif" style={{ fontSize: 28, marginTop: 6 }}>
                ${fmtNum(BALANCE.cambioPromedio)}
              </div>
            </div>
            <div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#5a5f68",
                }}
              >
                Capitales activos
              </div>
              <div className="serif" style={{ fontSize: 28, marginTop: 6 }}>
                {fmtCOP(BALANCE.capitales.reduce((s, c) => s + c.valor, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
