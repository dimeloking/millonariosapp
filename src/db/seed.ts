import 'dotenv/config';
import { count, eq } from 'drizzle-orm';
import { db } from './index';
import {
  balanceCapitales,
  entradas,
  envios,
  periodos,
  salidas,
} from './schema';
import { BALANCE, ENTRADAS, ENVIOS, SALIDAS } from '../lib/data';

async function main() {
  const [{ value: enviosCount }] = await db
    .select({ value: count() })
    .from(envios);
  const [{ value: entradasCount }] = await db
    .select({ value: count() })
    .from(entradas);
  const [{ value: salidasCount }] = await db
    .select({ value: count() })
    .from(salidas);

  if (enviosCount === 0) {
    await db.insert(envios).values(
      ENVIOS.map((item) => ({
        cambio: item.cambio,
        dolares: item.dolares,
        fecha: item.fecha,
        florines: item.florines,
        ganancia: item.ganancia,
        nombre: item.nombre,
        operador: item.operador,
        pesos: item.pesos,
        estipulado: item.estipulado,
      }))
    );
  }

  if (entradasCount === 0) {
    await db.insert(entradas).values(
      ENTRADAS.map((item) => ({
        cambio: item.cambio,
        descripcion: item.descripcion,
        entradaDolar: item.entradaDolar,
        fecha: item.fecha,
        moneda: item.moneda,
        total: item.total,
      }))
    );
  }

  if (salidasCount === 0) {
    await db.insert(salidas).values(
      SALIDAS.map((item) => ({
        categoria: item.categoria,
        descripcion: item.descripcion,
        fecha: item.fecha,
        moneda: item.moneda,
        valor: item.valor,
        valorDolar: item.valorDolar,
      }))
    );
  }

  let [periodo] = await db
    .select()
    .from(periodos)
    .where(eq(periodos.mes, '2026-03'))
    .limit(1);

  if (!periodo) {
    const inserted = await db
      .insert(periodos)
      .values({
        cambioPromedio: BALANCE.cambioPromedio,
        gananciasMes: BALANCE.gananciasMes,
        mes: '2026-03',
        saldoAnterior: BALANCE.saldoAnterior,
        totalDolares: BALANCE.totalDolares,
      })
      .returning();
    [periodo] = inserted;
  }

  const [{ value: capitalesCount }] = await db
    .select({ value: count() })
    .from(balanceCapitales)
    .where(eq(balanceCapitales.periodoId, periodo.id));

  if (capitalesCount === 0) {
    await db.insert(balanceCapitales).values([
      ...BALANCE.capitales.map((item) => ({
        concepto: item.concepto,
        nota: item.nota,
        periodoId: periodo.id,
        tipo: 'capital',
        valor: item.valor,
      })),
      ...BALANCE.efectivo.map((item) => ({
        concepto: item.concepto,
        nota: item.nota,
        periodoId: periodo.id,
        tipo: 'efectivo',
        valor: item.valor,
      })),
    ]);
  }

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
