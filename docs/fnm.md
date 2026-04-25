# fnm + npm (APPWEB)

Este proyecto está preparado para trabajar con **Node por fnm** y scripts con **npm**.

## 1) Verificar herramientas

```bash
fnm --version
node -v
npm -v
```

## 2) Activar Node del proyecto con fnm

Desde la raíz del repo:

```bash
fnm use --install-if-missing
```

El repo incluye `.node-version` y `.nvmrc`, así que `fnm` toma esa versión automáticamente.

## 3) Instalar dependencias

Cuando exista `package.json`:

```bash
npm install
```

## 4) Ejecutar app en desarrollo

```bash
npm run dev
```

Nota: aquí no se puede ejecutar `npm run dev` todavía porque actualmente no hay `package.json` en la raíz.

## 5) VS Code

Se usa configuración de workspace en:

- `.vscode/settings.json` (archivo correcto en VS Code)

Con ajustes para npm:

- `npm.packageManager = "npm"`
- `npm.autoDetect = "on"`
- `npm.scriptRunner = "terminal"`
