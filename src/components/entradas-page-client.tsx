"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  createEntradaAction,
  deleteEntradaAction,
  updateEntradaAction,
} from "@/app/dashboard/actions";
import { EntradaDrawer } from "@/components/entrada-drawer";
import { fmtCOP, fmtDate, fmtNum, fmtUSD } from "@/lib/formatters";
import type { EntradaRecord } from "@/lib/movements-data";

export function EntradasPageClient({ initialRows }: { initialRows: EntradaRecord[] }) {
  const [rows, setRows] = useState<EntradaRecord[]>(initialRows);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const editingRow = rows.find((row) => row.id === editingId) ?? null;
  const sorted = useMemo(() => [...rows].sort((a, b) => a.fecha.localeCompare(b.fecha)), [rows]);
  const total = rows.reduce((s, e) => s + e.total, 0);
  const totalUSD = rows.reduce((s, e) => s + (e.entradaDolar ?? 0), 0);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Período · Marzo 2026</div>
          <h1>Entradas</h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" style={{ fontSize: 12 }}>
            Exportar
          </button>
          <button
            className="btn btn-primary"
            style={{ fontSize: 12 }}
            type="button"
            onClick={() => setEditingId("new")}
          >
            + Nueva entrada
          </button>
        </div>
      </div>

      <div className="content" style={{ padding: "28px 32px", flex: 1, overflowY: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div className="kpi" style={{ padding: "14px 18px" }}>
            <div className="label mono">Registros</div>
            <div className="value mono" style={{ fontSize: 22 }}>
              {rows.length}
            </div>
          </div>
          <div className="kpi accent" style={{ padding: "14px 18px" }}>
            <div className="label mono">Total COP</div>
            <div className="value serif" style={{ fontSize: 22 }}>
              {fmtCOP(total)}
            </div>
          </div>
          <div className="kpi" style={{ padding: "14px 18px" }}>
            <div className="label mono">Total USD recibido</div>
            <div className="value serif" style={{ fontSize: 22 }}>
              {fmtUSD(totalUSD)}
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th style={{ textAlign: "right" }}>USD recibido</th>
                  <th style={{ textAlign: "right" }}>Tasa</th>
                  <th style={{ textAlign: "right" }}>Total COP</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {sorted.map((e) => (
                  <tr key={String(e.id)}>
                    <td
                      className="mono"
                      style={{ fontSize: 11, color: "#858a93", whiteSpace: "nowrap" }}
                    >
                      {fmtDate(e.fecha)}
                    </td>
                    <td className="td-name">{e.descripcion}</td>
                    <td className="num">
                      {e.entradaDolar ? (
                        <span style={{ color: "#7cc08a" }}>{fmtUSD(e.entradaDolar)}</span>
                      ) : (
                        <span style={{ color: "#5a5f68" }}>—</span>
                      )}
                    </td>
                    <td className="num mono" style={{ fontSize: 11, color: "#858a93" }}>
                      {e.cambio ? `$${fmtNum(e.cambio)}` : "—"}
                    </td>
                    <td className="num" style={{ color: "#7cc08a", fontWeight: 600 }}>
                      {fmtCOP(e.total)}
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        type="button"
                        aria-label={`Editar ${e.descripcion}`}
                        onClick={() => setEditingId(e.id)}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1px solid #2a2f38" }}>
                  <td
                    colSpan={2}
                    className="mono"
                    style={{ padding: "10px 16px", color: "#858a93", fontSize: 11 }}
                  >
                    TOTAL · {rows.length} registros
                  </td>
                  <td className="num" style={{ color: "#7cc08a", fontWeight: 600 }}>
                    {fmtUSD(totalUSD)}
                  </td>
                  <td />
                  <td className="num" style={{ color: "#7cc08a", fontWeight: 700 }}>
                    {fmtCOP(total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {editingId ? (
        <EntradaDrawer
          mode={editingId === "new" ? "create" : "edit"}
          initialEntrada={editingRow ?? undefined}
          onClose={() => setEditingId(null)}
          onDelete={
            editingRow
              ? async () => {
                  if (typeof editingRow.id === "number") await deleteEntradaAction(editingRow.id);
                  setRows((current) => current.filter((row) => row.id !== editingRow.id));
                  setEditingId(null);
                }
              : undefined
          }
          onSave={async (entrada) => {
            if (editingId === "new") {
              const createdId = await createEntradaAction(entrada);
              setRows((current) => [
                ...current,
                { ...entrada, id: createdId ?? `entrada-${crypto.randomUUID()}` },
              ]);
            } else if (editingRow) {
              if (typeof editingRow.id === "number")
                await updateEntradaAction(editingRow.id, entrada);
              setRows((current) =>
                current.map((row) => (row.id === editingRow.id ? { ...row, ...entrada } : row)),
              );
            }
            setEditingId(null);
          }}
        />
      ) : null}
    </>
  );
}
