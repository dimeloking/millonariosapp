import {
  boolean,
  date,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const envios = pgTable('envios', {
  id: serial('id').primaryKey(),
  fecha: date('fecha').notNull(),
  cambio: integer('cambio').notNull(),
  estipulado: real('estipulado').notNull(),
  nombre: text('nombre').notNull(),
  pesos: integer('pesos').notNull(),
  florines: real('florines').notNull(),
  dolares: real('dolares').notNull(),
  ganancia: real('ganancia').notNull(),
  operador: text('operador').notNull(), // ROYMAN | ERIKA | LINA | JUAN PABLO
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const entradas = pgTable('entradas', {
  id: serial('id').primaryKey(),
  fecha: date('fecha').notNull(),
  operador: text('operador').notNull().default('OPERADOR'),
  descripcion: text('descripcion').notNull(),
  moneda: text('moneda').notNull().default('COP'),
  entradaDolar: real('entrada_dolar'),
  cambio: real('cambio'),
  total: integer('total').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const salidas = pgTable('salidas', {
  id: serial('id').primaryKey(),
  fecha: date('fecha').notNull(),
  operador: text('operador').notNull().default('OPERADOR'),
  descripcion: text('descripcion').notNull(),
  categoria: text('categoria').notNull(), // Pagos | Créditos | Viajes | Impuestos | Otros
  moneda: text('moneda').notNull().default('COP'),
  valor: integer('valor').notNull(),
  valorDolar: real('valor_dolar'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const salidasExternas = pgTable('salidas_externas', {
  id: serial('id').primaryKey(),
  fecha: date('fecha').notNull(),
  empleado: text('empleado').notNull(),
  descripcion: text('descripcion').notNull(),
  dolares: real('dolares').notNull().default(0),
  florines: real('florines').notNull().default(0),
  cambio: real('cambio').notNull(),
  pesos: integer('pesos').notNull(),
  envioId: integer('envio_id').references(() => envios.id),
  entradaId: integer('entrada_id').references(() => entradas.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const pendientes = pgTable('pendientes', {
  id: serial('id').primaryKey(),
  fecha: date('fecha').notNull(),
  operador: text('operador').notNull().default('OPERADOR'),
  texto: text('texto').notNull(),
  valor: integer('valor').notNull().default(0),
  completado: boolean('completado').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const creditos4x1000 = pgTable('creditos_4x1000', {
  id: serial('id').primaryKey(),
  fecha: date('fecha').notNull(),
  banco: text('banco').notNull(),
  cuenta: text('cuenta').notNull(),
  valor: integer('valor').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const periodos = pgTable('periodos', {
  id: serial('id').primaryKey(),
  mes: text('mes').notNull().unique(), // "2026-03"
  saldoAnterior: integer('saldo_anterior').default(0),
  totalDolares: real('total_dolares').default(0),
  cambioPromedio: real('cambio_promedio').default(3600),
  gananciasMes: real('ganancias_mes').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const balanceCapitales = pgTable('balance_capitales', {
  id: serial('id').primaryKey(),
  periodoId: integer('periodo_id')
    .notNull()
    .references(() => periodos.id),
  concepto: text('concepto').notNull(),
  valor: integer('valor').notNull(),
  nota: text('nota'),
  tipo: text('tipo').notNull().default('capital'), // capital | efectivo
});
