import { asc } from "drizzle-orm";
import { db } from "@/db";
import { entradas, envios, salidas } from "@/db/schema";
import { ENTRADAS, ENVIOS, SALIDAS, type Entrada, type Envio, type Salida } from "@/lib/data";

export type EnvioRecord = Envio & { id: number | string };
export type EntradaRecord = Entrada & { id: number | string };
export type SalidaRecord = Salida & { id: number | string };

export async function getEnviosData(): Promise<EnvioRecord[]> {
  try {
    const rows = await db.select().from(envios).orderBy(asc(envios.fecha), asc(envios.id));

    return rows.map((row) => ({
      cambio: row.cambio,
      dolares: row.dolares,
      fecha: String(row.fecha),
      florines: row.florines,
      ganancia: row.ganancia,
      id: row.id,
      nombre: row.nombre,
      operador: row.operador as Envio["operador"],
      pesos: row.pesos,
      estipulado: row.estipulado,
    }));
  } catch {
    return ENVIOS.map((row, index) => ({ ...row, id: `static-envio-${index}` }));
  }
}

export async function getEntradasData(): Promise<EntradaRecord[]> {
  try {
    const rows = await db.select().from(entradas).orderBy(asc(entradas.fecha), asc(entradas.id));

    return rows.map((row) => ({
      cambio: row.cambio,
      descripcion: row.descripcion,
      entradaDolar: row.entradaDolar,
      fecha: String(row.fecha),
      id: row.id,
      total: row.total,
    }));
  } catch {
    return ENTRADAS.map((row, index) => ({ ...row, id: `static-entrada-${index}` }));
  }
}

export async function getSalidasData(): Promise<SalidaRecord[]> {
  try {
    const rows = await db.select().from(salidas).orderBy(asc(salidas.fecha), asc(salidas.id));

    return rows.map((row) => ({
      categoria: row.categoria as Salida["categoria"],
      descripcion: row.descripcion,
      fecha: String(row.fecha),
      id: row.id,
      valor: row.valor,
    }));
  } catch {
    return SALIDAS.map((row, index) => ({ ...row, id: `static-salida-${index}` }));
  }
}
