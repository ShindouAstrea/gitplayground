# Git Playground

Plataforma web personal para **aprender, practicar y recordar git** desde la línea de comandos, de nivel cero a medio-alto. Todo se simula en el navegador: nada toca repositorios reales.

- **Ejercicios guiados** (26, en 4 niveles) con objetivos que se marcan solos, pistas progresivas, solución de referencia y **variantes** (nombres de ramas, archivos y escenarios cambian con "Nueva variante").
- **Gráfico en tiempo real** de commits, ramas, `HEAD`, tags y el remoto `origin`, animado después de cada comando. Clic en un commit = pega su hash en la terminal. Opción para ver commits inalcanzables (útil para entender rebase, amend, reset y reflog).
- **Terminal simulada** con `git` (init, status, add, rm, mv, commit, log, show, diff, blame, reflog, branch, switch, checkout, restore, tag, merge, rebase incl. `-i`, cherry-pick, revert, reset, stash, remote, fetch, pull, push, config, clean) y ayudantes de shell (`ls`, `cat`, `echo "x" > f`, `nano f`…). Conflictos reales línea a línea con marcadores, `--ours/--theirs`, `--continue/--abort/--skip`, pushes rechazados, `--force-with-lease`, etc. Historial con ↑/↓, autocompletado con Tab, encadenado con `&&`.
- **Tips didácticos** traducidos debajo de la salida de git (que se mantiene en inglés, como la verás en la vida real).
- **Instructivo buscable**: 32 comandos, 22 recetas "¿cómo hago…?" (resolver conflictos, deshacer commits, push rechazado, squash…) y 9 conceptos.
- **Quiz** de 48 preguntas para memorizar comandos; las que fallas aparecen primero.
- **Español / inglés** con diccionarios, tema oscuro/claro, progreso guardado en `localStorage`.

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # motor de git, ejercicios y paridad de idiomas
npm run build      # versión estática en dist/ (funciona desde cualquier carpeta, p. ej. GitHub Pages)
```

> En Windows, ejecuta `npm test` desde una ruta con la letra de unidad en mayúscula (`D:\...`); con `d:\...` Vitest carga dos copias de sí mismo y falla.

## Estructura

```
src/
  git/            motor de git simulado (sin React): estado, comandos, merge diff3, escenarios
  exercises/      definiciones de ejercicios (escenario, objetivos verificables, solución)
  content/        tipos del contenido y datos del quiz independientes del idioma
  i18n/locales/   un directorio por idioma: ui, hints, exercises, guide*, quiz
  components/     terminal, gráfico (graphLayout.ts + GitGraph.tsx), archivos, modales
  pages/          Inicio, Practicar, Sandbox, Instructivo, Quiz
```

## Agregar un idioma

1. Copia `src/i18n/locales/en/` a `src/i18n/locales/<código>/` y traduce los textos (el código de los ejemplos no se traduce).
2. Regístralo en `src/i18n/locales/index.ts`.
3. `npm test` verifica que el idioma nuevo tenga exactamente las mismas claves, ejercicios, entradas del instructivo y preguntas que el inglés.

## Agregar un ejercicio

1. Define el escenario, los objetivos y la solución en `src/exercises/defs.ts` (usa `Scenario` para preparar el repo y los helpers de `checks.ts` para los objetivos). Marca con `constraint: true` los objetivos del tipo "no muevas main".
2. Agrega sus textos en `src/i18n/locales/*/exercises.ts`.
3. `npm test` ejecuta la solución de referencia en varias variantes y comprueba que cumpla todos los objetivos y que ninguno parta cumplido.
