# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Respuesta

- Responder siempre en espanol.
- Ser breve y directo. No hacer recap largos.
- Si una tarea es pequena, hacer el cambio sin crear planes extensos.

## Contexto minimo del proyecto

Stack fijo:

- Next.js 16 App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Clerk
- Drizzle ORM + Neon PostgreSQL
- @t3-oss/env-nextjs en `src/env.ts`
- npm

No migrar a otro framework o stack salvo pedido explicito.

## Contenido de servicios y areas

- Toda la informacion visible de paginas de servicios y areas debe salir de los archivos `.md` en `doc/info-areas` y `doc/infor_services`.
- No inventar, reemplazar ni cambiar informacion de esos `.md` salvo pedido explicito del usuario.
- Si una pagina de area o servicio necesita nuevo texto, primero actualizar el `.md` correspondiente y luego renderizarlo desde ahi.
- Las imagenes y estilos pueden ajustarse en componentes, pero el contenido textual base debe respetar los `.md`.

## Uso de skills y MCP

- No usar skills ni MCP por defecto.
- Usarlos solo cuando el usuario los pida explicitamente, por ejemplo: `$drizzle-orm`, `$clerk-nextjs-patterns`, `$shadcn`, `$playwright-cli`.
- Excepcion: para cambios de Next.js, leer solo la guia relevante en `node_modules/next/dist/docs/` antes de editar.
- Si el usuario pide investigar, verificar informacion actualizada o documentacion oficial, entonces consultar fuentes oficiales.

## Validaciones

- No ejecutar `npm run build`, `npm run lint`, `npm run typecheck` ni pruebas globales por defecto.
- No ejecutar `npm run check`, `npm run lint:fix`, `npm run format:check` ni validaciones equivalentes salvo pedido explicito del usuario.
- Ejecutar validaciones completas solo si el usuario lo pide explicitamente.
- Para cambios pequenos, preferir inspeccion puntual del archivo afectado.

## Base de datos y seguridad

- Nunca mostrar secretos ni valores reales de `.env`.
- Mantener `.env*` fuera de git.
- No borrar ni modificar datos de Neon sin pedido explicito del usuario.
- Para Drizzle, el schema vive en `src/db/schema.ts` y las migraciones en `drizzle/`.
- No ignorar la carpeta `drizzle/`; debe versionarse.

## Convenciones de edicion

- Preservar la arquitectura actual.
- Usar `apply_patch` para ediciones manuales.
- No revertir cambios existentes que no hayas hecho.
- Mantener cambios acotados a lo que el usuario pidio.
