// Static example data from ENVIOS_MARZO.xlsx — March 2026

export type Envio = {
  fecha: string;
  cambio: number;
  estipulado: number;
  nombre: string;
  pesos: number;
  florines: number;
  dolares: number;
  ganancia: number;
  operador: "ROYMAN" | "ERIKA" | "LINA" | "JUAN PABLO";
};

export type Entrada = {
  fecha: string;
  descripcion: string;
  entradaDolar: number | null;
  cambio: number | null;
  total: number;
};

export type Salida = {
  fecha: string;
  descripcion: string;
  categoria: "Pagos" | "Créditos" | "Viajes" | "Impuestos" | "Otros";
  valor: number;
};

export type Credito4x1000 = {
  fecha: string;
  banco: string;
  cuenta: string;
  valor: number;
};

export type BalanceCapital = {
  concepto: string;
  valor: number;
  nota?: string;
};

export type Balance = {
  capitales: BalanceCapital[];
  efectivo: BalanceCapital[];
  saldoAnterior: number;
  totalDolares: number;
  cambioPromedio: number;
  gananciasMes: number;
};

export const ENVIOS: Envio[] = [
  {
    fecha: "2026-03-01",
    cambio: 3680,
    estipulado: 3153.15,
    nombre: "William Aguilar",
    pesos: 1000000,
    florines: 555,
    dolares: 317.14,
    ganancia: 167085.71,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-01",
    cambio: 3680,
    estipulado: 3153.15,
    nombre: "Adelina Ruiz",
    pesos: 600000,
    florines: 333,
    dolares: 190.28,
    ganancia: 100251.43,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-02",
    cambio: 3680,
    estipulado: 3148.4,
    nombre: "Yoselin Manzano",
    pesos: 1979000,
    florines: 1100,
    dolares: 628.57,
    ganancia: 334142.86,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-02",
    cambio: 3680,
    estipulado: 3157.21,
    nombre: "Adelina Ruiz",
    pesos: 700000,
    florines: 388,
    dolares: 221.71,
    ganancia: 115908.57,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-02",
    cambio: 3680,
    estipulado: 3150,
    nombre: "Andrés Salgado",
    pesos: 540000,
    florines: 300,
    dolares: 171.42,
    ganancia: 90857.14,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-02",
    cambio: 3680,
    estipulado: 3150,
    nombre: "Gabriel López",
    pesos: 900000,
    florines: 500,
    dolares: 285.71,
    ganancia: 151428.57,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-02",
    cambio: 3680,
    estipulado: 3150,
    nombre: "Cristian Rebellón",
    pesos: 279000,
    florines: 155,
    dolares: 88.57,
    ganancia: 46942.85,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-02",
    cambio: 3680,
    estipulado: 3150,
    nombre: "Juan Córdoba",
    pesos: 1260000,
    florines: 700,
    dolares: 400,
    ganancia: 212000,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-02",
    cambio: 3680,
    estipulado: 3500,
    nombre: "Lina Ramírez",
    pesos: 1700000,
    florines: 850,
    dolares: 485.71,
    ganancia: 87428.57,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-03",
    cambio: 3680,
    estipulado: 3153.15,
    nombre: "Darlis Márquez",
    pesos: 1000000,
    florines: 555,
    dolares: 317.14,
    ganancia: 167085.71,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-03",
    cambio: 3680,
    estipulado: 3181.81,
    nombre: "Dariana Gómez",
    pesos: 500000,
    florines: 275,
    dolares: 157.14,
    ganancia: 78285.71,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-03",
    cambio: 3680,
    estipulado: 3150,
    nombre: "Diana Múnera",
    pesos: 90000,
    florines: 50,
    dolares: 28.57,
    ganancia: 15142.86,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-03",
    cambio: 3680,
    estipulado: 3167.5,
    nombre: "Solmaria Castro",
    pesos: 543000,
    florines: 300,
    dolares: 171.42,
    ganancia: 87857.14,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-03",
    cambio: 3680,
    estipulado: 3151.8,
    nombre: "Arnaldo Libert",
    pesos: 2100000,
    florines: 1166,
    dolares: 666.28,
    ganancia: 351931.43,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-03",
    cambio: 3680,
    estipulado: 3150,
    nombre: "Baudilio Pérez",
    pesos: 765000,
    florines: 425,
    dolares: 242.85,
    ganancia: 128714.29,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-04",
    cambio: 3680,
    estipulado: 3202.5,
    nombre: "Sebastián Amell",
    pesos: 183000,
    florines: 100,
    dolares: 57.14,
    ganancia: 27285.71,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-04",
    cambio: 3680,
    estipulado: 3179.16,
    nombre: "Barley Hernández",
    pesos: 545000,
    florines: 300,
    dolares: 171.42,
    ganancia: 85857.14,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-04",
    cambio: 3680,
    estipulado: 3173.33,
    nombre: "Arley Cáceres",
    pesos: 272000,
    florines: 150,
    dolares: 85.71,
    ganancia: 43428.57,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-04",
    cambio: 3680,
    estipulado: 3179.16,
    nombre: "Nachira Barbosa",
    pesos: 545000,
    florines: 300,
    dolares: 171.42,
    ganancia: 85857.14,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-04",
    cambio: 3680,
    estipulado: 3187.91,
    nombre: "Jorge Jaramillo",
    pesos: 1093000,
    florines: 600,
    dolares: 342.85,
    ganancia: 168714.28,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-04",
    cambio: 3680,
    estipulado: 3193.75,
    nombre: "Yoimer Messino",
    pesos: 365000,
    florines: 200,
    dolares: 114.28,
    ganancia: 55571.43,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-04",
    cambio: 3680,
    estipulado: 3185,
    nombre: "Adelina Ruiz",
    pesos: 91000,
    florines: 50,
    dolares: 28.57,
    ganancia: 14142.86,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-05",
    cambio: 3680,
    estipulado: 3198.43,
    nombre: "Eder",
    pesos: 700000,
    florines: 383,
    dolares: 218.85,
    ganancia: 105394.28,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-05",
    cambio: 3680,
    estipulado: 3193.75,
    nombre: "Leonardo Diart",
    pesos: 146000,
    florines: 80,
    dolares: 45.71,
    ganancia: 22228.57,
    operador: "ROYMAN",
  },
  {
    fecha: "2026-03-05",
    cambio: 3680,
    estipulado: 3208.33,
    nombre: "Andrés Salgado",
    pesos: 550000,
    florines: 300,
    dolares: 171.42,
    ganancia: 80857.14,
    operador: "ERIKA",
  },
  {
    fecha: "2026-03-05",
    cambio: 3680,
    estipulado: 3199.58,
    nombre: "Carlos Montaño",
    pesos: 1097000,
    florines: 600,
    dolares: 342.85,
    ganancia: 164714.28,
    operador: "ERIKA",
  },
];

export const ENTRADAS: Entrada[] = [
  {
    fecha: "2026-03-07",
    descripcion: "CUOTA 1 CELULAR",
    entradaDolar: null,
    cambio: null,
    total: 2000000,
  },
  {
    fecha: "2026-03-14",
    descripcion: "CUOTA 2 CELULAR ZAPOTE",
    entradaDolar: null,
    cambio: null,
    total: 1000000,
  },
  {
    fecha: "2026-03-21",
    descripcion: "CUOTA # 3 CELULAR ZAPOTE",
    entradaDolar: null,
    cambio: null,
    total: 1430000,
  },
  {
    fecha: "2026-03-14",
    descripcion: "TRAJO LINA",
    entradaDolar: 10700,
    cambio: 3690,
    total: 39483000,
  },
  {
    fecha: "2026-03-16",
    descripcion: "TRAJO ECUATORINA SARA",
    entradaDolar: 7500,
    cambio: 3690,
    total: 27675000,
  },
  {
    fecha: "2026-03-20",
    descripcion: "ENTREGÓ SARA",
    entradaDolar: 2800,
    cambio: 3645,
    total: 10206614,
  },
  {
    fecha: "2026-03-19",
    descripcion: "CAMBIO BILLETES CARA PEQUEÑA",
    entradaDolar: 300,
    cambio: 3550,
    total: 1065000,
  },
  {
    fecha: "2026-03-31",
    descripcion: "TRAJO ANDRÉS (AMIGO CAMILO)",
    entradaDolar: 7000,
    cambio: 3670,
    total: 25690000,
  },
  {
    fecha: "2026-03-31",
    descripcion: "TRAJO JUAN PABLO (6K) + LIS (9K)",
    entradaDolar: 15000,
    cambio: 3670,
    total: 55050000,
  },
];

export const SALIDAS: Salida[] = [
  { fecha: "2026-02-11", descripcion: "Intereses Carlos", categoria: "Pagos", valor: 500000 },
  {
    fecha: "2026-02-07",
    descripcion: "Pago crédito Bancolombia Erika",
    categoria: "Créditos",
    valor: 1229000,
  },
  {
    fecha: "2026-02-07",
    descripcion: "Pago crédito Bancolombia Lina",
    categoria: "Créditos",
    valor: 1350000,
  },
  { fecha: "2026-03-15", descripcion: "Viaje Bogotá Royman", categoria: "Viajes", valor: 200000 },
  { fecha: "2026-03-17", descripcion: "Viaje Ipiales", categoria: "Viajes", valor: 1256000 },
  {
    fecha: "2026-03-30",
    descripcion: "Viaje Juan Pablo Armenia",
    categoria: "Viajes",
    valor: 250000,
  },
  { fecha: "2026-03-30", descripcion: "Ida aeropuerto", categoria: "Viajes", valor: 100000 },
  {
    fecha: "2026-03-31",
    descripcion: "Impuestos Bancolombia Erika",
    categoria: "Impuestos",
    valor: 11150,
  },
  {
    fecha: "2026-03-31",
    descripcion: "Impuestos Nequi Erika",
    categoria: "Impuestos",
    valor: 19653,
  },
  {
    fecha: "2026-03-31",
    descripcion: "Impuestos Bancolombia Royman",
    categoria: "Impuestos",
    valor: 47767,
  },
  {
    fecha: "2026-03-31",
    descripcion: "Impuestos Nequi Juan Pablo",
    categoria: "Impuestos",
    valor: 1102,
  },
];

export const CREDITOS_4X1000: Credito4x1000[] = [
  { fecha: "2026-03-02", banco: "NEQUI", cuenta: "Erika", valor: 1116 },
  { fecha: "2026-03-04", banco: "BANCOLOMBIA", cuenta: "Erika", valor: 1284 },
  { fecha: "2026-03-04", banco: "BANCOLOMBIA", cuenta: "Erika", valor: 669 },
  { fecha: "2026-03-04", banco: "NEQUI", cuenta: "Erika", valor: 2000 },
  { fecha: "2026-03-04", banco: "NEQUI", cuenta: "Erika", valor: 400 },
  { fecha: "2026-03-04", banco: "NEQUI", cuenta: "Erika", valor: 128 },
  { fecha: "2026-03-04", banco: "NEQUI", cuenta: "Erika", valor: 80 },
  { fecha: "2026-03-05", banco: "NEQUI", cuenta: "Erika", valor: 560 },
  { fecha: "2026-03-07", banco: "NEQUI", cuenta: "Erika", valor: 20 },
  { fecha: "2026-03-07", banco: "NEQUI", cuenta: "Erika", valor: 500 },
  { fecha: "2026-03-08", banco: "NEQUI", cuenta: "Erika", valor: 1644 },
  { fecha: "2026-03-08", banco: "NEQUI", cuenta: "Erika", valor: 1120 },
  { fecha: "2026-03-09", banco: "NEQUI", cuenta: "Erika", valor: 668 },
  { fecha: "2026-03-10", banco: "NEQUI", cuenta: "Erika", valor: 72 },
  { fecha: "2026-03-12", banco: "NEQUI", cuenta: "Erika", valor: 140 },
  { fecha: "2026-03-13", banco: "NEQUI", cuenta: "Erika", valor: 48 },
  { fecha: "2026-03-15", banco: "NEQUI", cuenta: "Erika", valor: 192 },
  { fecha: "2026-03-15", banco: "NEQUI", cuenta: "Erika", valor: 4890 },
  { fecha: "2026-03-16", banco: "NEQUI", cuenta: "Erika", valor: 1680 },
  { fecha: "2026-03-22", banco: "BANCOLOMBIA", cuenta: "Erika", valor: 249 },
  { fecha: "2026-03-24", banco: "BANCOLOMBIA", cuenta: "Erika", valor: 12000 },
  { fecha: "2026-03-25", banco: "BANCOLOMBIA", cuenta: "Erika", valor: 3114 },
  { fecha: "2026-03-26", banco: "BANCOLOMBIA", cuenta: "Erika", valor: 260 },
  { fecha: "2026-03-28", banco: "BANCOLOMBIA", cuenta: "Erika", valor: 2000 },
  { fecha: "2026-03-30", banco: "BANCOLOMBIA", cuenta: "Erika", valor: 2724 },
];

export const BALANCE: Balance = {
  capitales: [
    { concepto: "Camilo", valor: 28441000 },
    { concepto: "Royman", valor: 18226000 },
    { concepto: "Préstamos Carlos", valor: 20000000 },
    { concepto: "Préstamo Lina Bancolombia", valor: 37420756, nota: "Con pago de cuota en abril" },
    { concepto: "Préstamos Bancolombia", valor: 31660947, nota: "Con pago de cuota en abril" },
  ],
  efectivo: [
    { concepto: "Lina en cuenta", valor: 4020000 },
    { concepto: "Royman en cuenta", valor: 397000 },
    { concepto: "Celular pendiente por vender", valor: 3550000 },
  ],
  saldoAnterior: 51323001,
  totalDolares: 50007.83,
  cambioPromedio: 3600,
  gananciasMes: 52296492.83,
};

// ── Aggregate helpers ────────────────────────────────────────────────

export function totalEnviosPesos() {
  return ENVIOS.reduce((s, e) => s + e.pesos, 0);
}

export function totalEnviosFlorines() {
  return ENVIOS.reduce((s, e) => s + e.florines, 0);
}

export function totalEnviosDolares() {
  return ENVIOS.reduce((s, e) => s + e.dolares, 0);
}

export function totalGanancias() {
  return ENVIOS.reduce((s, e) => s + e.ganancia, 0);
}

export function totalEntradas() {
  return ENTRADAS.reduce((s, e) => s + e.total, 0);
}

export function totalSalidas() {
  return SALIDAS.reduce((s, e) => s + e.valor, 0);
}

export function totalCreditos() {
  return CREDITOS_4X1000.reduce((s, e) => s + e.valor, 0);
}

export function enviosPorDia(): Record<string, Envio[]> {
  const groups: Record<string, Envio[]> = {};
  for (const e of ENVIOS) {
    if (!groups[e.fecha]) groups[e.fecha] = [];
    groups[e.fecha].push(e);
  }
  return groups;
}

export function sparkEnviosDiarios(): number[] {
  const byDay = enviosPorDia();
  return Object.values(byDay).map((day) => day.reduce((s, e) => s + e.pesos, 0));
}

export function saldoActual() {
  const totalDolaresEnCOP = BALANCE.totalDolares * BALANCE.cambioPromedio;
  const totalCapitales = BALANCE.capitales.reduce((s, c) => s + c.valor, 0);
  const totalEfectivo = BALANCE.efectivo.reduce((s, c) => s + c.valor, 0);
  return totalDolaresEnCOP + totalCapitales + totalEfectivo;
}
