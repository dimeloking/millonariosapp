import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { balanceCapitales, entradas, envios, periodos, salidas } from "@/db/schema";
import { BALANCE, ENTRADAS, ENVIOS, SALIDAS } from "@/lib/data";

export type BalancePeriodData = {
  cambioPromedio: number;
  capitales: typeof BALANCE.capitales;
  efectivo: typeof BALANCE.efectivo;
  entradas: typeof ENTRADAS;
  envios: typeof ENVIOS;
  periodo: {
    gananciasMes: number;
    mes: string;
    saldoAnterior: number;
    totalDolares: number;
  };
  salidas: typeof SALIDAS;
};

export async function getBalancePeriodData(mes = "2026-03"): Promise<BalancePeriodData> {
  try {
    const [periodo] = await db.select().from(periodos).where(eq(periodos.mes, mes)).limit(1);

    if (!periodo) {
      return getStaticBalancePeriodData(mes);
    }

    const [dbEnvios, dbEntradas, dbSalidas, dbCapitales] = await Promise.all([
      db.select().from(envios).orderBy(asc(envios.fecha), asc(envios.id)),
      db.select().from(entradas).orderBy(asc(entradas.fecha), asc(entradas.id)),
      db.select().from(salidas).orderBy(asc(salidas.fecha), asc(salidas.id)),
      db
        .select()
        .from(balanceCapitales)
        .where(eq(balanceCapitales.periodoId, periodo.id))
        .orderBy(asc(balanceCapitales.id)),
    ]);

    const monthPrefix = `${mes}-`;

    return {
      cambioPromedio: periodo.cambioPromedio ?? BALANCE.cambioPromedio,
      capitales: dbCapitales
        .filter((item) => item.tipo === "capital")
        .map((item) => ({
          concepto: item.concepto,
          nota: item.nota ?? undefined,
          valor: item.valor,
        })),
      efectivo: dbCapitales
        .filter((item) => item.tipo === "efectivo")
        .map((item) => ({
          concepto: item.concepto,
          nota: item.nota ?? undefined,
          valor: item.valor,
        })),
      entradas: dbEntradas.map((item) => ({
        cambio: item.cambio,
        descripcion: item.descripcion,
        entradaDolar: item.entradaDolar,
        fecha: String(item.fecha),
        total: item.total,
      })),
      envios: dbEnvios
        .filter((item) => String(item.fecha).startsWith(monthPrefix))
        .map((item) => ({
          cambio: item.cambio,
          dolares: item.dolares,
          fecha: String(item.fecha),
          florines: item.florines,
          ganancia: item.ganancia,
          nombre: item.nombre,
          operador: item.operador as (typeof ENVIOS)[number]["operador"],
          pesos: item.pesos,
          estipulado: item.estipulado,
        })),
      periodo: {
        gananciasMes: periodo.gananciasMes ?? 0,
        mes: periodo.mes,
        saldoAnterior: periodo.saldoAnterior ?? 0,
        totalDolares: periodo.totalDolares ?? 0,
      },
      salidas: dbSalidas.map((item) => ({
        categoria: item.categoria as (typeof SALIDAS)[number]["categoria"],
        descripcion: item.descripcion,
        fecha: String(item.fecha),
        valor: item.valor,
      })),
    };
  } catch {
    return getStaticBalancePeriodData(mes);
  }
}

function getStaticBalancePeriodData(mes: string): BalancePeriodData {
  return {
    cambioPromedio: BALANCE.cambioPromedio,
    capitales: BALANCE.capitales,
    efectivo: BALANCE.efectivo,
    entradas: ENTRADAS,
    envios: ENVIOS,
    periodo: {
      gananciasMes: BALANCE.gananciasMes,
      mes,
      saldoAnterior: BALANCE.saldoAnterior,
      totalDolares: BALANCE.totalDolares,
    },
    salidas: SALIDAS,
  };
}
