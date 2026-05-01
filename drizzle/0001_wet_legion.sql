CREATE TABLE "salidas_externas" (
	"id" serial PRIMARY KEY NOT NULL,
	"fecha" date NOT NULL,
	"empleado" text NOT NULL,
	"descripcion" text NOT NULL,
	"dolares" real DEFAULT 0 NOT NULL,
	"florines" real DEFAULT 0 NOT NULL,
	"cambio" real NOT NULL,
	"pesos" integer NOT NULL,
	"entrada_id" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "salidas_externas" ADD CONSTRAINT "salidas_externas_entrada_id_entradas_id_fk" FOREIGN KEY ("entrada_id") REFERENCES "public"."entradas"("id") ON DELETE no action ON UPDATE no action;