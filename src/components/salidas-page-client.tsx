"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  createSalidaAction,
  deleteSalidaAction,
  updateSalidaAction,
} from "@/app/dashboard/actions";
import { SalidaDrawer } from "@/components/salida-drawer";
import { fmtCOP, fmtDate } from "@/lib/formatters";
import type { Salida } from "@/lib/data";
import type { SalidaRecord } from "@/lib/movements-data";

const CATEGORIA_COLORS: Record<Salida["categoria"], string> = {
  Créditos: "#c5a3d6",
  Impuestos: "#e07575",
  Otros: "#858a93",
  Pagos: "#7aa7d9",
  Viajes: "#9bd6c3",
};

export function SalidasPageClient({ initialRows }: { initialRows: SalidaRecord[] }) {
  const [rows, setRows] = useState<SalidaRecord[]>(initialRows);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const editingRow = rows.find((row) => row.id === editingId) ?? null;
  const sorted = useMemo(() => [...rows].sort((a, b) => a.fecha.localeCompare(b.fecha)), [rows]);

  const byCategoria = useMemo(() => {
    const totals: Partial<Record<Salida["categoria"], number>> = {};

    for (const row of rows) {
      totals[row.categoria] = (totals[row.categoria] ?? 0) + row.valor;
    }

    return totals;
  }, [rows]);

  const total = rows.reduce((sum, row) => sum + row.valor, 0);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Periodo · Marzo 2026</div>
          <h1>Salidas</h1>
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
            + Nueva salida
          </button>
        </div>
      </div>

      <div className="content" style={{ padding: "28px 32px", flex: 1, overflowY: "auto" }}>
        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "repeat(5, 1fr)",
            marginBottom: 20,
          }}
        >
          {(Object.entries(byCategoria) as [Salida["categoria"], number][]).map(([cat, value]) => (
            <div key={cat} className="kpi" style={{ padding: "12px 16px" }}>
              <div className="label mono" style={{ color: CATEGORIA_COLORS[cat] }}>
                {cat}
              </div>
              <div className="value serif" style={{ color: "#e07575", fontSize: 18 }}>
                {fmtCOP(value)}
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripcion</th>
                  <th>Categoria</th>
                  <th style={{ textAlign: "right" }}>Valor</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={String(row.id)}>
                    <td
                      className="mono"
                      style={{ color: "#858a93", fontSize: 11, whiteSpace: "nowrap" }}
                    >
                      {fmtDate(row.fecha)}
                    </td>
                    <td className="td-name">{row.descripcion}</td>
                    <td>
                      <span
                        className="tag"
                        style={{
                          background: `${CATEGORIA_COLORS[row.categoria]}18`,
                          border: `1px solid ${CATEGORIA_COLORS[row.categoria]}30`,
                          color: CATEGORIA_COLORS[row.categoria],
                        }}
                      >
                        {row.categoria}
                      </span>
                    </td>
                    <td className="num" style={{ color: "#e07575", fontWeight: 600 }}>
                      {fmtCOP(row.valor)}
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        type="button"
                        aria-label={`Editar ${row.descripcion}`}
                        onClick={() => setEditingId(row.id)}
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
                    colSpan={3}
                    className="mono"
                    style={{ color: "#858a93", fontSize: 11, padding: "10px 16px" }}
                  >
                    TOTAL · {rows.length} registros
                  </td>
                  <td className="num" style={{ color: "#e07575", fontWeight: 700 }}>
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
        <SalidaDrawer
          mode={editingId === "new" ? "create" : "edit"}
          initialSalida={editingRow ?? undefined}
          onClose={() => setEditingId(null)}
          onDelete={
            editingRow
              ? async () => {
                  if (typeof editingRow.id === "number") {
                    await deleteSalidaAction(editingRow.id);
                  }

                  setRows((current) => current.filter((row) => row.id !== editingRow.id));
                  setEditingId(null);
                }
              : undefined
          }
          onSave={async (salida) => {
            if (editingId === "new") {
              const createdId = await createSalidaAction(salida);
              setRows((current) => [
                ...current,
                { ...salida, id: createdId ?? `salida-${crypto.randomUUID()}` },
              ]);
            } else if (editingRow) {
              if (typeof editingRow.id === "number") {
                await updateSalidaAction(editingRow.id, salida);
              }

              setRows((current) =>
                current.map((row) => (row.id === editingRow.id ? { ...row, ...salida } : row)),
              );
            }

            setEditingId(null);
          }}
        />
      ) : null}
    </>
  );
}
