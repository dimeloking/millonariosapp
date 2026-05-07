import { asc } from 'drizzle-orm';
import { db } from '@/db';
import {
  entradas,
  envios,
  pendientes,
  salidas,
  salidasExternas,
} from '@/db/schema';
import type { Entrada, Envio, Moneda, Salida } from '@/lib/data';

export type EnvioRecord = Envio & { id: number | string };
export type EntradaRecord = Entrada & { id: number | string; operador: string };
export type SalidaRecord = Salida & { id: number | string; operador: string };
export type SalidaExternaRecord = {
  cambio: number;
  descripcion: string;
  dolares: number;
  empleado: string;
  envioId: number | null;
  entradaId: number | null;
  fecha: string;
  florines: number;
  id: number | string;
  pesos: number;
};
export type PendienteRecord = {
  completado: boolean;
  fecha: string;
  id: number | string;
  operador: string;
  texto: string;
  valor: number;
};

export async function getEnviosData(): Promise<EnvioRecord[]> {
  try {
    const rows = await db
      .select()
      .from(envios)
      .orderBy(asc(envios.fecha), asc(envios.id));

    return rows.map((row) => ({
      cambio: row.cambio,
      dolares: row.dolares,
      fecha: String(row.fecha),
      florines: row.florines,
      ganancia: row.ganancia,
      id: row.id,
      nombre: row.nombre,
      operador: row.operador as Envio['operador'],
      pesos: row.pesos,
      estipulado: row.estipulado,
    }));
  } catch {
    return [];
  }
}

export async function getEntradasData(): Promise<EntradaRecord[]> {
  try {
    const rows = await db
      .select()
      .from(entradas)
      .orderBy(asc(entradas.fecha), asc(entradas.id));

    return rows.map((row) => ({
      cambio: row.cambio,
      descripcion: row.descripcion,
      entradaDolar: row.entradaDolar,
      fecha: String(row.fecha),
      id: row.id,
      moneda: row.moneda as Moneda,
      operador: row.operador,
      total: row.total,
    }));
  } catch {
    return [];
  }
}

export async function getSalidasData(): Promise<SalidaRecord[]> {
  try {
    const rows = await db
      .select()
      .from(salidas)
      .orderBy(asc(salidas.fecha), asc(salidas.id));

    return rows.map((row) => ({
      categoria: row.categoria as Salida['categoria'],
      descripcion: row.descripcion,
      fecha: String(row.fecha),
      id: row.id,
      moneda: row.moneda as Moneda,
      operador: row.operador,
      valor: row.valor,
      valorDolar: row.valorDolar,
    }));
  } catch {
    return [];
  }
}

export async function getSalidasExternasData(): Promise<SalidaExternaRecord[]> {
  try {
    const rows = await db
      .select()
      .from(salidasExternas)
      .orderBy(asc(salidasExternas.fecha), asc(salidasExternas.id));

    return rows.map((row) => ({
      cambio: row.cambio,
      descripcion: row.descripcion,
      dolares: row.dolares,
      empleado: row.empleado,
      envioId: row.envioId,
      entradaId: row.entradaId,
      fecha: String(row.fecha),
      florines: row.florines,
      id: row.id,
      pesos: row.pesos,
    }));
  } catch {
    return [];
  }
}

export async function getPendientesData(): Promise<PendienteRecord[]> {
  try {
    const rows = await db
      .select()
      .from(pendientes)
      .orderBy(asc(pendientes.fecha), asc(pendientes.id));

    return rows.map((row) => ({
      completado: row.completado,
      fecha: String(row.fecha),
      id: row.id,
      operador: row.operador,
      texto: row.texto,
      valor: row.valor,
    }));
  } catch {
    return [];
  }
}
