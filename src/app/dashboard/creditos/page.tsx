import { ClientTopbarPendingBell } from "@/components/client-topbar-pending-bell";
import { CREDITOS_4X1000, totalCreditos } from "@/lib/data";
import { fmtCOP, fmtDate } from "@/lib/formatters";

export default function CreditosPage() {
  const sorted = [...CREDITOS_4X1000].sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Group by bank for summary
  const byBanco: Record<string, number> = {};
  for (const c of CREDITOS_4X1000) {
    byBanco[c.banco] = (byBanco[c.banco] ?? 0) + c.valor;
  }

  const total = totalCreditos();
  const GMF_RATE = 0.004; // 4×1000

  // Estimated base (4×1000 = 0.4% of transaction)
  const baseEstimada = total / GMF_RATE;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Período · Marzo 2026</div>
          <h1>4×1000</h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <ClientTopbarPendingBell />
          <button className="btn btn-primary" style={{ fontSize: 12 }}>
            + Nuevo crédito
          </button>
        </div>
      </div>

      <div className="content" style={{ padding: "28px 32px", flex: 1, overflowY: "auto" }}>
        {/* Explanation card */}
        <div
          style={{
            marginBottom: 20,
            padding: "14px 18px",
            background: "#16191e",
            border: "1px solid #22262d",
            borderRadius: 10,
            display: "flex",
            gap: 24,
            alignItems: "center",
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
              Gravamen Mov. Financieros
            </div>
            <div className="serif" style={{ fontSize: 28, marginTop: 4, color: "#d4a574" }}>
              4×1000
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: "#22262d" }} />
          <div>
            <div
              className="mono"
              style={{ fontSize: 10, color: "#5a5f68", textTransform: "uppercase" }}
            >
              Tasa aplicada
            </div>
            <div className="mono" style={{ fontSize: 18, marginTop: 2, color: "#e8eaed" }}>
              0.4%
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: "#22262d" }} />
          <div>
            <div
              className="mono"
              style={{ fontSize: 10, color: "#5a5f68", textTransform: "uppercase" }}
            >
              Total impuesto cobrado
            </div>
            <div className="serif" style={{ fontSize: 22, marginTop: 2, color: "#e07575" }}>
              {fmtCOP(total)}
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: "#22262d" }} />
          <div>
            <div
              className="mono"
              style={{ fontSize: 10, color: "#5a5f68", textTransform: "uppercase" }}
            >
              Base transaccional estimada
            </div>
            <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>
              {fmtCOP(baseEstimada)}
            </div>
          </div>
        </div>

        {/* Summary by bank */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {Object.entries(byBanco).map(([banco, val]) => (
            <div key={banco} className="kpi" style={{ padding: "14px 18px" }}>
              <div className="label mono">{banco}</div>
              <div className="value serif" style={{ fontSize: 22, color: "#e07575" }}>
                {fmtCOP(val)}
              </div>
              <div className="delta down" style={{ marginTop: 4 }}>
                {CREDITOS_4X1000.filter((c) => c.banco === banco).length} cobros
              </div>
            </div>
          ))}
        </div>

        {/* Detail table */}
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="panel-header" style={{ padding: "14px 20px" }}>
            <div>
              <div className="panel-title">Detalle de cobros</div>
              <div className="panel-sub">{CREDITOS_4X1000.length} registros en el período</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Banco</th>
                  <th>Cuenta</th>
                  <th style={{ textAlign: "right" }}>Valor GMF</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => (
                  <tr key={i}>
                    <td
                      className="mono"
                      style={{ fontSize: 11, color: "#858a93", whiteSpace: "nowrap" }}
                    >
                      {fmtDate(c.fecha)}
                    </td>
                    <td>
                      <span
                        className="tag"
                        style={{
                          background: c.banco === "NEQUI" ? "#8b5cf620" : "#3b82f620",
                          color: c.banco === "NEQUI" ? "#c5a3d6" : "#7aa7d9",
                          border: `1px solid ${c.banco === "NEQUI" ? "#c5a3d630" : "#7aa7d930"}`,
                        }}
                      >
                        {c.banco}
                      </span>
                    </td>
                    <td style={{ color: "#b8bcc4" }}>{c.cuenta}</td>
                    <td className="num" style={{ color: "#e07575", fontWeight: 600 }}>
                      {fmtCOP(c.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1px solid #2a2f38" }}>
                  <td
                    colSpan={3}
                    className="mono"
                    style={{ padding: "10px 16px", color: "#858a93", fontSize: 11 }}
                  >
                    TOTAL GMF · {CREDITOS_4X1000.length} cobros
                  </td>
                  <td className="num" style={{ color: "#e07575", fontWeight: 700 }}>
                    {fmtCOP(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
