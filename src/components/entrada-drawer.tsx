"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Entrada } from "@/lib/data";
import { fmtCOP, fmtNum, fmtUSD } from "@/lib/formatters";

type EntradaDrawerProps = {
  initialEntrada?: Entrada;
  mode?: "create" | "edit";
  onClose: () => void;
  onDelete?: () => void | Promise<void>;
  onSave?: (entrada: Entrada) => void | Promise<void>;
};

function parseMoney(value: string) {
  const cleaned = value.trim().replace(/[^\d.,-]/g, "");
  if (!cleaned) return 0;
  return Number(cleaned.replaceAll(",", "")) || 0;
}

function formatThousands(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function EntradaDrawer({
  initialEntrada,
  mode = "create",
  onClose,
  onDelete,
  onSave,
}: EntradaDrawerProps) {
  const [fecha, setFecha] = useState(initialEntrada?.fecha ?? todayISO());
  const [descripcion, setDescripcion] = useState(initialEntrada?.descripcion ?? "");
  const [entradaDolar, setEntradaDolar] = useState(
    initialEntrada?.entradaDolar ? String(initialEntrada.entradaDolar) : "",
  );
  const [cambio, setCambio] = useState(initialEntrada?.cambio ? String(initialEntrada.cambio) : "");
  const [total, setTotal] = useState(
    initialEntrada?.total ? formatThousands(String(initialEntrada.total)) : "",
  );

  const calculations = useMemo(() => {
    const usd = parseMoney(entradaDolar);
    const tasa = parseMoney(cambio);
    const manualTotal = parseMoney(total);
    const calculatedTotal = usd > 0 && tasa > 0 ? Math.round(usd * tasa) : manualTotal;

    return {
      tasa,
      total: calculatedTotal,
      usd,
    };
  }, [cambio, entradaDolar, total]);

  const handleSave = async () => {
    if (!onSave) {
      onClose();
      return;
    }

    await onSave({
      cambio: calculations.tasa > 0 ? calculations.tasa : null,
      descripcion: descripcion.trim() || "Sin descripción",
      entradaDolar: calculations.usd > 0 ? calculations.usd : null,
      fecha,
      total: calculations.total,
    });
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside
        aria-labelledby="entrada-drawer-title"
        aria-modal="true"
        className="drawer"
        role="dialog"
      >
        <div className="drawer-header">
          <h3 id="entrada-drawer-title">{mode === "edit" ? "Editar entrada" : "Nueva entrada"}</h3>
          <button aria-label="Cerrar drawer" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          <div className="form-field drawer-field">
            <label htmlFor="entrada-fecha">Fecha</label>
            <input
              className="fin-input mono"
              id="entrada-fecha"
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
            />
          </div>

          <div className="form-field drawer-field">
            <label htmlFor="entrada-descripcion">Descripción</label>
            <input
              className="fin-input"
              id="entrada-descripcion"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="entrada-usd">Entrada dólar</label>
              <div className="input-group">
                <input
                  className="fin-input mono"
                  id="entrada-usd"
                  inputMode="decimal"
                  value={entradaDolar}
                  onChange={(event) => setEntradaDolar(event.target.value)}
                />
                <span className="suffix">USD</span>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="entrada-cambio">Cambio dólar</label>
              <div className="input-group">
                <input
                  className="fin-input mono"
                  id="entrada-cambio"
                  inputMode="decimal"
                  value={cambio}
                  onChange={(event) => setCambio(event.target.value)}
                />
                <span className="suffix">COP</span>
              </div>
            </div>
          </div>

          <div className="form-field drawer-field">
            <label
              className={calculations.usd > 0 && calculations.tasa > 0 ? "" : "manual-label"}
              htmlFor="entrada-total"
            >
              Total entrada
            </label>
            <div className="input-group">
              <input
                className={`fin-input mono ${calculations.usd > 0 && calculations.tasa > 0 ? "readonly" : ""}`}
                id="entrada-total"
                inputMode="decimal"
                readOnly={calculations.usd > 0 && calculations.tasa > 0}
                value={
                  calculations.usd > 0 && calculations.tasa > 0
                    ? formatThousands(String(calculations.total))
                    : total
                }
                onChange={(event) => setTotal(formatThousands(event.target.value))}
              />
              <span className="suffix">COP</span>
            </div>
          </div>

          <div className="calc-box">
            <div className="calc-label">Resumen de entrada</div>
            <div className="calc-row">
              <span className="k">USD recibidos</span>
              <span className="v">{calculations.usd > 0 ? fmtUSD(calculations.usd) : "-"}</span>
            </div>
            <div className="calc-row">
              <span className="k">Cambio aplicado</span>
              <span className="v">{calculations.tasa > 0 ? fmtNum(calculations.tasa) : "-"}</span>
            </div>
            <div className="calc-row total">
              <span className="k">Total entrada</span>
              <span className="v">{fmtCOP(calculations.total)}</span>
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
