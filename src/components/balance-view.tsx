'use client';

import { useMemo, useState } from 'react';
import { updateSaldoBaseAction } from '@/app/dashboard/actions';
import { ClientTopbarPendingBell } from '@/components/client-topbar-pending-bell';
import { formatPeriodLabel, type BalancePeriodData } from '@/lib/balance-data';
import { fmtCOP, fmtUSD } from '@/lib/formatters';

type BalanceViewProps = {
  data: BalancePeriodData;
};

export function BalanceView({ data }: BalanceViewProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [saldoBaseInput, setSaldoBaseInput] = useState(
    String(data.periodo.saldoAnterior)
  );
  const [saldoBase, setSaldoBase] = useState(data.periodo.saldoAnterior);
  const [savingSaldoBase, setSavingSaldoBase] = useState(false);

  const filteredEnvios = useMemo(() => {
    return data.envios.filter((item) => {
      const matchFrom = !dateFrom || item.fecha >= dateFrom;
      const matchTo = !dateTo || item.fecha <= dateTo;
      return matchFrom && matchTo;
    });
  }, [data.envios, dateFrom, dateTo]);

  const filteredEntradas = useMemo(() => {
    return data.entradas.filter((item) => {
      const matchFrom = !dateFrom || item.fecha >= dateFrom;
      const matchTo = !dateTo || item.fecha <= dateTo;
      return matchFrom && matchTo;
    });
  }, [data.entradas, dateFrom, dateTo]);

  const filteredSalidas = useMemo(() => {
    return data.salidas.filter((item) => {
      const matchFrom = !dateFrom || item.fecha >= dateFrom;
      const matchTo = !dateTo || item.fecha <= dateTo;
      return matchFrom && matchTo;
    });
  }, [data.salidas, dateFrom, dateTo]);

  const filteredSalidasExternas = useMemo(() => {
    return data.salidasExternas.filter((item) => {
      const matchFrom = !dateFrom || item.fecha >= dateFrom;
      const matchTo = !dateTo || item.fecha <= dateTo;
      return matchFrom && matchTo;
    });
  }, [data.salidasExternas, dateFrom, dateTo]);

  const saldoAnterior = saldoBase;
  const saldoActual = filteredEntradas.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const retornosExternos = filteredSalidasExternas.reduce(
    (sum, item) => sum + item.pesos,
    0
  );
  const entradasDirectas = saldoActual - retornosExternos;
  const ganancias = filteredEnvios.reduce(
    (sum, item) => sum + item.ganancia,
    0
  );
  const gastos = filteredSalidas.reduce((sum, item) => sum + item.valor, 0);
  const totalEnvios = filteredEnvios.reduce((sum, item) => sum + item.pesos, 0);
  const totalDolares = filteredEnvios.reduce(
    (sum, item) => sum + item.dolares,
    0
  );
  const totalFlorines = filteredEnvios.reduce(
    (sum, item) => sum + item.florines,
    0
  );
  const dolaresDevueltos = filteredSalidasExternas.reduce(
    (sum, item) => sum + item.dolares,
    0
  );
  const florinesDevueltos = filteredSalidasExternas.reduce(
    (sum, item) => sum + item.florines,
    0
  );
  const cambioPromedio =
    totalDolares > 0
      ? filteredEnvios.reduce(
          (sum, item) => sum + item.cambio * item.dolares,
          0
        ) / totalDolares
      : 0;
  const balance = saldoAnterior + saldoActual - gastos - totalEnvios;
  const cajaArubaUsd = totalDolares - dolaresDevueltos;
  const cajaArubaFl = totalFlorines - florinesDevueltos;
  const flujoDiario = Array.from(
    new Set([
      ...filteredEnvios.map((item) => item.fecha),
      ...filteredEntradas.map((item) => item.fecha),
      ...filteredSalidas.map((item) => item.fecha),
      ...filteredSalidasExternas.map((item) => item.fecha),
    ])
  )
    .sort()
    .reduce<
      {
        entradas: number;
        envios: number;
        fecha: string;
        retornos: number;
        saldo: number;
        salidas: number;
      }[]
    >((acc, fecha) => {
      const entradasDia = filteredEntradas
        .filter((item) => item.fecha === fecha)
        .reduce((sum, item) => sum + item.total, 0);
      const salidasDia = filteredSalidas
        .filter((item) => item.fecha === fecha)
        .reduce((sum, item) => sum + item.valor, 0);
      const enviosDia = filteredEnvios
        .filter((item) => item.fecha === fecha)
        .reduce((sum, item) => sum + item.pesos, 0);
      const retornosDia = filteredSalidasExternas
        .filter((item) => item.fecha === fecha)
        .reduce((sum, item) => sum + item.pesos, 0);
      const entradasDirectasDia = entradasDia - retornosDia;
      const saldoPrevio = acc.length > 0 ? acc[acc.length - 1].saldo : saldoAnterior;

      acc.push({
        entradas: entradasDirectasDia,
        envios: enviosDia,
        fecha,
        retornos: retornosDia,
        saldo: saldoPrevio + entradasDia - salidasDia - enviosDia,
        salidas: salidasDia,
      });

      return acc;
    }, []);
  const devueltoColombia = retornosExternos;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Período · {formatPeriodLabel(data.periodo.mes)}</div>
          <h1>Balance</h1>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <ClientTopbarPendingBell />
        </div>
      </div>

      <div
        className="content"
        style={{ padding: '28px 32px', flex: 1, overflowY: 'auto' }}
      >
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
            <label htmlFor="balance-date-from">Desde</label>
            <input
              className="fin-input mono"
              id="balance-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label htmlFor="balance-date-to">Hasta</label>
            <input
              className="fin-input mono"
              id="balance-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
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
              }}
            >
              Limpiar fechas
            </button>
            <div
              className="mono"
              style={{ alignSelf: 'center', color: '#858a93', fontSize: 11 }}
            >
              {filteredEntradas.length} entradas · {filteredSalidas.length}{' '}
              salidas · {filteredEnvios.length} envíos ·{' '}
              {filteredSalidasExternas.length} salidas ext.
            </div>
          </div>
        </div>

        <form
          className="panel"
          style={{
            alignItems: 'end',
            display: 'grid',
            gap: 12,
            gridTemplateColumns: '220px 1fr auto',
            marginBottom: 18,
            padding: 16,
          }}
          onSubmit={async (event) => {
            event.preventDefault();
            const nextSaldoBase = Number(saldoBaseInput.replace(/,/g, '')) || 0;
            setSavingSaldoBase(true);
            try {
              await updateSaldoBaseAction(data.periodo.mes, nextSaldoBase);
              setSaldoBase(nextSaldoBase);
            } finally {
              setSavingSaldoBase(false);
            }
          }}
        >
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label htmlFor="saldo-base">Saldo base Colombia</label>
            <input
              className="fin-input mono"
              id="saldo-base"
              inputMode="numeric"
              value={saldoBaseInput}
              onChange={(event) => setSaldoBaseInput(event.target.value)}
            />
          </div>
          <div className="mono" style={{ color: '#858a93', fontSize: 11 }}>
            Este es el saldo con el que arranca el período. El saldo actual se
            calcula como saldo base + entradas + retornos ext. - salidas - envíos.
          </div>
          <button className="btn btn-primary" disabled={savingSaldoBase} type="submit">
            {savingSaldoBase ? 'Guardando...' : 'Guardar saldo base'}
          </button>
        </form>

        <div
          className="panel"
          style={{ marginBottom: 18, overflow: 'hidden', padding: 0 }}
        >
          <div className="panel-header">
            <div>
              <div className="panel-title">Resumen mensual</div>
              <div className="panel-sub">
                Saldo anterior + entradas + retornos ext. - gastos - envíos
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
              borderTop: '1px solid #22262d',
            }}
          >
            {[
              { label: 'Saldo anterior', value: fmtCOP(saldoAnterior) },
              { label: 'Entradas', value: fmtCOP(entradasDirectas) },
              { label: 'Retornos ext.', value: fmtCOP(retornosExternos) },
              { label: 'Ganancias', value: fmtCOP(ganancias) },
              { label: 'Gastos', value: fmtCOP(gastos), danger: true },
              { label: 'Total envios', value: fmtCOP(totalEnvios) },
              { label: 'Total dolares', value: fmtUSD(totalDolares) },
              { label: 'Balance', value: fmtCOP(balance), accent: true },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  borderRight: '1px solid #22262d',
                  padding: '18px 16px',
                }}
              >
                <div
                  className="mono"
                  style={{
                    color: '#858a93',
                    fontSize: 10,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </div>
                <div
                  className="serif"
                  style={{
                    color: item.accent
                      ? '#d4a574'
                      : item.danger
                        ? '#e07575'
                        : '#e8eaed',
                    fontSize: 26,
                    lineHeight: 1.1,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Colombia · COP</div>
                <div className="panel-sub">Saldo real desde movimientos</div>
              </div>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <div className="calc-box" style={{ marginTop: 0 }}>
                <div className="calc-row">
                  <span className="k">Saldo base</span>
                  <span className="v">{fmtCOP(saldoAnterior)}</span>
                </div>
                <div className="calc-row">
                  <span className="k">Entradas directas</span>
                  <span className="v">{fmtCOP(entradasDirectas)}</span>
                </div>
                <div className="calc-row">
                  <span className="k">Retornos ext.</span>
                  <span className="v">{fmtCOP(retornosExternos)}</span>
                </div>
                <div className="calc-row">
                  <span className="k">Salidas + envíos</span>
                  <span className="v">{fmtCOP(gastos + totalEnvios)}</span>
                </div>
                <div className="calc-row total">
                  <span className="k">Saldo actual</span>
                  <span className="v">{fmtCOP(balance)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Aruba · USD/FL</div>
                <div className="panel-sub">Enviado menos retornado</div>
              </div>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <div className="calc-box" style={{ marginTop: 0 }}>
                <div className="calc-row">
                  <span className="k">Pendiente USD</span>
                  <span className="v">{fmtUSD(cajaArubaUsd)}</span>
                </div>
                <div className="calc-row">
                  <span className="k">Pendiente FL</span>
                  <span className="v">AWG {cajaArubaFl.toLocaleString('es-CO')}</span>
                </div>
                <div className="calc-row">
                  <span className="k">Cambio promedio</span>
                  <span className="v">{cambioPromedio > 0 ? fmtCOP(cambioPromedio) : '-'}</span>
                </div>
                <div className="calc-row total">
                  <span className="k">Retornado a Colombia</span>
                  <span className="v">{fmtCOP(devueltoColombia)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 16, overflow: 'hidden', padding: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">Saldo actual por día</div>
              <div className="panel-sub">Saldo anterior + entradas + retornos ext. - salidas - envíos</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th style={{ textAlign: 'right' }}>Entradas</th>
                  <th style={{ textAlign: 'right' }}>Retornos ext.</th>
                  <th style={{ textAlign: 'right' }}>Salidas</th>
                  <th style={{ textAlign: 'right' }}>Envíos</th>
                  <th style={{ textAlign: 'right' }}>Saldo cierre</th>
                </tr>
              </thead>
              <tbody>
                {flujoDiario.map((day) => (
                  <tr key={day.fecha}>
                    <td className="mono" style={{ color: '#858a93', fontSize: 11 }}>
                      {day.fecha}
                    </td>
                    <td className="num pos">{fmtCOP(day.entradas)}</td>
                    <td className="num pos">{fmtCOP(day.retornos)}</td>
                    <td className="num" style={{ color: '#e07575' }}>{fmtCOP(day.salidas)}</td>
                    <td className="num">{fmtCOP(day.envios)}</td>
                    <td className="num" style={{ color: '#d4a574', fontWeight: 700 }}>
                      {fmtCOP(day.saldo)}
                    </td>
                  </tr>
                ))}
                {flujoDiario.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ color: '#858a93', padding: 18 }}>
                      Sin movimientos en el rango seleccionado.
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
