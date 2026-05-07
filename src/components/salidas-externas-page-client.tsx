'use client';

import { useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trash2 } from 'lucide-react';
import {
  createSalidaExternaAction,
  deleteSalidaExternaAction,
} from '@/app/dashboard/actions';
import { ClientTopbarPendingBell } from '@/components/client-topbar-pending-bell';
import {
  DayPaginationControls,
  DayPaginationHeader,
} from '@/components/day-pagination-header';
import { fmtAWG, fmtCOP, fmtDate, fmtNum, fmtUSD } from '@/lib/formatters';
import type { EnvioRecord, SalidaExternaRecord } from '@/lib/movements-data';
import { resolveOperatorName } from '@/lib/operator';

type SalidasExternasPageClientProps = {
  envios: EnvioRecord[];
  initialRows: SalidaExternaRecord[];
};

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function parseMoney(value: string) {
  const cleaned = value.trim().replace(/[^\d.,-]/g, '');
  if (!cleaned) return 0;
  return Number(cleaned.split(',').join('')) || 0;
}

function formatThousands(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function SalidasExternasPageClient({
  envios,
  initialRows,
}: SalidasExternasPageClientProps) {
  const { user } = useUser();
  const manualEmpleado = resolveOperatorName(
    user?.fullName,
    user?.firstName,
    user?.username,
    user?.primaryEmailAddress?.emailAddress
  );
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [manualBusy, setManualBusy] = useState(false);
  const [manualFecha, setManualFecha] = useState(todayISO());
  const [manualDescripcion, setManualDescripcion] = useState('Retorno manual');
  const [manualDolares, setManualDolares] = useState('');
  const [manualFlorines, setManualFlorines] = useState('');
  const [manualCambio, setManualCambio] = useState('3680');

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const text = `${row.descripcion} ${row.empleado}`.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const matchFrom = !dateFrom || row.fecha >= dateFrom;
      const matchTo = !dateTo || row.fecha <= dateTo;
      return matchSearch && matchFrom && matchTo;
    });
  }, [dateFrom, dateTo, rows, search]);

  const byDay = useMemo(() => {
    const groups: Record<string, SalidaExternaRecord[]> = {};
    for (const row of filteredRows) {
      groups[row.fecha] ??= [];
      groups[row.fecha].push(row);
    }
    return groups;
  }, [filteredRows]);

  const sortedDays = Object.keys(byDay).sort((a, b) => b.localeCompare(a));
  const totalPages = Math.max(sortedDays.length, 1);
  const currentPage = Math.min(page, totalPages);
  const currentDay = sortedDays[currentPage - 1];
  const currentRows = currentDay ? byDay[currentDay] : [];

  const totalEnviadoUsd = envios.reduce((sum, row) => sum + row.dolares, 0);
  const totalEnviadoFl = envios.reduce((sum, row) => sum + row.florines, 0);
  const totalRetornadoUsd = rows.reduce((sum, row) => sum + row.dolares, 0);
  const totalRetornadoFl = rows.reduce((sum, row) => sum + row.florines, 0);
  const totalRetornadoCop = rows.reduce((sum, row) => sum + row.pesos, 0);
  const pendienteUsd = totalEnviadoUsd - totalRetornadoUsd;
  const pendienteFl = totalEnviadoFl - totalRetornadoFl;
  const manualUsd = parseMoney(manualDolares);
  const manualFl = parseMoney(manualFlorines);
  const manualCambioNum = parseMoney(manualCambio);
  const manualPesos = Math.round(manualUsd * manualCambioNum);

  async function eliminarDevolucion(row: SalidaExternaRecord) {
    if (typeof row.id === 'number') {
      await deleteSalidaExternaAction(row.id);
    }
    setRows((current) => current.filter((item) => item.id !== row.id));
  }

  async function crearRetornoManual(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (manualUsd <= 0 || manualCambioNum <= 0) return;

    const payload = {
      cambio: manualCambioNum,
      descripcion: manualDescripcion.trim() || 'Retorno manual',
      dolares: Number(manualUsd.toFixed(2)),
      empleado: manualEmpleado,
      envioId: null,
      fecha: manualFecha,
      florines: Number(manualFl.toFixed(2)),
      pesos: manualPesos,
    };

    setManualBusy(true);
    try {
      const created = await createSalidaExternaAction(payload);
      setRows((current) => [
        ...current,
        {
          ...payload,
          entradaId: created.entradaId,
          id: created.id ?? `retorno-${crypto.randomUUID()}`,
        },
      ]);
      setManualDescripcion('Retorno manual');
      setManualDolares('');
      setManualFlorines('');
      setPage(1);
    } finally {
      setManualBusy(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Caja externa · Aruba</div>
          <h1>Salidas ext.</h1>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <ClientTopbarPendingBell />
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
            gridTemplateColumns: 'repeat(4, 1fr)',
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
            placeholder="Buscar retorno u operador..."
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

        <form
          className="panel"
          onSubmit={crearRetornoManual}
          style={{
            alignItems: 'end',
            display: 'grid',
            gap: 12,
            gridTemplateColumns: '150px 150px 1fr 140px 140px 120px auto',
            marginTop: 16,
            padding: 16,
          }}
        >
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label>Fecha</label>
            <input
              className="fin-input mono"
              type="date"
              value={manualFecha}
              onChange={(event) => setManualFecha(event.target.value)}
            />
          </div>
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label>Operador</label>
            <input className="fin-input mono" readOnly value={manualEmpleado} />
          </div>
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label>Descripción</label>
            <input
              className="fin-input"
              value={manualDescripcion}
              onChange={(event) => setManualDescripcion(event.target.value)}
            />
          </div>
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label>USD retornados</label>
            <input
              className="fin-input mono"
              inputMode="decimal"
              value={manualDolares}
              onChange={(event) => setManualDolares(event.target.value)}
            />
          </div>
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label>Cambio USD</label>
            <input
              className="fin-input mono"
              inputMode="numeric"
              value={manualCambio}
              onChange={(event) =>
                setManualCambio(formatThousands(event.target.value))
              }
            />
          </div>
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label>FL</label>
            <input
              className="fin-input mono"
              inputMode="decimal"
              value={manualFlorines}
              onChange={(event) => setManualFlorines(event.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            disabled={manualBusy || manualUsd <= 0 || manualCambioNum <= 0}
            type="submit"
          >
            {manualBusy ? 'Guardando...' : `Retornar ${fmtCOP(manualPesos)}`}
          </button>
        </form>

        {currentDay ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 12,
              marginTop: 16,
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

        <div
          className="panel"
          style={{
            marginTop: currentDay ? 0 : 16,
            overflow: 'hidden',
            padding: 0,
          }}
        >
          <div className="panel-header">
            <div>
              <div className="panel-title">Retornos registrados</div>
              <div className="panel-sub">
                Creados desde el formulario manual
              </div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Operador</th>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'right' }}>USD</th>
                  <th style={{ textAlign: 'right' }}>FL</th>
                  <th style={{ textAlign: 'right' }}>Cambio USD</th>
                  <th style={{ textAlign: 'right' }}>Retorna COP</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row) => (
                  <tr key={String(row.id)}>
                    <td
                      className="mono"
                      style={{ color: '#858a93', fontSize: 11 }}
                    >
                      {fmtDate(row.fecha)}
                    </td>
                    <td>{row.empleado}</td>
                    <td className="td-name">{row.descripcion}</td>
                    <td className="num">{fmtUSD(row.dolares)}</td>
                    <td className="num">{fmtAWG(row.florines)}</td>
                    <td
                      className="num mono"
                      style={{ color: '#858a93', fontSize: 11 }}
                    >
                      ${fmtNum(row.cambio)}
                    </td>
                    <td className="num pos">{fmtCOP(row.pesos)}</td>
                    <td>
                      <button
                        className="icon-btn"
                        type="button"
                        onClick={() => void eliminarDevolucion(row)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!currentDay ? (
                  <tr>
                    <td colSpan={8} style={{ color: '#858a93', padding: 18 }}>
                      Sin retornos para el filtro actual.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
