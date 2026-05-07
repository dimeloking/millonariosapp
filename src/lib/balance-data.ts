import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  creditos4x1000,
  entradas,
  envios,
  pendientes,
  periodos,
  salidas,
  salidasExternas,
} from '@/db/schema';
import type { Entrada, Envio, Moneda, Salida } from '@/lib/data';
import { formatPeriodLabel } from '@/lib/formatters';
import type { SalidaExternaRecord } from '@/lib/movements-data';

export type DashboardSummary = {
  cambioPromedio: number;
  creditosCount: number;
  currentBalance: number;
  currentBalanceUsd: number;
  entradasCount: number;
  enviosCount: number;
  period: string;
  periodLabel: string;
  saldoAnterior: number;
  salidasCount: number;
  salidasExternasCount: number;
  pendientesCount: number;
  totalDolares: number;
  totalEntradaDolares: number;
  totalEntradas: number;
  totalEnvios: number;
  totalSalidaDolares: number;
  totalSalidas: number;
};

export type BalancePeriodData = {
  cambioPromedio: number;
  entradas: Entrada[];
  envios: Envio[];
  periodo: {
    gananciasMes: number;
    mes: string;
    saldoAnterior: number;
    totalDolares: number;
  };
  salidas: Salida[];
  salidasExternas: SalidaExternaRecord[];
};

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function getBalancePeriodData(
  mes?: string
): Promise<BalancePeriodData> {
  const selectedMes = mes ?? getCurrentPeriod();

  try {
    const [periodo] = await db
      .select()
      .from(periodos)
      .where(eq(periodos.mes, selectedMes))
      .limit(1);

    const [dbEnvios, dbEntradas, dbSalidas, dbSalidasExternas] =
      await Promise.all([
        db.select().from(envios).orderBy(asc(envios.fecha), asc(envios.id)),
        db
          .select()
          .from(entradas)
          .orderBy(asc(entradas.fecha), asc(entradas.id)),
        db.select().from(salidas).orderBy(asc(salidas.fecha), asc(salidas.id)),
        db
          .select()
          .from(salidasExternas)
          .orderBy(asc(salidasExternas.fecha), asc(salidasExternas.id)),
      ]);

    const monthPrefix = `${selectedMes}-`;
    const periodEnvios = dbEnvios.filter((item) =>
      String(item.fecha).startsWith(monthPrefix)
    );
    const periodEntradas = dbEntradas.filter((item) =>
      String(item.fecha).startsWith(monthPrefix)
    );
    const periodSalidas = dbSalidas.filter((item) =>
      String(item.fecha).startsWith(monthPrefix)
    );
    const periodSalidasExternas = dbSalidasExternas.filter((item) =>
      String(item.fecha).startsWith(monthPrefix)
    );
    const periodTotalDolares = periodEnvios.reduce(
      (sum, item) => sum + item.dolares,
      0
    );
    const periodGanancias = periodEnvios.reduce(
      (sum, item) => sum + item.ganancia,
      0
    );
    const periodCambioPromedio =
      periodTotalDolares > 0
        ? periodEnvios.reduce(
            (sum, item) => sum + item.cambio * item.dolares,
            0
          ) / periodTotalDolares
        : (periodo?.cambioPromedio ?? 0);

    return {
      cambioPromedio: periodCambioPromedio,
      entradas: periodEntradas.map((item) => ({
        cambio: item.cambio,
        descripcion: item.descripcion,
        entradaDolar: item.entradaDolar,
        fecha: String(item.fecha),
        moneda: item.moneda as Moneda,
        operador: item.operador,
        total: item.total,
      })),
      envios: periodEnvios.map((item) => ({
        cambio: item.cambio,
        dolares: item.dolares,
        fecha: String(item.fecha),
        florines: item.florines,
        ganancia: item.ganancia,
        nombre: item.nombre,
        operador: item.operador as Envio['operador'],
        pesos: item.pesos,
        estipulado: item.estipulado,
      })),
      periodo: {
        gananciasMes: periodGanancias,
        mes: selectedMes,
        saldoAnterior: periodo?.saldoAnterior ?? 0,
        totalDolares: periodTotalDolares,
      },
      salidas: periodSalidas.map((item) => ({
        categoria: item.categoria as Salida['categoria'],
        descripcion: item.descripcion,
        fecha: String(item.fecha),
        moneda: item.moneda as Moneda,
        operador: item.operador,
        valor: item.valor,
        valorDolar: item.valorDolar,
      })),
      salidasExternas: periodSalidasExternas.map((item) => ({
        cambio: item.cambio,
        descripcion: item.descripcion,
        dolares: item.dolares,
        empleado: item.empleado,
        envioId: item.envioId,
        entradaId: item.entradaId,
        fecha: String(item.fecha),
        florines: item.florines,
        id: item.id,
        pesos: item.pesos,
      })),
    };
  } catch {
    return getEmptyBalancePeriodData(selectedMes);
  }
}

export async function getDashboardSummary(
  mes?: string
): Promise<DashboardSummary> {
  const data = await getBalancePeriodData(mes);
  const monthPrefix = `${data.periodo.mes}-`;
  const periodEnvios = data.envios.filter((item) =>
    item.fecha.startsWith(monthPrefix)
  );
  const periodEntradas = data.entradas.filter((item) =>
    item.fecha.startsWith(monthPrefix)
  );
  const periodSalidas = data.salidas.filter((item) =>
    item.fecha.startsWith(monthPrefix)
  );
  const periodSalidasExternas = data.salidasExternas.filter((item) =>
    item.fecha.startsWith(monthPrefix)
  );

  const totalEnvios = periodEnvios.reduce((sum, item) => sum + item.pesos, 0);
  const totalEntradas = periodEntradas.reduce(
    (sum, item) => sum + (item.moneda === 'COP' ? item.total : 0),
    0
  );
  const totalEntradaDolares = periodEntradas.reduce(
    (sum, item) => sum + (item.moneda === 'USD' ? (item.entradaDolar ?? 0) : 0),
    0
  );
  const totalSalidas = periodSalidas.reduce(
    (sum, item) => sum + (item.moneda === 'COP' ? item.valor : 0),
    0
  );
  const totalSalidaDolares = periodSalidas.reduce(
    (sum, item) => sum + (item.moneda === 'USD' ? (item.valorDolar ?? 0) : 0),
    0
  );
  const totalDolares = periodEnvios.reduce(
    (sum, item) => sum + item.dolares,
    0
  );
  const dolaresDevueltos = periodSalidasExternas.reduce(
    (sum, item) => sum + item.dolares,
    0
  );

  let creditosCount = 0;
  let pendientesCount = 0;
  try {
    const [creditRows, pendingRows] = await Promise.all([
      db.select().from(creditos4x1000),
      db.select().from(pendientes),
    ]);
    creditosCount = creditRows.filter((item) =>
      String(item.fecha).startsWith(monthPrefix)
    ).length;
    pendientesCount = pendingRows.filter(
      (item) => String(item.fecha).startsWith(monthPrefix) && !item.completado
    ).length;
  } catch {
    creditosCount = 0;
    pendientesCount = 0;
  }

  return {
    cambioPromedio: data.cambioPromedio,
    creditosCount,
    currentBalance:
      data.periodo.saldoAnterior + totalEntradas - totalSalidas - totalEnvios,
    currentBalanceUsd:
      totalEntradaDolares +
      totalDolares -
      dolaresDevueltos -
      totalSalidaDolares,
    entradasCount: periodEntradas.length,
    enviosCount: periodEnvios.length,
    period: data.periodo.mes,
    periodLabel: formatPeriodLabel(data.periodo.mes),
    pendientesCount,
    saldoAnterior: data.periodo.saldoAnterior,
    salidasCount: periodSalidas.length,
    salidasExternasCount: periodSalidasExternas.length,
    totalDolares,
    totalEntradaDolares,
    totalEntradas,
    totalEnvios,
    totalSalidaDolares,
    totalSalidas,
  };
}

function getEmptyBalancePeriodData(mes: string): BalancePeriodData {
  return {
    cambioPromedio: 0,
    entradas: [],
    envios: [],
    periodo: {
      gananciasMes: 0,
      mes,
      saldoAnterior: 0,
      totalDolares: 0,
    },
    salidas: [],
    salidasExternas: [],
  };
}
