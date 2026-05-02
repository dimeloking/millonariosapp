"use client";

import { Fragment, useMemo, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import {
  deleteSalidaExternaAction,
  devolverEnvioSaldoAction,
} from "@/app/dashboard/actions";
import { ClientTopbarPendingBell } from "@/components/client-topbar-pending-bell";
import { OperatorChip } from "@/components/operator-chip";
import {
  fmtAWG,
  fmtCOP,
  fmtDate,
  fmtDayLabel,
  fmtNum,
  fmtUSD,
} from "@/lib/formatters";
import type { EnvioRecord, SalidaExternaRecord } from "@/lib/movements-data";

type SalidasExternasPageClientProps = {
  envios: EnvioRecord[];
  initialRows: SalidaExternaRecord[];
};

export function SalidasExternasPageClient({
  envios,
  initialRows,
}: SalidasExternasPageClientProps) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | string | null>(null);

  const returnedByEnvio = useMemo(() => {
    const map = new Map<number, SalidaExternaRecord>();
    for (const row of rows) {
      if (row.envioId) map.set(row.envioId, row);
    }
    return map;
  }, [rows]);

  const filteredEnvios = useMemo(() => {
    return envios.filter((row) => {
      const text = `${row.nombre} ${row.operador}`.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const matchFrom = !dateFrom || row.fecha >= dateFrom;
      const matchTo = !dateTo || row.fecha <= dateTo;
      return matchSearch && matchFrom && matchTo;
    });
  }, [dateFrom, dateTo, envios, search]);

  const byDay = useMemo(() => {
    const groups: Record<string, EnvioRecord[]> = {};
    for (const row of filteredEnvios) {
      groups[row.fecha] ??= [];
      groups[row.fecha].push(row);
    }
    return groups;
  }, [filteredEnvios]);

  const sortedDays = Object.keys(byDay).sort((a, b) => b.localeCompare(a));
  const totalPages = Math.max(sortedDays.length, 1);
  const currentPage = Math.min(page, totalPages);
  const currentDay = sortedDays[currentPage - 1];
  const currentRows = currentDay ? byDay[currentDay] : [];

  const totalEnviadoUsd = filteredEnvios.reduce((sum, row) => sum + row.dolares, 0);
  const totalEnviadoFl = filteredEnvios.reduce((sum, row) => sum + row.florines, 0);
  const totalRetornadoUsd = rows.reduce((sum, row) => sum + row.dolares, 0);
  const totalRetornadoFl = rows.reduce((sum, row) => sum + row.florines, 0);
  const totalRetornadoCop = rows.reduce((sum, row) => sum + row.pesos, 0);
  const pendienteUsd = totalEnviadoUsd - totalRetornadoUsd;
  const pendienteFl = totalEnviadoFl - totalRetornadoFl;

  async function devolverSaldo(envio: EnvioRecord) {
    if (typeof envio.id !== "number") return;

    const envioId = envio.id;
    setBusyId(envioId);
    try {
      const created = await devolverEnvioSaldoAction(envioId);
      const totalDevuelto = Math.round(envio.pesos + envio.ganancia);
      setRows((current) => [
        ...current,
        {
          cambio: envio.cambio,
          descripcion: `Retorno envío ${envio.nombre}`,
          dolares: envio.dolares,
          empleado: envio.operador,
          entradaId: created.entradaId,
          envioId,
          fecha: envio.fecha,
          florines: envio.florines,
          id: created.id ?? `devolucion-${crypto.randomUUID()}`,
          pesos: totalDevuelto,
        },
      ]);
    } finally {
      setBusyId(null);
    }
  }

  async function eliminarDevolucion(row: SalidaExternaRecord) {
    if (typeof row.id === "number") {
      await deleteSalidaExternaAction(row.id);
    }
    setRows((current) => current.filter((item) => item.id !== row.id));
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Caja externa · Aruba</div>
          <h1>Salidas ext.</h1>
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
            gridTemplateColumns: "repeat(4, 1fr)",
            marginBottom: 20,
          }}
        >
          <div className="kpi">
            <div className="label mono">Pendiente Aruba USD</div>
            <div className="value serif" style={{ fontSize: 22 }}>
              {fmtUSD(pendienteUsd)}
            </div>
          </div>
          <div className="kpi">
            <div className="label mono">Pendiente Aruba FL</div>
            <div className="value serif" style={{ fontSize: 22 }}>
              {fmtAWG(pendienteFl)}
            </div>
          </div>
          <div className="kpi accent">
            <div className="label mono">Retornado Colombia</div>
            <div className="value serif" style={{ fontSize: 22 }}>
              {fmtCOP(totalRetornadoCop)}
            </div>
          </div>
          <div className="kpi">
            <div className="label mono">Retornos</div>
            <div className="value mono" style={{ fontSize: 22 }}>
              {rows.length}
            </div>
          </div>
        </div>

        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <input
            className="search-input"
            placeholder="Buscar cliente u operador..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
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

        {currentDay ? (
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
                  <th>Operador</th>
                  <th>Cliente</th>
                  <th style={{ textAlign: "right" }}>Cambio</th>
                  <th style={{ textAlign: "right" }}>Pesos</th>
                  <th style={{ textAlign: "right" }}>Dólares</th>
                  <th style={{ textAlign: "right" }}>Ganancia</th>
                  <th style={{ textAlign: "right" }}>Retorna COP</th>
                  <th style={{ width: 150 }} />
                </tr>
              </thead>
              <tbody>
                {currentDay ? (
                  <Fragment key={currentDay}>
                    {currentRows.map((envio) => {
                      const devolucion =
                        typeof envio.id === "number" ? returnedByEnvio.get(envio.id) : null;
                      const totalDevuelve = Math.round(envio.pesos + envio.ganancia);

                      return (
                        <tr key={String(envio.id)}>
                          <td className="mono" style={{ color: "#858a93", fontSize: 11 }}>
                            {fmtDate(envio.fecha)}
                          </td>
                          <td>
                            <OperatorChip name={envio.operador} />
                          </td>
                          <td className="td-name">{envio.nombre}</td>
                          <td className="num mono" style={{ color: "#858a93", fontSize: 11 }}>
                            ${fmtNum(envio.cambio)}
                          </td>
                          <td className="num">{fmtCOP(envio.pesos)}</td>
                          <td className="num">{fmtUSD(envio.dolares)}</td>
                          <td className="num pos">{fmtCOP(envio.ganancia)}</td>
                          <td className="num" style={{ color: "#d4a574", fontWeight: 700 }}>
                            {fmtCOP(totalDevuelve)}
                          </td>
                          <td>
                            {devolucion ? (
                              <button
                                className="btn btn-ghost"
                                style={{ color: "#e07575", fontSize: 12 }}
                                type="button"
                                onClick={() => eliminarDevolucion(devolucion)}
                              >
                                <Trash2 size={14} />
                                Quitar
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary"
                                disabled={busyId === envio.id || typeof envio.id !== "number"}
                                style={{ fontSize: 12 }}
                                type="button"
                                onClick={() => devolverSaldo(envio)}
                              >
                                <RotateCcw size={14} />
                                Retornar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ) : (
                  <tr>
                    <td colSpan={9} style={{ color: "#858a93", padding: 18 }}>
                      Sin envíos para el filtro actual.
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
