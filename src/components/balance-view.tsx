'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateSaldoBaseAction } from '@/app/dashboard/actions';
import { ClientTopbarPendingBell } from '@/components/client-topbar-pending-bell';
import type { BalancePeriodData } from '@/lib/balance-data';
import { fmtAWG, fmtCOP, fmtUSD, formatPeriodLabel } from '@/lib/formatters';

type BalanceViewProps = {
  data: BalancePeriodData;
};

type CurrencyRow = {
  danger?: boolean;
  label: string;
  value: string;
};

type CurrencySection = {
  accent: string;
  balanceLabel: string;
  balanceValue: string;
  rows: CurrencyRow[];
  subtitle: string;
  title: string;
};

function fmtDebit(value: number, formatter: (value: number) => string) {
  return value > 0 ? `-${formatter(value)}` : formatter(0);
}

function getMonthOptions(selectedMonth: string) {
  const [selectedYear] = selectedMonth.split('-');
  const year = Number(selectedYear) || new Date().getFullYear();

  return Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, '0')}`;
    return {
      label: formatPeriodLabel(month),
      value: month,
    };
  });
}

export function BalanceView({ data }: BalanceViewProps) {
  const router = useRouter();
  const [saldoBaseInput, setSaldoBaseInput] = useState(
    String(data.periodo.saldoAnterior)
  );
  const [saldoBase, setSaldoBase] = useState(data.periodo.saldoAnterior);
  const [savingSaldoBase, setSavingSaldoBase] = useState(false);

  const monthOptions = getMonthOptions(data.periodo.mes);
  const filteredEnvios = data.envios;
  const filteredEntradas = data.entradas;
  const filteredSalidas = data.salidas;
  const filteredSalidasExternas = data.salidasExternas;
  const saldoAnterior = saldoBase;
  const entradasPesos = filteredEntradas.reduce(
    (sum, item) => sum + (item.moneda === 'COP' ? item.total : 0),
    0
  );
  const entradasUsd = filteredEntradas.reduce(
    (sum, item) => sum + (item.moneda === 'USD' ? (item.entradaDolar ?? 0) : 0),
    0
  );
  const retornosExternos = filteredSalidasExternas.reduce(
    (sum, item) => sum + item.pesos,
    0
  );
  const entradasDirectas = entradasPesos - retornosExternos;
  const ganancias = filteredEnvios.reduce(
    (sum, item) => sum + item.ganancia,
    0
  );
  const gastos = filteredSalidas.reduce(
    (sum, item) => sum + (item.moneda === 'COP' ? item.valor : 0),
    0
  );
  const gastosUsd = filteredSalidas.reduce(
    (sum, item) => sum + (item.moneda === 'USD' ? (item.valorDolar ?? 0) : 0),
    0
  );
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
  const balance = saldoAnterior + entradasPesos - gastos - totalEnvios;
  const cajaArubaUsd = totalDolares - dolaresDevueltos;
  const cajaArubaFl = totalFlorines - florinesDevueltos;
  const balanceUsd = entradasUsd + cajaArubaUsd - gastosUsd;
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
        .reduce(
          (sum, item) => sum + (item.moneda === 'COP' ? item.total : 0),
          0
        );
      const salidasDia = filteredSalidas
        .filter((item) => item.fecha === fecha)
        .reduce(
          (sum, item) => sum + (item.moneda === 'COP' ? item.valor : 0),
          0
        );
      const enviosDia = filteredEnvios
        .filter((item) => item.fecha === fecha)
        .reduce((sum, item) => sum + item.pesos, 0);
      const retornosDia = filteredSalidasExternas
        .filter((item) => item.fecha === fecha)
        .reduce((sum, item) => sum + item.pesos, 0);
      const entradasDirectasDia = entradasDia - retornosDia;
      const saldoPrevio =
        acc.length > 0 ? acc[acc.length - 1].saldo : saldoAnterior;

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

  const currencySections: CurrencySection[] = [
    {
      accent: '#d4a574',
      balanceLabel: 'Saldo actual COP',
      balanceValue: fmtCOP(balance),
      rows: [
        { label: 'Saldo base Colombia', value: fmtCOP(saldoAnterior) },
        { label: 'Entradas directas', value: fmtCOP(entradasDirectas) },
        { label: 'Retornos ext.', value: fmtCOP(retornosExternos) },
        {
          danger: true,
          label: 'Salidas COP',
          value: fmtDebit(gastos, fmtCOP),
        },
        {
          danger: true,
          label: 'Envíos COP',
          value: fmtDebit(totalEnvios, fmtCOP),
        },
        { label: 'Ganancias del período', value: fmtCOP(ganancias) },
      ],
      subtitle: 'Saldo base + entradas COP + retornos - salidas - envíos',
      title: 'Colombia · COP',
    },
    {
      accent: '#7aa7d9',
      balanceLabel: 'Saldo actual USD',
      balanceValue: fmtUSD(balanceUsd),
      rows: [
        { label: 'Entradas USD', value: fmtUSD(entradasUsd) },
        { label: 'USD enviados', value: fmtUSD(totalDolares) },
        {
          danger: true,
          label: 'USD retornados',
          value: fmtDebit(dolaresDevueltos, fmtUSD),
        },
        { label: 'Pendiente Aruba USD', value: fmtUSD(cajaArubaUsd) },
        {
          danger: true,
          label: 'Salidas USD',
          value: fmtDebit(gastosUsd, fmtUSD),
        },
        {
          label: 'Cambio promedio',
          value: cambioPromedio > 0 ? fmtCOP(cambioPromedio) : '-',
        },
      ],
      subtitle: 'Entradas USD + pendiente Aruba - salidas USD',
      title: 'Dólares · USD',
    },
    {
      accent: '#9bd6c3',
      balanceLabel: 'Pendiente FL',
      balanceValue: fmtAWG(cajaArubaFl),
      rows: [
        { label: 'FL enviados', value: fmtAWG(totalFlorines) },
        {
          danger: true,
          label: 'FL retornados',
          value: fmtDebit(florinesDevueltos, fmtAWG),
        },
        { label: 'Pendiente Aruba FL', value: fmtAWG(cajaArubaFl) },
      ],
      subtitle: 'Florines enviados a Aruba menos florines retornados',
      title: 'Florines · FL',
    },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">
            Período · {formatPeriodLabel(data.periodo.mes)}
          </div>
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
            gridTemplateColumns: '240px auto',
            marginBottom: 18,
          }}
        >
          <div className="form-field" style={{ gap: 6, marginBottom: 0 }}>
            <label htmlFor="balance-month">Mes</label>
            <select
              className="fin-input"
              id="balance-month"
              value={data.periodo.mes}
              onChange={(event) => {
                router.push(`/dashboard/balance?mes=${event.target.value}`);
              }}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}
          >
            <div
              className="mono"
              style={{ alignSelf: 'center', color: '#858a93', fontSize: 11 }}
            >
              Mes completo · {filteredEntradas.length} entradas ·{' '}
              {filteredSalidas.length} salidas · {filteredEnvios.length} envíos
              · {filteredSalidasExternas.length} salidas ext.
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
            calcula como saldo base + entradas COP - salidas COP - envíos.
          </div>
          <button
            className="btn btn-primary"
            disabled={savingSaldoBase}
            type="submit"
          >
            {savingSaldoBase ? 'Guardando...' : 'Guardar saldo base'}
          </button>
        </form>

        <div style={{ marginBottom: 12 }}>
          <div className="panel-title">Balance por moneda</div>
          <div className="panel-sub">
            COP, USD y FL separados para revisar cada caja sin mezclar valores.
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginBottom: 18,
          }}
        >
          {currencySections.map((section) => (
            <div className="panel" key={section.title} style={{ padding: 0 }}>
              <div className="panel-header">
                <div>
                  <div className="panel-title">{section.title}</div>
                  <div className="panel-sub">{section.subtitle}</div>
                </div>
              </div>
              <div style={{ padding: 18 }}>
                <div
                  style={{
                    borderBottom: '1px solid #22262d',
                    marginBottom: 14,
                    paddingBottom: 14,
                  }}
                >
                  <div
                    className="mono"
                    style={{
                      color: '#858a93',
                      fontSize: 10,
                      marginBottom: 6,
                      textTransform: 'uppercase',
                    }}
                  >
                    {section.balanceLabel}
                  </div>
                  <div
                    className="serif"
                    style={{
                      color: section.accent,
                      fontSize: 32,
                      lineHeight: 1,
                    }}
                  >
                    {section.balanceValue}
                  </div>
                </div>

                <div className="calc-box" style={{ marginTop: 0 }}>
                  {section.rows.map((row) => (
                    <div className="calc-row" key={row.label}>
                      <span className="k">{row.label}</span>
                      <span
                        className="v"
                        style={{ color: row.danger ? '#e07575' : undefined }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="panel"
          style={{ marginTop: 16, overflow: 'hidden', padding: 0 }}
        >
          <div className="panel-header">
            <div>
              <div className="panel-title">Saldo COP por día</div>
              <div className="panel-sub">
                Saldo anterior + entradas COP - salidas COP - envíos
              </div>
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
                    <td
                      className="mono"
                      style={{ color: '#858a93', fontSize: 11 }}
                    >
                      {day.fecha}
                    </td>
                    <td className="num pos">{fmtCOP(day.entradas)}</td>
                    <td className="num pos">{fmtCOP(day.retornos)}</td>
                    <td className="num" style={{ color: '#e07575' }}>
                      {fmtCOP(day.salidas)}
                    </td>
                    <td className="num">{fmtCOP(day.envios)}</td>
                    <td
                      className="num"
                      style={{ color: '#d4a574', fontWeight: 700 }}
                    >
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
