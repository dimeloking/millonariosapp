# Prompt sugerido para usar `web-app-creator`

```
Usa $web-app-creator y créame una app web ecommerce.

Stack obligatorio:
- Next.js 16 App Router
- Clerk
- Tailwind + shadcn/ui
- Drizzle ORM + Neon PostgreSQL
- AWS S3
- Upstash
- Vercel
- TypeScript, ESLint, Prettier, .editorconfig
- Husky + lint-staged

Reglas:
- Verifica primero versiones estables actuales en documentación oficial.
- Usa skills locales del repo y MCP por tecnología.
- Si falta una fuente confiable para una dependencia, repórtalo y no la instales.
- Déjalo listo para `pnpm dev` con `.env.example` y `README.md`.

Entregables:
- Matriz de versiones con enlaces oficiales.
- Proyecto funcionando.
- Resultado de `lint`, `typecheck` y `build`.
```

Prompt alterno (sin mención explícita):

```
Quiero que actúes con el perfil web-app-creator de AGENTS.md.
Créame una app base de [nombre-proyecto] con:
- Next.js 16 App Router
- Clerk
- Tailwind + shadcn/ui
- Drizzle ORM + Neon PostgreSQL
- AWS S3
- Upstash
- Vercel
- TypeScript, ESLint, Prettier, .editorconfig
- Husky + lint-staged

Antes de instalar, verifica versiones actuales en documentación oficial y muéstrame la matriz de versiones con enlaces.
Luego genera el proyecto y déjalo listo para `pnpm dev`.
```
