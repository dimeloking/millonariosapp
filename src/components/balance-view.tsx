"use client";

import { useMemo, useState } from "react";
import type { BalancePeriodData } from "@/lib/balance-data";
import { fmtCOP, fmtUSD } from "@/lib/formatters";

type BalanceViewProps = {
  data: BalancePeriodData;
};

export function BalanceView({ data }: BalanceViewProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const saldoAnterior = data.periodo.saldoAnterior;
  const saldoActual = filteredEntradas.reduce((sum, item) => sum + item.total, 0);
  const ganancias = filteredEnvios.reduce((sum, item) => sum + item.ganancia, 0);
  const gastos = filteredSalidas.reduce((sum, item) => sum + item.valor, 0);
  const totalEnvios = filteredEnvios.reduce((sum, item) => sum + item.pesos, 0);
  const totalDolares = filteredEnvios.reduce((sum, item) => sum + item.dolares, 0);
  const balance = saldoAnterior + saldoActual - gastos - totalEnvios;
  const basePatrimonial =
    data.capitales.reduce((sum, item) => sum + item.valor, 0) +
    data.efectivo.reduce((sum, item) => sum + item.valor, 0);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Período · Marzo 2026</div>
          <h1>Balance</h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" style={{ fontSize: 12 }}>
            Exportar
          </button>
        </div>
      </div>

      <div className="content" style={{ padding: "28px 32px", flex: 1, overflowY: "auto" }}>
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
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12 }}
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              Limpiar fechas
            </button>
            <div className="mono" style={{ alignSelf: "center", color: "#858a93", fontSize: 11 }}>
              {filteredEntradas.length} entradas · {filteredSalidas.length} salidas ·{" "}
              {filteredEnvios.length} envíos
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 18, overflow: "hidden", padding: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">Resumen mensual</div>
              <div className="panel-sub">Saldo anterior + saldo actual - gastos - total envíos</div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              borderTop: "1px solid #22262d",
            }}
          >
            {[
              { label: "Saldo anterior", value: fmtCOP(saldoAnterior) },
              { label: "Saldo actual", value: fmtCOP(saldoActual) },
              { label: "Ganancias", value: fmtCOP(ganancias) },
              { label: "Gastos", value: fmtCOP(gastos), danger: true },
              { label: "Total envios", value: fmtCOP(totalEnvios) },
              { label: "Total dolares", value: fmtUSD(totalDolares) },
              { label: "Balance", value: fmtCOP(balance), accent: true },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  borderRight: "1px solid #22262d",
                  padding: "18px 16px",
                }}
              >
                <div
                  className="mono"
                  style={{
                    color: "#858a93",
                    fontSize: 10,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </div>
                <div
                  className="serif"
                  style={{
                    color: item.accent ? "#d4a574" : item.danger ? "#e07575" : "#e8eaed",
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Base patrimonial</div>
                <div className="panel-sub">Capitales activos y efectivo del período</div>
              </div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div className="calc-box" style={{ marginTop: 0 }}>
                <div className="calc-row">
                  <span className="k">Capitales activos</span>
                  <span className="v">
                    {fmtCOP(data.capitales.reduce((sum, item) => sum + item.valor, 0))}
                  </span>
                </div>
                <div className="calc-row">
                  <span className="k">Efectivo y pendientes</span>
                  <span className="v">
                    {fmtCOP(data.efectivo.reduce((sum, item) => sum + item.valor, 0))}
                  </span>
                </div>
                <div className="calc-row total">
                  <span className="k">Base total</span>
                  <span className="v">{fmtCOP(basePatrimonial)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Estructura del período</div>
                <div className="panel-sub">Datos reales cargados desde Drizzle / Neon</div>
              </div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div className="calc-box" style={{ marginTop: 0 }}>
                <div className="calc-row">
                  <span className="k">Mes</span>
                  <span className="v">{data.periodo.mes}</span>
                </div>
                <div className="calc-row">
                  <span className="k">Dólares del período</span>
                  <span className="v">{fmtUSD(data.periodo.totalDolares)}</span>
                </div>
                <div className="calc-row">
                  <span className="k">Cambio promedio</span>
                  <span className="v">{fmtCOP(data.cambioPromedio)}</span>
                </div>
                <div className="calc-row total">
                  <span className="k">Ganancia mensual base</span>
                  <span className="v">{fmtCOP(data.periodo.gananciasMes)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
