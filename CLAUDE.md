# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project

Internal ledger for a currency-exchange / remittance operation in COP pesos, USD and florins: monthly shipments (`envios`, with exchange rate and profit), cash in/out (`entradas`, `salidas`), returned balances (`salidas_externas`), pending tasks, 4x1000 tax credits, and a monthly balance. Next.js 16.4 App Router (Cache Components, Partial Prefetching and React Compiler on; see `next.config.ts`), React 19.3, Clerk 7, Drizzle + Neon, Tailwind v4 + shadcn/Base UI, Recharts. Fixed stack: never migrate it unless asked. Existing Spanish UI copy stays in Spanish. `README.md` is a stale scaffold description.

## Commands

- `npm run dev` / `build` / `start`; `lint` (ESLint 10), `lint:fix`, `typecheck` (`tsc --noEmit`), `format` (`prettier --write .`).
- Check gate: `npm run lint` + `npm run typecheck` (there is no `check` script; `next lint` no longer exists). `typescript` stays at `^6` because typescript-eslint peers `<6.1.0`. Husky/lint-staged are installed but no `.husky/` hooks exist, so nothing runs on commit.
- There are no test scripts and no test files.
- `db:generate`, `db:migrate`, `db:push`, `db:studio` (Drizzle Kit) need explicit user approval. Migrations live in `drizzle/` and are versioned; never gitignore them. `src/db/seed.ts` seeds from the static March sample in `src/lib/data.ts`, and no npm script runs it.
- `format:check` / `format:write` only glob `ts, js, jsx, mdx` (not `tsx`).

## Architecture

- Access control: `src/proxy.ts` (Clerk middleware) protects everything except `/sign-in`, redirects `/` to `/dashboard`, and sends signed-in users away from `/sign-in`. The server actions in `src/app/dashboard/actions.ts` do not check auth themselves; they rely on that middleware.
- The data is a single shared ledger, not per user. Rows have no owner column; `operador` is derived from the Clerk user (`resolveOperatorName` in `src/lib/operator.ts` matches against the fixed list ROYMAN, ERIKA, LINA, CAMILO, JUAN PABLO, else falls back to the first token of the name/email). Update and delete actions take only a row id.
- Data flow: pages under `src/app/dashboard/*` are server components that read via `src/lib/movements-data.ts` and `src/lib/balance-data.ts`, then pass data to `*-page-client.tsx` components. With Cache Components every ledger read is request-time work: each page keeps a static shell and streams its body from an async child behind `<Suspense>` that calls `await connection()` first (fallback: `PageTopbarFallback`). Never cache these reads, the ledger is live financial data, and `getCurrentPeriod()` uses `new Date()` behind `connection()` for the same reason. New dashboard pages follow the same pattern. Writes go through `'use server'` actions that call `revalidateDashboardPaths()` (revalidates every dashboard route; keep new routes in that list). `/api/pendientes` feeds the topbar bell.
- The read helpers wrap queries in `try/catch` and return `[]` or empty period data on any error, so a DB outage looks like an empty ledger.
- DB driver is Drizzle `neon-http` (`src/db/index.ts`): stateless HTTP, no interactive transactions. Multi-row writes are not atomic. A "salida externa" (`createSalidaExternaAction`, `devolverEnvioSaldoAction`) inserts a linked `entradas` row (description prefixed `DEV EXT ·`) and a `salidas_externas` row; deleting the salida externa also deletes that entrada. `devolverEnvioSaldoAction` is idempotent per envío and returns `pesos + ganancia`.
- Balance math (`getDashboardSummary`): current COP balance = `periodos.saldoAnterior` + COP entradas − COP salidas − envío pesos; USD balance = USD entradas + envío dólares − dólares devueltos − USD salidas. Months are `yyyy-mm` filtered by string prefix on the `fecha` date. `periodos.saldoAnterior` (opening balance) is edited via `updateSaldoBaseAction`, which creates the month row if missing. `cambioPromedio` is weighted by dollars.
- Dates and timezone: drawers build "today" from the browser's local time, but `getCurrentPeriod()` in `balance-data.ts` uses server time, so the default month can differ near midnight in Colombia. The TRM comes from `co.dolarapi.com` (cached 1 h) and returns `null` on failure.
- `src/lib/s3.ts` (AWS S3) and `src/lib/upstash.ts` (Upstash Redis, `null` when unconfigured) exist but nothing imports them yet.

## Rules and pitfalls

- Env: validate through `src/env.ts` (`@t3-oss/env-nextjs`); never use raw `process.env` in app code. Names: `DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_APP_URL`, optional `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- Database safety: no destructive operations, `db:push`, or edits to Neon data without an explicit request. Schema is `src/db/schema.ts`; `salidas_externas` references `envios` and `entradas` by FK (no cascade).
- Money is integer COP (`pesos`, `total`, `valor`); dollars, florins and exchange rates are `real`. Currency is a `moneda` text (`COP` | `USD`); `salidas.categoria` is one of Pagos, Créditos, Viajes, Impuestos, Otros.
- `/sign-in/[[...sign-in]]` renders a `<Suspense>`-wrapped `UrlDataMarker` (client `usePathname`); without it the fallback-shell prerender of that catch-all route fails with `blocking-prerender-metadata-runtime`.
- Lint config is `eslint.config.mjs` (React rules are disabled on purpose for ESLint 10 compatibility; it also ignores `.agents/**` and `drizzle/**`). Engines: Node 24.x, npm 11.x.
- Extra high-risk area: storage (S3, Upstash).
