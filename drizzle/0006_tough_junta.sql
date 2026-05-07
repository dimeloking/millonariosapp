ALTER TABLE "entradas" ADD COLUMN IF NOT EXISTS "operador" text DEFAULT 'OPERADOR' NOT NULL;--> statement-breakpoint
ALTER TABLE "pendientes" ADD COLUMN IF NOT EXISTS "operador" text DEFAULT 'OPERADOR' NOT NULL;--> statement-breakpoint
ALTER TABLE "salidas" ADD COLUMN IF NOT EXISTS "operador" text DEFAULT 'OPERADOR' NOT NULL;
