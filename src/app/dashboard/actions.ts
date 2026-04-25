"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { entradas, envios, salidas } from "@/db/schema";
import type { Entrada, Envio, Salida } from "@/lib/data";

function revalidateDashboardPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/balance");
  revalidatePath("/dashboard/envios");
  revalidatePath("/dashboard/entradas");
  revalidatePath("/dashboard/salidas");
}

export async function createEnvioAction(payload: Envio) {
  const [created] = await db
    .insert(envios)
    .values({
      cambio: payload.cambio,
      dolares: payload.dolares,
      fecha: payload.fecha,
      florines: payload.florines,
      ganancia: payload.ganancia,
      nombre: payload.nombre,
      operador: payload.operador,
      pesos: payload.pesos,
      estipulado: payload.estipulado,
    })
    .returning({ id: envios.id });

  revalidateDashboardPaths();
  return created?.id ?? null;
}

export async function updateEnvioAction(id: number, payload: Envio) {
  await db
    .update(envios)
    .set({
      cambio: payload.cambio,
      dolares: payload.dolares,
      fecha: payload.fecha,
      florines: payload.florines,
      ganancia: payload.ganancia,
      nombre: payload.nombre,
      operador: payload.operador,
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
  const [created] = await db
    .insert(entradas)
    .values({
      cambio: payload.cambio,
      descripcion: payload.descripcion,
      entradaDolar: payload.entradaDolar,
      fecha: payload.fecha,
      total: payload.total,
    })
    .returning({ id: entradas.id });

  revalidateDashboardPaths();
  return created?.id ?? null;
}

export async function updateEntradaAction(id: number, payload: Entrada) {
  await db
    .update(entradas)
    .set({
      cambio: payload.cambio,
      descripcion: payload.descripcion,
      entradaDolar: payload.entradaDolar,
      fecha: payload.fecha,
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
  const [created] = await db
    .insert(salidas)
    .values({
      categoria: payload.categoria,
      descripcion: payload.descripcion,
      fecha: payload.fecha,
      valor: payload.valor,
    })
    .returning({ id: salidas.id });

  revalidateDashboardPaths();
  return created?.id ?? null;
}

export async function updateSalidaAction(id: number, payload: Salida) {
  await db
    .update(salidas)
    .set({
      categoria: payload.categoria,
      descripcion: payload.descripcion,
      fecha: payload.fecha,
      valor: payload.valor,
    })
    .where(eq(salidas.id, id));

  revalidateDashboardPaths();
}

export async function deleteSalidaAction(id: number) {
  await db.delete(salidas).where(eq(salidas.id, id));
  revalidateDashboardPaths();
}
