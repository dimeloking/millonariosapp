ALTER TABLE "entradas" ADD COLUMN "moneda" text DEFAULT 'COP' NOT NULL;--> statement-breakpoint
UPDATE "entradas" SET "moneda" = 'USD' WHERE "entrada_dolar" IS NOT NULL AND "entrada_dolar" > 0 AND "descripcion" NOT ILIKE 'DEV EXT%';--> statement-breakpoint
ALTER TABLE "salidas" ADD COLUMN "moneda" text DEFAULT 'COP' NOT NULL;--> statement-breakpoint
ALTER TABLE "salidas" ADD COLUMN "valor_dolar" real;
