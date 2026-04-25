# Hola Mundo App

App base ecommerce con:

- Next.js 16 (App Router) + TypeScript
- Clerk
- Tailwind CSS + shadcn/ui
- Drizzle ORM + Neon PostgreSQL
- AWS S3 SDK
- Upstash Redis
- ESLint + Prettier + EditorConfig
- Husky + lint-staged
- Vercel

## Versiones usadas (latest stable al crear el proyecto)

- `next`: `16.2.3`
- `@clerk/nextjs`: `7.0.12`
- `drizzle-orm`: `0.45.2`
- `drizzle-kit`: `0.31.10`
- `@neondatabase/serverless`: `1.0.2`
- `@upstash/redis`: `1.37.0`
- `@aws-sdk/client-s3`: `3.1029.0`
- `shadcn`: `4.2.0`
- `husky`: `9.1.7`
- `lint-staged`: `16.4.0`
- `prettier`: `3.8.2`

## Configuración

1. Copia variables de entorno:

```bash
cp .env.example .env.local
```

2. Instala dependencias:

```bash
npm install
```

3. Genera migraciones Drizzle:

```bash
npm run db:generate
```

4. Ejecuta desarrollo:

```bash
npm run dev
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run format`
- `npm run db:generate`
- `npm run db:migrate`
