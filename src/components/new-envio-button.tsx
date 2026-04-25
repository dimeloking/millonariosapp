"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Envio } from "@/lib/data";
import { fmtCOP, fmtRate, fmtUSD } from "@/lib/formatters";

const OPERATORS = ["ROYMAN", "ERIKA", "LINA", "JUAN PABLO"] as const;

const BANKS = [
  { value: "BANCOLOMBIA", label: "Bancolombia" },
  { value: "NEQUI", label: "Nequi" },
  { value: "DAVIPLATA", label: "Daviplata" },
  { value: "DAVIVIENDA", label: "Davivienda" },
  { value: "BANCO_DE_BOGOTA", label: "Banco de Bogota" },
] as const;

type NewEnvioButtonProps = {
  label?: string;
  className?: string;
  style?: CSSProperties;
  onSave?: (envio: Envio) => void | Promise<void>;
};

type EnvioDrawerProps = {
  initialEnvio?: Envio;
  mode?: "create" | "edit";
  onClose: () => void;
  onDelete?: () => void | Promise<void>;
  onSave?: (envio: Envio) => void | Promise<void>;
};

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function parseMoney(value: string) {
  const normalized = value.trim().replace(/[^\d.,-]/g, "");

  if (!normalized) return 0;

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const groupingSeparator = decimalSeparator === "," ? "." : ",";
    return Number(normalized.replaceAll(groupingSeparator, "").replace(decimalSeparator, ".")) || 0;
  }

  if (lastComma !== -1) {
    const decimals = normalized.length - lastComma - 1;
    return decimals > 0 && decimals <= 2
      ? Number(normalized.replace(",", ".")) || 0
      : Number(normalized.replaceAll(",", "")) || 0;
  }

  if (lastDot !== -1) {
    const decimals = normalized.length - lastDot - 1;
    return decimals > 0 && decimals <= 2
      ? Number(normalized) || 0
      : Number(normalized.replaceAll(".", "")) || 0;
  }

  return Number(normalized) || 0;
}

function formatThousands(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function todayDefaults() {
  return {
    cambio: "3680",
    fecha: todayISO(),
    florines: "",
    nombre: "",
    operador: "ROYMAN" as (typeof OPERATORS)[number],
    pesos: "",
    ratio: "1.75",
  };
}

export function NewEnvioButton({
  label = "+ Nuevo envio",
  className = "btn btn-primary",
  style,
  onSave,
}: NewEnvioButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={className} style={style} type="button" onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <EnvioDrawer
          mode="create"
          onClose={() => setOpen(false)}
          onSave={(envio) => {
            onSave?.(envio);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

export function EnvioDrawer({
  initialEnvio,
  mode = "create",
  onClose,
  onDelete,
  onSave,
}: EnvioDrawerProps) {
  const defaults = initialEnvio
    ? {
        cambio: String(initialEnvio.cambio),
        fecha: initialEnvio.fecha,
        florines: String(initialEnvio.florines),
        nombre: initialEnvio.nombre,
        operador: initialEnvio.operador,
        pesos: formatThousands(String(initialEnvio.pesos)),
        ratio:
          initialEnvio.dolares > 0 ? String(initialEnvio.florines / initialEnvio.dolares) : "1.75",
      }
    : todayDefaults();

  const [fecha, setFecha] = useState(defaults.fecha);
  const [operador, setOperador] = useState<(typeof OPERATORS)[number]>(defaults.operador);
  const [nombre, setNombre] = useState(defaults.nombre);
  const [bancoOrigen, setBancoOrigen] = useState<(typeof BANKS)[number]["value"]>("BANCOLOMBIA");
  const [cambio, setCambio] = useState(defaults.cambio);
  const [pesos, setPesos] = useState(defaults.pesos);
  const [florines, setFlorines] = useState(defaults.florines);
  const [ratio, setRatio] = useState(defaults.ratio);

  const calculations = useMemo(() => {
    const cambioNum = parseMoney(cambio);
    const pesosNum = parseMoney(pesos);
    const florinesNum = parseMoney(florines);
    const ratioNum = parseMoney(ratio);
    const safeRatio = ratioNum > 0 ? ratioNum : 1;
    const dolares = florinesNum > 0 ? florinesNum / safeRatio : 0;
    const estipulado = dolares > 0 ? pesosNum / dolares : 0;
    const ganancia = dolares > 0 ? (cambioNum - estipulado) * dolares : 0;
    const margen = estipulado > 0 ? ((cambioNum - estipulado) / estipulado) * 100 : 0;

    return {
      cambioNum,
      dolares,
      estipulado,
      florinesNum,
      ganancia,
      margen,
      pesosNum,
      ratioNum: safeRatio,
    };
  }, [cambio, florines, pesos, ratio]);

  const hasPesos = calculations.pesosNum > 0;
  const hasFlorines = calculations.florinesNum > 0;
  const canCalculate = hasPesos && hasFlorines;
  const drawerTitle = mode === "edit" ? "Editar envio" : "Nuevo envio";

  const handleSave = async () => {
    if (!onSave) {
      onClose();
      return;
    }

    await onSave({
      cambio: Math.round(calculations.cambioNum),
      dolares: Number(calculations.dolares.toFixed(2)),
      fecha,
      florines: Number(calculations.florinesNum.toFixed(2)),
      ganancia: Number(calculations.ganancia.toFixed(2)),
      nombre: nombre.trim() || "Sin nombre",
      operador,
      pesos: Math.round(calculations.pesosNum),
      estipulado: Number(calculations.estipulado.toFixed(2)),
    });
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside aria-labelledby="new-envio-title" aria-modal="true" className="drawer" role="dialog">
        <div className="drawer-header">
          <h3 id="new-envio-title">{drawerTitle}</h3>
          <button aria-label="Cerrar drawer" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="envio-fecha">Fecha</label>
              <input
                className="fin-input mono"
                id="envio-fecha"
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
              />
            </div>
            <div />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="envio-operador">Operador</label>
              <select
                className="fin-input"
                id="envio-operador"
                value={operador}
                onChange={(event) => setOperador(event.target.value as typeof operador)}
              >
                {OPERATORS.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="envio-cliente">Cliente</label>
              <input
                className="fin-input"
                id="envio-cliente"
                placeholder="Nombre del cliente"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </div>
          </div>

          <div className="form-field drawer-field">
            <label htmlFor="envio-banco">Banco origen</label>
            <select
              className="fin-input"
              id="envio-banco"
              value={bancoOrigen}
              onChange={(event) => setBancoOrigen(event.target.value as typeof bancoOrigen)}
            >
              {BANKS.map((bank) => (
                <option key={bank.value} value={bank.value}>
                  {bank.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="envio-cambio">Cambio</label>
              <div className="input-group">
                <input
                  className="fin-input mono"
                  id="envio-cambio"
                  inputMode="decimal"
                  value={cambio}
                  onChange={(event) => setCambio(event.target.value)}
                />
                <span className="suffix">COP</span>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="envio-ratio">Division FL / USD</label>
              <div className="input-group">
                <input
                  className="fin-input mono"
                  id="envio-ratio"
                  inputMode="decimal"
                  value={ratio}
                  onChange={(event) => setRatio(event.target.value)}
                />
                <span className="suffix">FL</span>
              </div>
              <div className="input-help mono">
                Dolares = florines / <span>{fmtRate(calculations.ratioNum)}</span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="manual-label" htmlFor="envio-pesos">
                Envio en pesos
              </label>
              <div className="input-group">
                <input
                  className="fin-input mono"
                  id="envio-pesos"
                  inputMode="decimal"
                  value={pesos}
                  onChange={(event) => setPesos(formatThousands(event.target.value))}
                />
                <span className="suffix">COP</span>
              </div>
            </div>
            <div className="form-field">
              <label className="manual-label" htmlFor="envio-florines">
                Envio en florines
              </label>
              <div className="input-group">
                <input
                  className="fin-input mono"
                  id="envio-florines"
                  inputMode="decimal"
                  value={florines}
                  onChange={(event) => setFlorines(event.target.value)}
                />
                <span className="suffix">FL</span>
              </div>
            </div>
          </div>

          <div className="calc-box">
            <div className="calc-label">Calculo automatico del envio</div>
            <div className="calc-row">
              <span className="k">Envio en dolares</span>
              <span className="v">{canCalculate ? fmtUSD(calculations.dolares) : "-"}</span>
            </div>
            <div className="calc-row">
              <span className="k">Estipulado del dia</span>
              <span className="v">{canCalculate ? fmtCOP(calculations.estipulado) : "-"}</span>
            </div>
            <div className="calc-row">
              <span className="k">Margen vs cambio</span>
              <span className="v">{canCalculate ? `${fmtRate(calculations.margen)}%` : "-"}</span>
            </div>
            <div className="calc-row total">
              <span className="k">Ganancia</span>
              <span className="v">+{fmtCOP(calculations.ganancia)}</span>
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          {mode === "edit" && onDelete ? (
            <button
              className="btn btn-ghost btn-danger"
              type="button"
              onClick={() => void onDelete()}
            >
              Eliminar
            </button>
          ) : null}
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" type="button" onClick={() => void handleSave()}>
            Guardar
          </button>
        </div>
      </aside>
    </>
  );
}
