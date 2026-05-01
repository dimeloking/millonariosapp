CREATE TABLE "pendientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"fecha" date NOT NULL,
	"texto" text NOT NULL,
	"completado" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
