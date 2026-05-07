'use client';

import { Fragment, useMemo, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  createSalidaAction,
  deleteSalidaAction,
  updateSalidaAction,
} from '@/app/dashboard/actions';
import { ClientTopbarPendingBell } from '@/components/client-topbar-pending-bell';
import {
  DayPaginationControls,
  DayPaginationHeader,
} from '@/components/day-pagination-header';
import { SalidaDrawer } from '@/components/salida-drawer';
import type { Salida } from '@/lib/data';
import { fmtCOP, fmtDate, fmtUSD } from '@/lib/formatters';
import type { SalidaRecord } from '@/lib/movements-data';

const CATEGORIES = [
  'Todas',
  'Pagos',
  'Créditos',
  'Viajes',
  'Impuestos',
  'Otros',
] as const;
const CURRENCIES = ['Todas', 'COP', 'USD'] as const;
const COLORS: Record<Salida['categoria'], string> = {
  Créditos: '#c5a3d6',
  Impuestos: '#e07575',
  Otros: '#858a93',
  Pagos: '#7aa7d9',
  Viajes: '#9bd6c3',
};

function salidaCop(row: SalidaRecord) {
  return row.moneda === 'COP' ? row.valor : 0;
}

function salidaUsd(row: SalidaRecord) {
  return row.moneda === 'USD' ? (row.valorDolar ?? 0) : 0;
}

export function SalidasPageClient({
  initialRows,
}: {
  initialRows: SalidaRecord[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState('');
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>('Todas');
  const [currency, setCurrency] =
    useState<(typeof CURRENCIES)[number]>('Todas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const editingRow = rows.find((row) => row.id === editingId) ?? null;

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const text = `${row.descripcion} ${row.operador}`.toLowerCase();
        const matchText = text.includes(search.toLowerCase());
        const matchCategory =
          category === 'Todas' || row.categoria === category;
        const matchCurrency = currency === 'Todas' || row.moneda === currency;
        const matchFrom = !dateFrom || row.fecha >= dateFrom;
        const matchTo = !dateTo || row.fecha <= dateTo;
        return (
          matchText && matchCategory && matchCurrency && matchFrom && matchTo
        );
      }),
    [category, currency, dateFrom, dateTo, rows, search]
  );
  const byDay = useMemo(() => {
    const groups: Record<string, SalidaRecord[]> = {};
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
    (sum, row) => sum + salidaCop(row),
    0
  );
  const filteredTotalUsd = filtered.reduce(
    (sum, row) => sum + salidaUsd(row),
    0
  );
  const dayTotalCop = currentRows.reduce((sum, row) => sum + salidaCop(row), 0);
  const dayTotalUsd = currentRows.reduce((sum, row) => sum + salidaUsd(row), 0);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Movimiento · Gastos y retiros</div>
          <h1>Salidas</h1>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <ClientTopbarPendingBell />
          <button
            className="btn btn-primary"
            style={{ fontSize: 12 }}
            type="button"
            onClick={() => setEditingId('new')}
          >
            + Nueva salida
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
          <div className="kpi">
            <div className="label mono">Registros filtrados</div>
            <div className="value mono" style={{ fontSize: 22 }}>
              {filtered.length}
            </div>
          </div>
          <div className="kpi accent">
            <div className="label mono">Total COP filtrado</div>
            <div
              className="value serif"
              style={{ color: '#e07575', fontSize: 22 }}
            >
              {fmtCOP(filteredTotalCop)}
            </div>
          </div>
          <div className="kpi">
            <div className="label mono">Total USD filtrado</div>
            <div
              className="value serif"
              style={{ color: '#e07575', fontSize: 22 }}
            >
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
          <div className="segmented">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                className={category === item ? 'active' : ''}
                type="button"
                onClick={() => {
                  setCategory(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="segmented">
            {CURRENCIES.map((item) => (
              <button
                className={currency === item ? 'active' : ''}
                key={item}
                type="button"
                onClick={() => {
                  setCurrency(item);
                  setPage(1);
                }}
              >
                {item === 'COP' ? 'Pesos' : item === 'USD' ? 'USD' : item}
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
            <DayPaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        <div className="panel" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Operador</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
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
                        <td>{row.operador}</td>
                        <td className="td-name">{row.descripcion}</td>
                        <td>
                          <span
                            className="tag"
                            style={{
                              background: `${COLORS[row.categoria]}18`,
                              border: `1px solid ${COLORS[row.categoria]}30`,
                              color: COLORS[row.categoria],
                            }}
                          >
                            {row.categoria}
                          </span>
                        </td>
                        <td>
                          <span className="tag">{row.moneda}</span>
                        </td>
                        <td
                          className="num"
                          style={{ color: '#e07575', fontWeight: 600 }}
                        >
                          {row.moneda === 'COP'
                            ? fmtCOP(row.valor)
                            : fmtUSD(row.valorDolar ?? 0)}
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
                    <td colSpan={7} style={{ color: '#858a93', padding: 18 }}>
                      Sin salidas para el filtro actual.
                    </td>
                  </tr>
                )}
              </tbody>
              {currentRows.length > 0 ? (
                <tfoot>
                  <tr style={{ borderTop: '1px solid #2a2f38' }}>
                    <td
                      colSpan={5}
                      className="mono"
                      style={{
                        color: '#858a93',
                        fontSize: 11,
                        padding: '10px 16px',
                      }}
                    >
                      TOTAL DEL DÍA · {currentRows.length} registros
                    </td>
                    <td
                      className="num"
                      style={{ color: '#e07575', fontWeight: 700 }}
                    >
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
        <SalidaDrawer
          mode={editingId === 'new' ? 'create' : 'edit'}
          initialSalida={editingRow ?? undefined}
          onCloseAction={() => setEditingId(null)}
          onDeleteAction={
            editingRow
              ? async () => {
                  if (typeof editingRow.id === 'number')
                    await deleteSalidaAction(editingRow.id);
                  setRows((current) =>
                    current.filter((row) => row.id !== editingRow.id)
                  );
                  setEditingId(null);
                }
              : undefined
          }
          onSaveAction={async (salida) => {
            if (editingId === 'new') {
              const createdId = await createSalidaAction(salida);
              setRows((current) => [
                ...current,
                {
                  ...salida,
                  id: createdId ?? `salida-${crypto.randomUUID()}`,
                  operador: salida.operador ?? 'OPERADOR',
                },
              ]);
            } else if (editingRow) {
              if (typeof editingRow.id === 'number')
                await updateSalidaAction(editingRow.id, salida);
              setRows((current) =>
                current.map((row) =>
                  row.id === editingRow.id
                    ? {
                        ...row,
                        ...salida,
                        operador: salida.operador ?? row.operador,
                      }
                    : row
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
