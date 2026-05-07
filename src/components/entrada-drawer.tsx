'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Entrada } from '@/lib/data';
import { fmtCOP, fmtUSD } from '@/lib/formatters';

type EntradaDrawerProps = {
  initialEntrada?: Entrada;
  mode?: 'create' | 'edit';
  onCloseAction: () => void;
  onDeleteAction?: () => void | Promise<void>;
  onSaveAction?: (entrada: Entrada) => void | Promise<void>;
};

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

function formatAmount(value: string, moneda: Entrada['moneda']) {
  if (moneda === 'COP') return formatThousands(value);

  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimalParts] = cleaned.split('.');
  const decimal = decimalParts.join('').slice(0, 2);
  const formattedWhole = formatThousands(whole);

  if (cleaned.includes('.')) return `${formattedWhole}.${decimal}`;
  return formattedWhole;
}

function formatAmountForCurrency(value: string, moneda: Entrada['moneda']) {
  const parsed = parseMoney(value);
  if (!parsed) return '';
  return moneda === 'COP'
    ? formatThousands(String(Math.round(parsed)))
    : formatAmount(String(parsed), 'USD');
}

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function EntradaDrawer({
  initialEntrada,
  mode = 'create',
  onCloseAction,
  onDeleteAction,
  onSaveAction,
}: EntradaDrawerProps) {
  const initialMoneda =
    initialEntrada?.moneda ?? (initialEntrada?.entradaDolar ? 'USD' : 'COP');
  const [fecha, setFecha] = useState(initialEntrada?.fecha ?? todayISO());
  const [descripcion, setDescripcion] = useState(
    initialEntrada?.descripcion ?? ''
  );
  const [moneda, setMoneda] = useState<Entrada['moneda']>(initialMoneda);
  const [valor, setValor] = useState(
    initialMoneda === 'USD'
      ? initialEntrada?.entradaDolar
        ? formatAmount(String(initialEntrada.entradaDolar), 'USD')
        : ''
      : initialEntrada?.total
        ? formatAmount(String(initialEntrada.total), 'COP')
        : ''
  );

  const total = parseMoney(valor);

  const handleSave = async () => {
    if (!onSaveAction) {
      onCloseAction();
      return;
    }

    await onSaveAction({
      cambio: null,
      descripcion: descripcion.trim() || 'Sin descripción',
      entradaDolar: moneda === 'USD' && total > 0 ? total : null,
      fecha,
      moneda,
      total: moneda === 'COP' ? Math.round(total) : 0,
    });
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onCloseAction} />
      <aside
        aria-labelledby="entrada-drawer-title"
        aria-modal="true"
        className="drawer"
        role="dialog"
      >
        <div className="drawer-header">
          <h3 id="entrada-drawer-title">
            {mode === 'edit' ? 'Editar entrada' : 'Nueva entrada'}
          </h3>
          <button
            aria-label="Cerrar drawer"
            type="button"
            onClick={onCloseAction}
          >
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

          <div className="form-field drawer-field">
            <label>Moneda</label>
            <div className="segmented">
              {(['COP', 'USD'] as const).map((item) => (
                <button
                  className={moneda === item ? 'active' : ''}
                  key={item}
                  type="button"
                  onClick={() => {
                    setMoneda(item);
                    setValor((current) =>
                      formatAmountForCurrency(current, item)
                    );
                  }}
                >
                  {item === 'COP' ? 'Pesos' : 'Dólares'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field drawer-field">
            <label className="manual-label" htmlFor="entrada-valor">
              Valor entrada
            </label>
            <div className="input-group">
              <input
                className="fin-input mono"
                id="entrada-valor"
                inputMode="decimal"
                value={valor}
                onChange={(event) =>
                  setValor(formatAmount(event.target.value, moneda))
                }
              />
              <span className="suffix">{moneda}</span>
            </div>
          </div>

          <div className="calc-box">
            <div className="calc-label">Resumen de entrada</div>
            <div className="calc-row">
              <span className="k">Moneda</span>
              <span className="v">{moneda}</span>
            </div>
            <div className="calc-row total">
              <span className="k">Total entrada</span>
              <span className="v">
                {moneda === 'COP' ? fmtCOP(total) : fmtUSD(total)}
              </span>
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          {mode === 'edit' && onDeleteAction ? (
            <button
              className="btn btn-ghost btn-danger"
              type="button"
              onClick={() => void onDeleteAction()}
            >
              Eliminar
            </button>
          ) : null}
          <button
            className="btn btn-ghost"
            type="button"
            onClick={onCloseAction}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => void handleSave()}
          >
            Guardar
          </button>
        </div>
      </aside>
    </>
  );
}
