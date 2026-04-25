import { pgTable, serial, text, timestamp, integer, real, date } from "drizzle-orm/pg-core";

export const envios = pgTable("envios", {
  id: serial("id").primaryKey(),
  fecha: date("fecha").notNull(),
  cambio: integer("cambio").notNull(),
  estipulado: real("estipulado").notNull(),
  nombre: text("nombre").notNull(),
  pesos: integer("pesos").notNull(),
  florines: real("florines").notNull(),
  dolares: real("dolares").notNull(),
  ganancia: real("ganancia").notNull(),
  operador: text("operador").notNull(), // ROYMAN | ERIKA | LINA | JUAN PABLO
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const entradas = pgTable("entradas", {
  id: serial("id").primaryKey(),
  fecha: date("fecha").notNull(),
  descripcion: text("descripcion").notNull(),
  entradaDolar: real("entrada_dolar"),
  cambio: real("cambio"),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const salidas = pgTable("salidas", {
  id: serial("id").primaryKey(),
  fecha: date("fecha").notNull(),
  descripcion: text("descripcion").notNull(),
  categoria: text("categoria").notNull(), // Pagos | Créditos | Viajes | Impuestos | Otros
  valor: integer("valor").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const creditos4x1000 = pgTable("creditos_4x1000", {
  id: serial("id").primaryKey(),
  fecha: date("fecha").notNull(),
  banco: text("banco").notNull(),
  cuenta: text("cuenta").notNull(),
  valor: integer("valor").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const periodos = pgTable("periodos", {
  id: serial("id").primaryKey(),
  mes: text("mes").notNull().unique(), // "2026-03"
  saldoAnterior: integer("saldo_anterior").default(0),
  totalDolares: real("total_dolares").default(0),
  cambioPromedio: real("cambio_promedio").default(3600),
  gananciasMes: real("ganancias_mes").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const balanceCapitales = pgTable("balance_capitales", {
  id: serial("id").primaryKey(),
  periodoId: integer("periodo_id")
    .notNull()
    .references(() => periodos.id),
  concepto: text("concepto").notNull(),
  valor: integer("valor").notNull(),
  nota: text("nota"),
  tipo: text("tipo").notNull().default("capital"), // capital | efectivo
});
