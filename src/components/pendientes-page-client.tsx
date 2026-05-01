"use client";

import { Fragment, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  createPendienteAction,
  deletePendienteAction,
  updatePendienteStatusAction,
} from "@/app/dashboard/actions";
import { ClientTopbarPendingBell } from "@/components/client-topbar-pending-bell";
import { fmtDate, fmtDayLabel } from "@/lib/formatters";
import type { PendienteRecord } from "@/lib/movements-data";

const STATES = ["Todos", "Abiertos", "Completados"] as const;

export function PendientesPageClient({
  initialRows,
}: {
  initialRows: PendienteRecord[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [state, setState] = useState<(typeof STATES)[number]>("Todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [texto, setTexto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  const filtered = useMemo(() => {
    return rows.filter((item) => {
      const matchText = item.texto.toLowerCase().includes(search.toLowerCase());
      const matchState =
        state === "Todos" ||
        (state === "Abiertos" && !item.completado) ||
        (state === "Completados" && item.completado);
      const matchFrom = !dateFrom || item.fecha >= dateFrom;
      const matchTo = !dateTo || item.fecha <= dateTo;
      return matchText && matchState && matchFrom && matchTo;
    });
  }, [dateFrom, dateTo, rows, search, state]);

  const byDay = useMemo(() => {
    const groups: Record<string, PendienteRecord[]> = {};
    for (const row of filtered) {
      groups[row.fecha] ??= [];
      groups[row.fecha].push(row);
    }
    return groups;
  }, [filtered]);

  const sortedDays = Object.keys(byDay).sort((a, b) => b.localeCompare(a));
  const totalPages = Math.max(sortedDays.length, 1);
  const currentPage = Math.min(page, totalPages);
  const currentDay = sortedDays[currentPage - 1];
  const currentRows = currentDay ? byDay[currentDay] : [];
  const openCount = rows.filter((item) => !item.completado).length;
  const doneCount = rows.length - openCount;

  async function createPending(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanText = texto.trim();
    if (!cleanText) return;

    const createdId = await createPendienteAction({ fecha, texto: cleanText });
    setRows((current) => [
      ...current,
      {
        completado: false,
        fecha,
        id: createdId ?? `pendiente-${crypto.randomUUID()}`,
        texto: cleanText,
      },
    ]);
    setTexto("");
    setPage(1);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Control diario</div>
          <h1>Pendientes</h1>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <ClientTopbarPendingBell />
        </div>
      </div>

      <div className="content" style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(3, 1fr)",
            marginBottom: 20,
          }}
        >
          <div className="kpi accent" style={{ padding: "14px 18px" }}>
            <div className="label mono">Abiertos</div>
            <div className="value serif" style={{ color: "#e07575", fontSize: 24 }}>
              {openCount}
            </div>
          </div>
          <div className="kpi" style={{ padding: "14px 18px" }}>
            <div className="label mono">Completados</div>
            <div className="value serif" style={{ color: "#7cc08a", fontSize: 24 }}>
              {doneCount}
            </div>
          </div>
          <div className="kpi" style={{ padding: "14px 18px" }}>
            <div className="label mono">Filtrados</div>
            <div className="value mono" style={{ fontSize: 24 }}>
              {filtered.length}
            </div>
          </div>
        </div>

        <form
          className="panel"
          onSubmit={createPending}
          style={{
            alignItems: "end",
            display: "grid",
            gap: 12,
            gridTemplateColumns: "170px 1fr auto",
            marginBottom: 18,
            padding: 16,
          }}
        >
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label>Fecha</label>
            <input
              className="fin-input mono"
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
            />
          </div>
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label>Nuevo pendiente</label>
            <input
              className="fin-input"
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              placeholder="Texto del pendiente"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Agregar
          </button>
        </form>

        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <input
            className="search-input"
            placeholder="Buscar pendiente..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <div className="segmented">
            {STATES.map((item) => (
              <button
                key={item}
                className={state === item ? "active" : ""}
                type="button"
                onClick={() => {
                  setState(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            alignItems: "end",
            display: "grid",
            gap: 12,
            gridTemplateColumns: "180px 180px auto",
            marginBottom: 18,
          }}
        >
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label>Desde</label>
            <input
              className="fin-input mono"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label>Hasta</label>
            <input
              className="fin-input mono"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <button
            className="btn btn-ghost"
            style={{ justifySelf: "start" }}
            type="button"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setPage(1);
            }}
          >
            Limpiar fechas
          </button>
        </div>

        {sortedDays.length > 0 ? (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="mono" style={{ color: "#858a93", fontSize: 11 }}>
              Día {currentPage} de {totalPages} · {fmtDayLabel(currentDay)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-ghost"
                disabled={currentPage === totalPages}
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Siguiente
              </button>
              <button
                className="btn btn-ghost"
                disabled={currentPage === 1}
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Anterior
              </button>
            </div>
          </div>
        ) : null}

        <div className="panel" style={{ overflow: "hidden", padding: 0 }}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Pendiente</th>
                  <th>Estado</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {currentDay ? (
                  <Fragment key={currentDay}>
                    {currentRows.map((item) => (
                      <tr key={String(item.id)}>
                        <td className="mono" style={{ color: "#858a93", fontSize: 11 }}>
                          {fmtDate(item.fecha)}
                        </td>
                        <td
                          className="td-name"
                          style={{ color: item.completado ? "#7cc08a" : "#e07575" }}
                        >
                          {item.texto}
                        </td>
                        <td>
                          <label style={{ alignItems: "center", display: "flex", gap: 8 }}>
                            <input
                              checked={item.completado}
                              type="checkbox"
                              onChange={async (event) => {
                                const completado = event.target.checked;
                                if (typeof item.id === "number") {
                                  await updatePendienteStatusAction(item.id, completado);
                                }
                                setRows((current) =>
                                  current.map((row) =>
                                    row.id === item.id ? { ...row, completado } : row
                                  )
                                );
                              }}
                            />
                            <span style={{ color: item.completado ? "#7cc08a" : "#e07575" }}>
                              {item.completado ? "Completado" : "Abierto"}
                            </span>
                          </label>
                        </td>
                        <td>
                          <button
                            className="icon-btn"
                            type="button"
                            onClick={async () => {
                              if (typeof item.id === "number") await deletePendienteAction(item.id);
                              setRows((current) => current.filter((row) => row.id !== item.id));
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ) : (
                  <tr>
                    <td colSpan={4} style={{ color: "#858a93", padding: 18 }}>
                      Sin pendientes para el filtro actual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
