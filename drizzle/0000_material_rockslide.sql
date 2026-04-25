CREATE TABLE "balance_capitales" (
	"id" serial PRIMARY KEY NOT NULL,
	"periodo_id" integer NOT NULL,
	"concepto" text NOT NULL,
	"valor" integer NOT NULL,
	"nota" text,
	"tipo" text DEFAULT 'capital' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creditos_4x1000" (
	"id" serial PRIMARY KEY NOT NULL,
	"fecha" date NOT NULL,
	"banco" text NOT NULL,
	"cuenta" text NOT NULL,
	"valor" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entradas" (
	"id" serial PRIMARY KEY NOT NULL,
	"fecha" date NOT NULL,
	"descripcion" text NOT NULL,
	"entrada_dolar" real,
	"cambio" real,
	"total" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "envios" (
	"id" serial PRIMARY KEY NOT NULL,
	"fecha" date NOT NULL,
	"cambio" integer NOT NULL,
	"estipulado" real NOT NULL,
	"nombre" text NOT NULL,
	"pesos" integer NOT NULL,
	"florines" real NOT NULL,
	"dolares" real NOT NULL,
	"ganancia" real NOT NULL,
	"operador" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "periodos" (
	"id" serial PRIMARY KEY NOT NULL,
	"mes" text NOT NULL,
	"saldo_anterior" integer DEFAULT 0,
	"total_dolares" real DEFAULT 0,
	"cambio_promedio" real DEFAULT 3600,
	"ganancias_mes" real DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "periodos_mes_unique" UNIQUE("mes")
);
--> statement-breakpoint
CREATE TABLE "salidas" (
	"id" serial PRIMARY KEY NOT NULL,
	"fecha" date NOT NULL,
	"descripcion" text NOT NULL,
	"categoria" text NOT NULL,
	"valor" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "balance_capitales" ADD CONSTRAINT "balance_capitales_periodo_id_periodos_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."periodos"("id") ON DELETE no action ON UPDATE no action;