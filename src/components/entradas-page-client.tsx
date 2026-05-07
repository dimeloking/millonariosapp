'use client';

import { Fragment, useMemo, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  createEntradaAction,
  deleteEntradaAction,
  updateEntradaAction,
} from '@/app/dashboard/actions';
import { ClientTopbarPendingBell } from '@/components/client-topbar-pending-bell';
import { DayPaginationHeader } from '@/components/day-pagination-header';
import { EntradaDrawer } from '@/components/entrada-drawer';
import { fmtCOP, fmtDate, fmtUSD } from '@/lib/formatters';
import type { EntradaRecord } from '@/lib/movements-data';

function entradaCop(row: EntradaRecord) {
  return row.moneda === 'COP' ? row.total : 0;
}

function entradaUsd(row: EntradaRecord) {
  return row.moneda === 'USD' ? (row.entradaDolar ?? 0) : 0;
}

export function EntradasPageClient({
  initialRows,
}: {
  initialRows: EntradaRecord[];
}) {
  const [rows, setRows] = useState<EntradaRecord[]>(initialRows);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const editingRow = rows.find((row) => row.id === editingId) ?? null;

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchSearch = row.descripcion
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchFrom = !dateFrom || row.fecha >= dateFrom;
      const matchTo = !dateTo || row.fecha <= dateTo;
      return matchSearch && matchFrom && matchTo;
    });
  }, [dateFrom, dateTo, rows, search]);

  const byDay = useMemo(() => {
    const groups: Record<string, EntradaRecord[]> = {};
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
  const filteredTotalCop = filtered.reduce(
    (sum, item) => sum + entradaCop(item),
    0
  );
  const filteredTotalUsd = filtered.reduce(
    (sum, item) => sum + entradaUsd(item),
    0
  );
  const dayTotalCop = currentRows.reduce(
    (sum, item) => sum + entradaCop(item),
    0
  );
  const dayTotalUsd = currentRows.reduce(
    (sum, item) => sum + entradaUsd(item),
    0
  );

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Movimiento · Capital entrante</div>
          <h1>Entradas</h1>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <ClientTopbarPendingBell />
          <button
            className="btn btn-primary"
            style={{ fontSize: 12 }}
            type="button"
            onClick={() => setEditingId('new')}
          >
            + Nueva entrada
          </button>
        </div>
      </div>

      <div
        className="content"
        style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}
      >
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(3, 1fr)',
            marginBottom: 20,
          }}
        >
          <div className="kpi" style={{ padding: '14px 18px' }}>
            <div className="label mono">Registros filtrados</div>
            <div className="value mono" style={{ fontSize: 22 }}>
              {filtered.length}
            </div>
          </div>
          <div className="kpi accent" style={{ padding: '14px 18px' }}>
            <div className="label mono">Total COP filtrado</div>
            <div className="value serif" style={{ fontSize: 22 }}>
              {fmtCOP(filteredTotalCop)}
            </div>
          </div>
          <div className="kpi" style={{ padding: '14px 18px' }}>
            <div className="label mono">Total USD filtrado</div>
            <div className="value serif" style={{ fontSize: 22 }}>
              {fmtUSD(filteredTotalUsd)}
            </div>
          </div>
        </div>

        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <input
            className="search-input"
            placeholder="Buscar descripción..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
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
            style={{ justifySelf: 'start' }}
            type="button"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
              setPage(1);
            }}
          >
            Limpiar fechas
          </button>
        </div>

        {currentDay ? (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <DayPaginationHeader
              currentDay={currentDay}
              currentPage={currentPage}
              totalPages={totalPages}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-ghost"
                disabled={currentPage === totalPages}
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
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Anterior
              </button>
            </div>
          </div>
        ) : null}

        <div className="panel" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Moneda</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {currentDay ? (
                  <Fragment key={currentDay}>
                    {currentRows.map((row) => (
                      <tr key={String(row.id)}>
                        <td
                          className="mono"
                          style={{ color: '#858a93', fontSize: 11 }}
                        >
                          {fmtDate(row.fecha)}
                        </td>
                        <td className="td-name">{row.descripcion}</td>
                        <td>
                          <span className="tag">{row.moneda}</span>
                        </td>
                        <td className="num pos">
                          {row.moneda === 'COP'
                            ? fmtCOP(row.total)
                            : fmtUSD(row.entradaDolar ?? 0)}
                        </td>
                        <td>
                          <button
                            className="icon-btn"
                            type="button"
                            onClick={() => setEditingId(row.id)}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ) : (
                  <tr>
                    <td colSpan={5} style={{ color: '#858a93', padding: 18 }}>
                      Sin entradas para el filtro actual.
                    </td>
                  </tr>
                )}
              </tbody>
              {currentRows.length > 0 ? (
                <tfoot>
                  <tr style={{ borderTop: '1px solid #2a2f38' }}>
                    <td
                      colSpan={3}
                      className="mono"
                      style={{
                        color: '#858a93',
                        fontSize: 11,
                        padding: '10px 16px',
                      }}
                    >
                      TOTAL DEL DÍA · {currentRows.length} registros
                    </td>
                    <td className="num pos">
                      {fmtCOP(dayTotalCop)} · {fmtUSD(dayTotalUsd)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        </div>
      </div>

      {editingId ? (
        <EntradaDrawer
          mode={editingId === 'new' ? 'create' : 'edit'}
          initialEntrada={editingRow ?? undefined}
          onCloseAction={() => setEditingId(null)}
          onDeleteAction={
            editingRow
              ? async () => {
                  if (typeof editingRow.id === 'number')
                    await deleteEntradaAction(editingRow.id);
                  setRows((current) =>
                    current.filter((row) => row.id !== editingRow.id)
                  );
                  setEditingId(null);
                }
              : undefined
          }
          onSaveAction={async (entrada) => {
            if (editingId === 'new') {
              const createdId = await createEntradaAction(entrada);
              setRows((current) => [
                ...current,
                {
                  ...entrada,
                  id: createdId ?? `entrada-${crypto.randomUUID()}`,
                },
              ]);
            } else if (editingRow) {
              if (typeof editingRow.id === 'number')
                await updateEntradaAction(editingRow.id, entrada);
              setRows((current) =>
                current.map((row) =>
                  row.id === editingRow.id ? { ...row, ...entrada } : row
                )
              );
            }
            setEditingId(null);
            setPage(1);
          }}
        />
      ) : null}
    </>
  );
}
