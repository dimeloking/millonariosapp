'use client';

import { Fragment, useMemo, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  createEnvioAction,
  deleteEnvioAction,
  updateEnvioAction,
} from '@/app/dashboard/actions';
import { DayPaginationHeader } from '@/components/day-pagination-header';
import { EnvioDrawer, NewEnvioButton } from '@/components/new-envio-button';
import { ClientTopbarPendingBell } from '@/components/client-topbar-pending-bell';
import { OperatorChip } from '@/components/operator-chip';
import type { Envio } from '@/lib/data';
import {
  fmtAWG,
  fmtCOP,
  fmtDate,
  fmtNum,
  fmtUSD,
} from '@/lib/formatters';
import type { EnvioRecord } from '@/lib/movements-data';

const OPERATORS = ['Todos', 'ROYMAN', 'ERIKA', 'LINA', 'JUAN PABLO'] as const;

export function EnviosPageClient({
  initialRows,
}: {
  initialRows: EnvioRecord[];
}) {
  const [rows, setRows] = useState<EnvioRecord[]>(initialRows);
  const [search, setSearch] = useState('');
  const [operator, setOperator] = useState('Todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const editingRow = rows.find((row) => row.id === editingId) ?? null;

  const filtered = useMemo(() => {
    return rows.filter((e) => {
      const matchName = e.nombre.toLowerCase().includes(search.toLowerCase());
      const matchOp = operator === 'Todos' || e.operador === operator;
      const matchFrom = !dateFrom || e.fecha >= dateFrom;
      const matchTo = !dateTo || e.fecha <= dateTo;
      return matchName && matchOp && matchFrom && matchTo;
    });
  }, [dateFrom, dateTo, operator, rows, search]);

  const byDay = useMemo(() => {
    const groups: Record<string, EnvioRecord[]> = {};
    for (const e of filtered) {
      if (!groups[e.fecha]) groups[e.fecha] = [];
      groups[e.fecha].push(e);
    }
    return groups;
  }, [filtered]);

  const sortedDays = Object.keys(byDay).sort((a, b) => b.localeCompare(a));
  const totalPages = Math.max(sortedDays.length, 1);
  const currentPage = Math.min(page, totalPages);
  const currentDays = sortedDays.slice(currentPage - 1, currentPage);
  const currentDayRows = currentDays[0] ? byDay[currentDays[0]] : [];
  const currentDay = currentDays[0] ?? '';

  const filteredPesos = filtered.reduce((s, e) => s + e.pesos, 0);
  const filteredFlorines = filtered.reduce((s, e) => s + e.florines, 0);
  const filteredDolares = filtered.reduce((s, e) => s + e.dolares, 0);
  const filteredGan = filtered.reduce((s, e) => s + e.ganancia, 0);
  const totalPesos = currentDayRows.reduce((s, e) => s + e.pesos, 0);
  const totalFlorines = currentDayRows.reduce((s, e) => s + e.florines, 0);
  const totalDolares = currentDayRows.reduce((s, e) => s + e.dolares, 0);
  const totalGan = currentDayRows.reduce((s, e) => s + e.ganancia, 0);

  const createEnvio = async (envio: Envio) => {
    const createdId = await createEnvioAction(envio);
    setRows((current) => [
      ...current,
      {
        ...envio,
        id: createdId ?? `${envio.fecha}-${crypto.randomUUID()}`,
      },
    ]);
    setPage(1);
  };

  const updateEnvio = async (id: number | string, envio: Envio) => {
    if (typeof id === 'number') {
      await updateEnvioAction(id, envio);
    }

    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...envio } : row))
    );
    setPage(1);
  };

  const deleteEnvio = async (id: number | string) => {
    if (typeof id === 'number') {
      await deleteEnvioAction(id);
    }

    setRows((current) => current.filter((row) => row.id !== id));
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Período · Marzo 2026</div>
          <h1>Envíos</h1>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <ClientTopbarPendingBell />
          <NewEnvioButton
            label="+ Nuevo envío"
            style={{ fontSize: 12 }}
            onSaveAction={createEnvio}
          />
        </div>
      </div>

      <div
        className="content"
        style={{ padding: '28px 32px', flex: 1, overflowY: 'auto' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: 'Registros filtrados',
              value: String(filtered.length),
              mono: true,
            },
            { label: 'Total pesos filtrado', value: fmtCOP(filteredPesos) },
            {
              label: 'Total florines filtrado',
              value: fmtAWG(filteredFlorines),
            },
            {
              label: 'Total dólares filtrado',
              value: fmtUSD(filteredDolares),
            },
            {
              label: 'Ganancias filtradas',
              value: fmtCOP(filteredGan),
              accent: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`kpi${s.accent ? ' accent' : ''}`}
              style={{ padding: '14px 18px' }}
            >
              <div className="label mono">{s.label}</div>
              <div
                className={`value ${s.mono ? 'mono' : 'serif'}`}
                style={{ fontSize: 22 }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <input
            className="search-input"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="segmented">
            {OPERATORS.map((op) => (
              <button
                key={op}
                className={operator === op ? 'active' : ''}
                onClick={() => {
                  setOperator(op);
                  setPage(1);
                }}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            alignItems: 'end',
            display: 'grid',
            gap: 12,
            gridTemplateColumns: '180px 180px auto',
            marginBottom: 18,
          }}
        >
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label htmlFor="envios-date-from">Desde</label>
            <input
              className="fin-input mono"
              id="envios-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label htmlFor="envios-date-to">Hasta</label>
            <input
              className="fin-input mono"
              id="envios-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div
            style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}
          >
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12 }}
              type="button"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
            >
              Limpiar fechas
            </button>
            <div
              className="mono"
              style={{ alignSelf: 'center', color: '#858a93', fontSize: 11 }}
            >
              {filtered.length} registros · {fmtUSD(filteredDolares)}
            </div>
          </div>
        </div>

        {sortedDays.length > 0 && (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 10,
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <DayPaginationHeader currentDay={currentDay} currentPage={currentPage} totalPages={totalPages} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-ghost"
                disabled={currentPage === totalPages}
                style={{
                  fontSize: 12,
                  opacity: currentPage === totalPages ? 0.45 : 1,
                }}
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
              >
                Siguiente
              </button>
              <button
                className="btn btn-ghost"
                disabled={currentPage === 1}
                style={{ fontSize: 12, opacity: currentPage === 1 ? 0.45 : 1 }}
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Anterior
              </button>
            </div>
          </div>
        )}

        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Operador</th>
                  <th>Cliente</th>
                  <th style={{ textAlign: 'right' }}>Cambio</th>
                  <th style={{ textAlign: 'right' }}>Estipulado</th>
                  <th style={{ textAlign: 'right' }}>Pesos</th>
                  <th style={{ textAlign: 'right' }}>Florines</th>
                  <th style={{ textAlign: 'right' }}>Dólares</th>
                  <th style={{ textAlign: 'right' }}>Ganancia</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {sortedDays.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        textAlign: 'center',
                        padding: '32px 0',
                        color: '#5a5f68',
                      }}
                    >
                      Sin resultados para &ldquo;{search}&rdquo;
                    </td>
                  </tr>
                )}
                {currentDays.map((day) => {
                  const dayRows = byDay[day];
                  return (
                    <Fragment key={day}>
                      {dayRows.map((e) => (
                        <tr key={String(e.id)}>
                          <td
                            className="mono"
                            style={{ fontSize: 11, color: '#858a93' }}
                          >
                            {fmtDate(e.fecha)}
                          </td>
                          <td>
                            <OperatorChip name={e.operador} />
                          </td>
                          <td className="td-name">{e.nombre}</td>
                          <td
                            className="num mono"
                            style={{ color: '#858a93', fontSize: 11 }}
                          >
                            ${fmtNum(e.cambio)}
                          </td>
                          <td
                            className="num mono"
                            style={{ color: '#858a93', fontSize: 11 }}
                          >
                            ${fmtNum(e.estipulado)}
                          </td>
                          <td className="num">{fmtCOP(e.pesos)}</td>
                          <td className="num">{fmtAWG(e.florines)}</td>
                          <td className="num">{fmtUSD(e.dolares)}</td>
                          <td className="num pos">{fmtCOP(e.ganancia)}</td>
                          <td>
                            <button
                              className="icon-btn"
                              type="button"
                              aria-label={`Editar ${e.nombre}`}
                              onClick={() => setEditingId(e.id)}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
              {currentDayRows.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: '1px solid #2a2f38' }}>
                    <td
                      colSpan={4}
                      className="mono"
                      style={{
                        padding: '10px 16px',
                        color: '#858a93',
                        fontSize: 11,
                      }}
                    >
                      TOTAL DEL DIA · {currentDayRows.length} registros
                    </td>
                    <td
                      className="num"
                      style={{ fontWeight: 600, color: '#e8eaed' }}
                    >
                      {fmtCOP(totalPesos)}
                    </td>
                    <td
                      className="num"
                      style={{ fontWeight: 600, color: '#e8eaed' }}
                    >
                      {fmtAWG(totalFlorines)}
                    </td>
                    <td
                      className="num"
                      style={{ fontWeight: 600, color: '#e8eaed' }}
                    >
                      {fmtUSD(totalDolares)}
                    </td>
                    <td className="num pos" style={{ fontWeight: 700 }}>
                      {fmtCOP(totalGan)}
                    </td>
                    <td />
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {editingRow ? (
        <EnvioDrawer
          mode="edit"
          initialEnvio={editingRow}
          onCloseAction={() => setEditingId(null)}
          onDeleteAction={async () => {
            await deleteEnvio(editingRow.id);
            setEditingId(null);
          }}
          onSaveAction={async (envio) => {
            await updateEnvio(editingRow.id, envio);
            setEditingId(null);
          }}
        />
      ) : null}
    </>
  );
}
