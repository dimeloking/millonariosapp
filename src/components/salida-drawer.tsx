'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import type { Salida } from '@/lib/data';
import { fmtCOP, fmtUSD } from '@/lib/formatters';
import { resolveOperatorName } from '@/lib/operator';

type SalidaDrawerProps = {
  initialSalida?: Salida;
  mode?: 'create' | 'edit';
  onCloseAction: () => void;
  onDeleteAction?: () => void | Promise<void>;
  onSaveAction?: (salida: Salida) => void | Promise<void>;
};

const CATEGORIAS: Salida['categoria'][] = [
  'Pagos',
  'Créditos',
  'Viajes',
  'Impuestos',
  'Otros',
];

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

function formatAmount(value: string, moneda: Salida['moneda']) {
  if (moneda === 'COP') return formatThousands(value);

  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimalParts] = cleaned.split('.');
  const decimal = decimalParts.join('').slice(0, 2);
  const formattedWhole = formatThousands(whole);

  if (cleaned.includes('.')) return `${formattedWhole}.${decimal}`;
  return formattedWhole;
}

function formatAmountForCurrency(value: string, moneda: Salida['moneda']) {
  const parsed = parseMoney(value);
  if (!parsed) return '';
  return moneda === 'COP'
    ? formatThousands(String(Math.round(parsed)))
    : formatAmount(String(parsed), 'USD');
}

export function SalidaDrawer({
  initialSalida,
  mode = 'create',
  onCloseAction,
  onDeleteAction,
  onSaveAction,
}: SalidaDrawerProps) {
  const { user } = useUser();
  const operador = resolveOperatorName(
    user?.fullName,
    user?.firstName,
    user?.username,
    user?.primaryEmailAddress?.emailAddress,
    initialSalida?.operador
  );
  const initialMoneda =
    initialSalida?.moneda ?? (initialSalida?.valorDolar ? 'USD' : 'COP');
  const [fecha, setFecha] = useState(initialSalida?.fecha ?? todayISO());
  const [descripcion, setDescripcion] = useState(
    initialSalida?.descripcion ?? ''
  );
  const [categoria, setCategoria] = useState<Salida['categoria']>(
    initialSalida?.categoria ?? 'Pagos'
  );
  const [moneda, setMoneda] = useState<Salida['moneda']>(initialMoneda);
  const [valor, setValor] = useState(
    initialMoneda === 'USD'
      ? initialSalida?.valorDolar
        ? formatAmount(String(initialSalida.valorDolar), 'USD')
        : ''
      : initialSalida?.valor
        ? formatAmount(String(initialSalida.valor), 'COP')
        : ''
  );

  const total = parseMoney(valor);

  const handleSave = async () => {
    if (!onSaveAction) {
      onCloseAction();
      return;
    }

    await onSaveAction({
      categoria,
      descripcion: descripcion.trim() || 'Sin descripción',
      fecha,
      moneda,
      operador,
      valor: moneda === 'COP' ? Math.round(total) : 0,
      valorDolar: moneda === 'USD' && total > 0 ? total : null,
    });
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onCloseAction} />
      <aside
        aria-labelledby="salida-drawer-title"
        aria-modal="true"
        className="drawer"
        role="dialog"
      >
        <div className="drawer-header">
          <h3 id="salida-drawer-title">
            {mode === 'edit' ? 'Editar salida' : 'Nueva salida'}
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
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="salida-fecha">Fecha</label>
              <input
                className="fin-input mono"
                id="salida-fecha"
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="salida-categoria">Categoría</label>
              <select
                className="fin-input"
                id="salida-categoria"
                value={categoria}
                onChange={(event) =>
                  setCategoria(event.target.value as Salida['categoria'])
                }
              >
                {CATEGORIAS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field drawer-field">
            <label htmlFor="salida-operador">Operador</label>
            <input
              className="fin-input mono"
              id="salida-operador"
              readOnly
              value={operador}
            />
          </div>

          <div className="form-field drawer-field">
            <label htmlFor="salida-descripcion">Descripción</label>
            <input
              className="fin-input"
              id="salida-descripcion"
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
            <label className="manual-label" htmlFor="salida-valor">
              Valor
            </label>
            <div className="input-group">
              <input
                className="fin-input mono"
                id="salida-valor"
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
            <div className="calc-label">Resumen de salida</div>
            <div className="calc-row">
              <span className="k">Categoría</span>
              <span className="v">{categoria}</span>
            </div>
            <div className="calc-row total">
              <span className="k">Total salida</span>
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
