'use server';

import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import {
  entradas,
  envios,
  pendientes,
  periodos,
  salidas,
  salidasExternas,
} from '@/db/schema';
import type { Entrada, Envio, Salida } from '@/lib/data';
import type { SalidaExternaRecord } from '@/lib/movements-data';
import { resolveOperatorName } from '@/lib/operator';

function revalidateDashboardPaths() {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/balance');
  revalidatePath('/dashboard/envios');
  revalidatePath('/dashboard/entradas');
  revalidatePath('/dashboard/salidas');
  revalidatePath('/dashboard/salidas-ext');
  revalidatePath('/dashboard/pendientes');
}

async function getCurrentOperator() {
  const user = await currentUser();

  return resolveOperatorName(
    user?.fullName,
    user?.firstName,
    user?.username,
    user?.primaryEmailAddress?.emailAddress
  );
}

export async function createEnvioAction(payload: Envio) {
  const operador = await getCurrentOperator();

  const [created] = await db
    .insert(envios)
    .values({
      cambio: payload.cambio,
      dolares: payload.dolares,
      fecha: payload.fecha,
      florines: payload.florines,
      ganancia: payload.ganancia,
      nombre: payload.nombre,
      operador,
      pesos: payload.pesos,
      estipulado: payload.estipulado,
    })
    .returning({ id: envios.id });

  revalidateDashboardPaths();
  return created?.id ?? null;
}

export async function updateEnvioAction(id: number, payload: Envio) {
  const operador = await getCurrentOperator();

  await db
    .update(envios)
    .set({
      cambio: payload.cambio,
      dolares: payload.dolares,
      fecha: payload.fecha,
      florines: payload.florines,
      ganancia: payload.ganancia,
      nombre: payload.nombre,
      operador,
      pesos: payload.pesos,
      estipulado: payload.estipulado,
    })
    .where(eq(envios.id, id));

  revalidateDashboardPaths();
}

export async function deleteEnvioAction(id: number) {
  await db.delete(envios).where(eq(envios.id, id));
  revalidateDashboardPaths();
}

export async function createEntradaAction(payload: Entrada) {
  const operador = await getCurrentOperator();

  const [created] = await db
    .insert(entradas)
    .values({
      cambio: payload.cambio,
      descripcion: payload.descripcion,
      entradaDolar: payload.entradaDolar,
      fecha: payload.fecha,
      moneda: payload.moneda,
      operador,
      total: payload.total,
    })
    .returning({ id: entradas.id });

  revalidateDashboardPaths();
  return created?.id ?? null;
}

export async function updateEntradaAction(id: number, payload: Entrada) {
  const operador = await getCurrentOperator();

  await db
    .update(entradas)
    .set({
      cambio: payload.cambio,
      descripcion: payload.descripcion,
      entradaDolar: payload.entradaDolar,
      fecha: payload.fecha,
      moneda: payload.moneda,
      operador,
      total: payload.total,
    })
    .where(eq(entradas.id, id));

  revalidateDashboardPaths();
}

export async function deleteEntradaAction(id: number) {
  await db.delete(entradas).where(eq(entradas.id, id));
  revalidateDashboardPaths();
}

export async function createSalidaAction(payload: Salida) {
  const operador = await getCurrentOperator();

  const [created] = await db
    .insert(salidas)
    .values({
      categoria: payload.categoria,
      descripcion: payload.descripcion,
      fecha: payload.fecha,
      moneda: payload.moneda,
      operador,
      valor: payload.valor,
      valorDolar: payload.valorDolar,
    })
    .returning({ id: salidas.id });

  revalidateDashboardPaths();
  return created?.id ?? null;
}

export async function updateSalidaAction(id: number, payload: Salida) {
  const operador = await getCurrentOperator();

  await db
    .update(salidas)
    .set({
      categoria: payload.categoria,
      descripcion: payload.descripcion,
      fecha: payload.fecha,
      moneda: payload.moneda,
      operador,
      valor: payload.valor,
      valorDolar: payload.valorDolar,
    })
    .where(eq(salidas.id, id));

  revalidateDashboardPaths();
}

export async function deleteSalidaAction(id: number) {
  await db.delete(salidas).where(eq(salidas.id, id));
  revalidateDashboardPaths();
}

export type SalidaExternaPayload = Omit<
  SalidaExternaRecord,
  'entradaId' | 'envioId' | 'id'
> & {
  envioId?: number | null;
};

export async function createSalidaExternaAction(payload: SalidaExternaPayload) {
  const operador = await getCurrentOperator();

  const [createdEntrada] = await db
    .insert(entradas)
    .values({
      cambio: payload.cambio,
      descripcion: `DEV EXT · ${operador} · ${payload.descripcion}`,
      entradaDolar: payload.dolares || null,
      fecha: payload.fecha,
      moneda: 'COP',
      operador,
      total: payload.pesos,
    })
    .returning({ id: entradas.id });

  const [created] = await db
    .insert(salidasExternas)
    .values({
      cambio: payload.cambio,
      descripcion: payload.descripcion,
      dolares: payload.dolares,
      empleado: operador,
      envioId: payload.envioId,
      entradaId: createdEntrada?.id ?? null,
      fecha: payload.fecha,
      florines: payload.florines,
      pesos: payload.pesos,
    })
    .returning({ id: salidasExternas.id });

  revalidateDashboardPaths();

  return {
    entradaId: createdEntrada?.id ?? null,
    id: created?.id ?? null,
  };
}

export async function devolverEnvioSaldoAction(id: number) {
  const [envio] = await db
    .select()
    .from(envios)
    .where(eq(envios.id, id))
    .limit(1);

  if (!envio) {
    throw new Error('No existe el envío seleccionado.');
  }

  const [existing] = await db
    .select({ id: salidasExternas.id })
    .from(salidasExternas)
    .where(eq(salidasExternas.envioId, id))
    .limit(1);

  if (existing) {
    return {
      entradaId: null,
      id: existing.id,
    };
  }

  const operador = await getCurrentOperator();
  const totalDevuelto = Math.round(envio.pesos + envio.ganancia);
  const descripcion = `Retorno envío ${envio.nombre}`;

  const [createdEntrada] = await db
    .insert(entradas)
    .values({
      cambio: envio.cambio,
      descripcion: `DEV EXT · ${operador} · ${descripcion}`,
      entradaDolar: envio.dolares,
      fecha: envio.fecha,
      moneda: 'COP',
      operador,
      total: totalDevuelto,
    })
    .returning({ id: entradas.id });

  const [created] = await db
    .insert(salidasExternas)
    .values({
      cambio: envio.cambio,
      descripcion,
      dolares: envio.dolares,
      empleado: operador,
      envioId: envio.id,
      entradaId: createdEntrada?.id ?? null,
      fecha: envio.fecha,
      florines: envio.florines,
      pesos: totalDevuelto,
    })
    .returning({ id: salidasExternas.id });

  revalidateDashboardPaths();

  return {
    entradaId: createdEntrada?.id ?? null,
    id: created?.id ?? null,
  };
}

export async function deleteSalidaExternaAction(id: number) {
  const [row] = await db
    .select({ entradaId: salidasExternas.entradaId })
    .from(salidasExternas)
    .where(eq(salidasExternas.id, id))
    .limit(1);

  await db.delete(salidasExternas).where(eq(salidasExternas.id, id));

  if (row?.entradaId) {
    await db.delete(entradas).where(eq(entradas.id, row.entradaId));
  }

  revalidateDashboardPaths();
}

export async function updateSaldoBaseAction(
  mes: string,
  saldoAnterior: number
) {
  const [existing] = await db
    .select({ id: periodos.id })
    .from(periodos)
    .where(eq(periodos.mes, mes))
    .limit(1);

  if (existing) {
    await db
      .update(periodos)
      .set({ saldoAnterior })
      .where(eq(periodos.id, existing.id));
  } else {
    await db.insert(periodos).values({
      cambioPromedio: 0,
      gananciasMes: 0,
      mes,
      saldoAnterior,
      totalDolares: 0,
    });
  }

  revalidateDashboardPaths();
}

export type PendientePayload = {
  fecha: string;
  texto: string;
  valor: number;
};

export async function createPendienteAction(payload: PendientePayload) {
  const operador = await getCurrentOperator();

  const [created] = await db
    .insert(pendientes)
    .values({
      completado: false,
      fecha: payload.fecha,
      operador,
      texto: payload.texto,
      valor: payload.valor,
    })
    .returning({ id: pendientes.id });

  revalidateDashboardPaths();
  return created?.id ?? null;
}

export async function updatePendienteStatusAction(
  id: number,
  completado: boolean
) {
  await db.update(pendientes).set({ completado }).where(eq(pendientes.id, id));
  revalidateDashboardPaths();
}

export async function deletePendienteAction(id: number) {
  await db.delete(pendientes).where(eq(pendientes.id, id));
  revalidateDashboardPaths();
}
