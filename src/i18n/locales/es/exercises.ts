import type { ExerciseText } from '../../../exercises/types';

// Textos de src/exercises/defs.ts. Los {marcadores} son los parámetros de cada variante.
export const exercises: Record<string, ExerciseText> = {
  'first-commit': {
    title: 'Tu primer commit',
    summary: 'Convierte una carpeta en repositorio y guarda su primera foto.',
    description:
      'Tienes una carpeta `{project}` con dos archivos, pero git todavía no sabe nada de ella.\n\n' +
      'Un **commit** es una foto de tus archivos. Antes de hacer commit eliges qué entra, poniendo archivos en el **staging area** con `git add`.\n\n' +
      '- `git init` crea el repositorio\n- `git status` te dice lo que git ve\n- `git add` prepara archivos y `git commit -m "..."` los guarda',
    goals: {
      init: 'Inicializa el repositorio',
      commit: 'Haz commit de `README.md` y `{file}`',
      clean: 'Deja el directorio de trabajo limpio (nada pendiente en `git status`)',
    },
    hints: [
      'Empieza con `git init`. Luego ejecuta `git status` y lee lo que dice de los archivos.',
      '`git add .` agrega al staging todos los archivos de la carpeta.',
      'Termina con `git commit -m "Initial commit"`.',
    ],
  },
  'stage-some': {
    title: 'Elige qué entra al commit',
    summary: 'Agrega solo algunos cambios al staging y deja el resto fuera del commit.',
    description:
      "Programaste la funcionalidad {feature}: un archivo nuevo `src/{feature}.js` y una sección nueva en `README.md`. Mientras depurabas también agregaste `console.log('DEBUG!!!')` en `src/core.js`, que **no** debe ir al commit (pero quieres conservarlo localmente por ahora).\n\n" +
      'El staging area te permite armar un commit por partes: solo entra lo que agregues con `git add`.',
    goals: {
      committed: 'Haz commit de `src/{feature}.js` y `README.md`',
      notDebug: 'El commit no debe incluir el cambio de `src/core.js`',
      kept: 'Conserva la línea de debug en tu copia de `src/core.js`',
      oneCommit: 'Usa un solo commit nuevo',
    },
    hints: [
      'Mira `git status` y `git diff` para ver cada cambio.',
      '`git add` acepta varias rutas: `git add README.md src/{feature}.js`.',
      'Luego `git commit -m "Add {feature}"`. `src/core.js` seguirá apareciendo como modificado — es lo esperado.',
    ],
  },
  amend: {
    title: 'Corrige el último commit',
    summary: 'Arregla un error de tipeo en el mensaje y agrega un archivo olvidado.',
    description:
      'Tu último commit se llama "Add {feature} featrue" (¡error de tipeo!) y olvidaste incluir `tests/{feature}.test.js`.\n\n' +
      'Como el commit aún no se ha compartido, puedes **reemplazarlo** con `git commit --amend` en vez de crear otro commit.',
    goals: {
      message: 'El mensaje del último commit debe ser "Add {feature} feature"',
      included: 'El último commit debe incluir `tests/{feature}.test.js`',
      replaced: 'Reemplaza el commit en vez de agregar uno nuevo',
    },
    hints: [
      'Primero agrega el archivo olvidado con `git add`.',
      '`git commit --amend -m "nuevo mensaje"` reescribe el último commit con lo que esté en staging y el mensaje nuevo.',
      'Fíjate en el gráfico: el commit antiguo queda inalcanzable y uno nuevo (con otro hash) toma su lugar.',
    ],
  },
  discard: {
    title: 'Descartar y sacar del staging',
    summary: 'Bota un cambio roto y saca un archivo del staging area.',
    description:
      'Salieron mal dos cosas:\n\n' +
      '- Rompiste `{broken}` y lo quieres exactamente como en el último commit.\n' +
      '- Agregaste `config.json` al staging por error. Quieres conservar el cambio (puerto 3000), pero **no** tenerlo en staging.\n\n' +
      '`git restore` resuelve ambas: por defecto restaura archivos del directorio de trabajo; con `--staged` solo los saca del staging.',
    goals: {
      discarded: 'Restaura `{broken}` a su última versión commiteada',
      unstaged: 'Saca `config.json` del staging pero conserva el cambio en el archivo',
      noCommit: 'No crees commits',
    },
    hints: [
      '`git status` incluso te dice qué comandos usar.',
      '`git restore <archivo>` descarta los cambios del directorio de trabajo (ojo: se pierden).',
      '`git restore --staged <archivo>` lo saca del staging sin tocar su contenido.',
    ],
  },
  'find-commit': {
    title: 'Encuentra el commit culpable',
    summary: 'Lee el historial para descubrir qué commit introdujo un bug.',
    description:
      'Alguien dejó una línea `{needle}` en `src/core.js` y llegó a producción. Encuentra el commit que la introdujo y márcalo con el tag `{tag}` para que el equipo lo revise.\n\n' +
      'Herramientas útiles: `git log --oneline` (historial compacto), `git show <commit>` (qué cambió un commit) y `git log -S "texto"` (commits que agregaron o quitaron un texto).',
    goals: {
      tagged: 'Crea el tag `{tag}` en el commit que introdujo `{needle}`',
    },
    hints: [
      'Revisa cada commit con `git show <hash>` (haz clic en un commit del gráfico para pegar su hash).',
      '`git log -S "{needle}" --oneline` lista solo los commits donde ese texto apareció o desapareció.',
      'Luego `git tag {tag} <hash>`.',
    ],
  },
  'create-branch': {
    title: 'Trabaja en una rama',
    summary: 'Crea una rama, cámbiate a ella y haz un commit ahí.',
    description:
      'Vas a empezar la funcionalidad {feature} sin tocar `main`. Una **rama** es solo un puntero móvil a un commit: cuando haces commit en ella, avanza, y `main` se queda donde estaba.\n\n' +
      'Mira el gráfico: la etiqueta con "HEAD →" marca la rama en la que estás.',
    goals: {
      exists: 'Crea la rama `feature/{feature}`',
      onIt: 'Quédate en `feature/{feature}`',
      commit: 'Haz al menos un commit en esa rama',
      mainSame: '`main` no debe moverse',
    },
    hints: [
      '`git switch -c <nombre>` crea una rama y se cambia a ella (la forma clásica es `git checkout -b <nombre>`).',
      'Crea un archivo: `echo "export const {feature} = true;" > src/{feature}.js`, o usa el botón "Nuevo archivo".',
      'Luego `git add .` y `git commit -m "Start {feature}"`.',
    ],
  },
  'ff-merge': {
    title: 'Merge fast-forward',
    summary: 'Integra una rama cuando main no ha cambiado.',
    description:
      'La rama `feature/{feature}` tiene dos commits terminados, y `main` no ha cambiado desde que se creó la rama.\n\n' +
      'En ese caso `git merge` no necesita crear nada: solo mueve `main` hacia adelante hasta el mismo commit. Eso es un **fast-forward**. Después la rama de la funcionalidad ya no hace falta.',
    goals: {
      onMain: 'Quédate en `main`',
      merged: '`main` apunta al último commit de la funcionalidad (fast-forward)',
      deleted: 'Borra la rama `feature/{feature}`',
    },
    hints: [
      'Se integra HACIA la rama en la que estás, así que primero `git switch main`.',
      '`git merge feature/{feature}` — mira cómo la etiqueta `main` salta hacia adelante.',
      '`git branch -d <rama>` borra una rama que ya está integrada.',
    ],
  },
  'merge-commit': {
    title: 'Merge con commit de merge',
    summary: 'Une dos historiales que se separaron.',
    description:
      'Mientras trabajabas en `feature/{feature}`, alguien corrigió un error directamente en `main`. Ahora cada rama tiene commits que la otra no tiene.\n\n' +
      'Ya no es posible un fast-forward, así que `git merge` crea un **commit de merge** con dos padres que une ambas líneas del historial.',
    goals: {
      onMain: 'Quédate en `main`',
      mergeCommit: 'Crea un commit de merge en `main` que incluya la funcionalidad',
      both: '`main` contiene la funcionalidad y la corrección del README',
    },
    hints: [
      'Cámbiate primero a `main`.',
      '`git merge feature/{feature}` — esta vez git crea un commit nuevo.',
      'Mira `git log --oneline --graph` para ver cómo se juntan las dos líneas.',
    ],
  },
  'merge-conflict': {
    title: 'Tu primer conflicto',
    summary: 'Ambas ramas cambiaron las mismas líneas: resuélvelo a mano.',
    description:
      'En `main` alguien agregó a {a} en `TEAM.md`, y en `feature/team` alguien agregó a {b} en el mismo lugar. git no puede decidir qué línea va primero, así que el merge produce un **conflicto**.\n\n' +
      'El archivo tendrá marcadores:\n\n' +
      '- `<<<<<<< HEAD` empieza tu versión (main)\n- `=======` separa ambas versiones\n- `>>>>>>> feature/team` termina la otra versión\n\n' +
      'Edita el archivo dejando ambos nombres, borra los marcadores, márcalo como resuelto con `git add` y termina con `git commit`.',
    goals: {
      merged: 'Integra `feature/team` en `main` (commit de merge)',
      noMarkers: '`TEAM.md` no tiene marcadores de conflicto',
      both: 'El equipo incluye a {a} y a {b}',
      finished: 'El merge está terminado',
    },
    hints: [
      'Ejecuta `git merge feature/team` y lee `git status`.',
      'Haz clic en `TEAM.md` en el panel Archivos (o ejecuta `nano TEAM.md`) y deja solo la lista: Ana, {a}, {b}.',
      '`git add TEAM.md` lo marca como resuelto; `git commit` (sin -m usa el mensaje de merge por defecto) termina.',
    ],
  },
  'conflict-sides': {
    title: 'Elige un lado por archivo',
    summary: 'Resuelve conflictos con --ours y --theirs, sin editar.',
    description:
      'Integrar `redesign` en `main` genera conflictos en dos archivos. Ya sabes lo que quieres:\n\n' +
      '- `config.json`: quedarte con la versión de **main** (puerto de producción 80)\n- `styles.css`: quedarte con la versión de **redesign**\n\n' +
      'Cuando quieres un archivo completo de un lado, `git checkout --ours <archivo>` (tu rama actual) o `git checkout --theirs <archivo>` (la rama que estás integrando) te ahorra editar marcadores.',
    goals: {
      merged: 'Integra `redesign` en `main`',
      ours: '`config.json` mantiene la versión de main',
      theirs: '`styles.css` toma la versión de redesign ({color})',
      finished: 'El merge está terminado',
    },
    hints: [
      'Empieza con `git merge redesign`.',
      'Durante un merge, "ours" = la rama en la que estás (main) y "theirs" = la que estás integrando.',
      'Después de elegir: `git add config.json styles.css` y `git commit --no-edit`.',
    ],
  },
  'detached-rescue': {
    title: 'Rescata commits de un HEAD desacoplado',
    summary: 'No pierdas trabajo que hiciste sin una rama.',
    description:
      'Te moviste a un commit antiguo para probar una idea y, sin darte cuenta, hiciste dos commits ahí. HEAD está **desacoplado** (detached): apunta a un commit, no a una rama. Si te cambias a `main` ahora, nada apuntará a esos commits.\n\n' +
      'Guárdalos en una rama llamada `{name}` y vuelve a `main`.',
    goals: {
      saved: 'La rama `{name}` apunta al commit "Polish layout"',
      onMain: 'Vuelve a `main`',
    },
    hints: [
      '`git status` muestra "HEAD detached at…".',
      'Crear una rama donde estás guarda los commits: `git switch -c {name}` (o `git branch {name}`).',
      'Luego `git switch main`. Si te cambias primero, git te avisa de los commits que quedan atrás (y `git reflog` todavía te puede salvar).',
    ],
  },
  'undo-commit': {
    title: 'Deshaz el último commit',
    summary: 'Retrocede un commit pero conserva los cambios para seguir trabajando.',
    description:
      'Hiciste commit de "WIP {feature} (broken)" demasiado pronto. Quieres sacar ese commit del historial, pero conservar sus cambios en tus archivos para terminarlos.\n\n' +
      '`git reset` mueve la rama hacia atrás:\n\n' +
      '- `--soft`: los cambios quedan en staging\n- `--mixed` (por defecto): los cambios quedan en tus archivos, fuera del staging\n- `--hard`: los cambios se descartan (peligroso)',
    goals: {
      moved: '`main` apunta al commit anterior',
      kept: 'El trabajo del commit deshecho sigue en `src/{feature}.js`',
    },
    hints: [
      '`HEAD~1` significa "el padre de HEAD".',
      '`git reset HEAD~1` (mixed) o `git reset --soft HEAD~1` conservan tus cambios.',
      'Evita `--hard` aquí: borraría el trabajo.',
    ],
  },
  'revert-pushed': {
    title: 'Deshaz un commit que ya subiste',
    summary: 'Usa revert para deshacer sin reescribir historia compartida.',
    description:
      'El commit "Change price calculation" rompió los precios, y ya está en `origin` — tu equipo puede tenerlo. Reescribir la historia (reset) causaría problemas a todos.\n\n' +
      '`git revert <commit>` crea un commit **nuevo** que hace lo contrario del commit malo. El historial queda intacto y puedes hacer push normalmente.',
    goals: {
      undone: '`src/price.js` vuelve al cálculo correcto (`n * 1.19`)',
      history: 'El historial no se reescribe (los commits posteriores se mantienen)',
      pushed: 'Sube la corrección a `origin`',
    },
    hints: [
      'Busca el hash del commit malo con `git log --oneline`.',
      '`git revert <hash> --no-edit` crea el commit inverso con un mensaje automático.',
      'Termina con `git push`.',
    ],
  },
  'reflog-reset': {
    title: 'Recupérate de un reset --hard',
    summary: 'Usa el reflog para traer de vuelta commits "perdidos".',
    description:
      'Ups: alguien ejecutó `git reset --hard HEAD~{n}` y los últimos commits de {feature} desaparecieron de `main`.\n\n' +
      '¡No están borrados! git registra cada posición por la que pasó HEAD en el **reflog**. Activa "Ver commits inalcanzables" en el gráfico para verlos.',
    goals: {
      recovered: '`main` vuelve a apuntar al último commit ("Add {feature} tests")',
      files: 'El archivo de tests vuelve a estar en tu directorio de trabajo',
    },
    hints: [
      '`git reflog` lista por dónde pasó HEAD: `HEAD@{0}` es ahora, `HEAD@{1}` la posición anterior…',
      'Busca la entrada justo antes del reset.',
      '`git reset --hard HEAD@{1}` (o el hash) devuelve `main` ahí.',
    ],
  },
  'recover-branch': {
    title: 'Recupera una rama borrada',
    summary: 'Trae de vuelta una rama borrada con -D.',
    description:
      'Borraste `feature/{feature}` con `git branch -D`, pero tenía trabajo sin integrar ("Finish {feature}").\n\n' +
      'Una rama es solo un puntero: los commits siguen existiendo. Busca el hash de su último commit en el reflog y vuelve a crear la rama ahí.',
    goals: {
      restored: '`feature/{feature}` existe de nuevo y apunta a "Finish {feature}"',
    },
    hints: [
      '`git reflog` también muestra los commits que hiciste mientras estabas en esa rama.',
      'Busca "commit: Finish {feature}" y copia su hash.',
      '`git branch feature/{feature} <hash>`.',
    ],
  },
  'cherry-pick-fix': {
    title: 'Trae solo un commit',
    summary: 'Copia una corrección específica de otra rama con cherry-pick.',
    description:
      'En `develop` hay una corrección de un error de tipeo ("Fix typo in header") mezclada con experimentos que no están listos. Necesitas **solo la corrección** en `main`.\n\n' +
      '`git cherry-pick <commit>` copia los cambios de ese commit como un commit nuevo en la rama actual.',
    goals: {
      hasFix: '`main` tiene la corrección (`Welcome`)',
      noExperiments: '`main` no recibe los experimentos de {feature}',
      developSame: '`develop` queda tal como está',
    },
    hints: [
      'Mira los commits de develop con `git log --oneline develop`.',
      'Asegúrate de estar en `main`.',
      '`git cherry-pick <hash de la corrección>`.',
    ],
  },
  'rebase-feature': {
    title: 'Actualiza tu rama con rebase',
    summary: 'Mueve tus commits encima del último main para un historial lineal.',
    description:
      '`main` recibió dos commits nuevos después de que creaste `feature/{feature}`. En vez de un commit de merge, quieres que tus dos commits queden **encima** del `main` actual, como si hubieras empezado hoy.\n\n' +
      '`git rebase main` reaplica tus commits uno por uno sobre `main`. Son commits **nuevos** (hashes nuevos) — activa "Ver commits inalcanzables" para ver los originales.',
    goals: {
      onTop: 'La rama parte desde el `main` actual',
      linear: 'Sus 2 commits quedan encima, sin commits de merge',
      mainSame: '`main` no cambia',
    },
    hints: [
      'Debes estar en la rama que quieres mover (ya estás ahí).',
      '`git rebase main`.',
      'Compara `git log --oneline --graph --all` antes y después.',
    ],
  },
  'rebase-conflict': {
    title: 'Conflicto durante un rebase',
    summary: 'Resuelve un conflicto mientras se reaplican commits y continúa.',
    description:
      '`feature/slow-network` subió el `timeout` y `main` subió los `retries`, en líneas vecinas de `src/config.js`. El rebase se detendrá con un conflicto.\n\n' +
      'El flujo es: arreglar el archivo → `git add` → `git rebase --continue`. Siempre puedes escapar con `git rebase --abort`.\n\n' +
      '**Ojo:** durante un rebase "HEAD"/"ours" es `main` (la base) y "theirs" es tu commit.',
    goals: {
      onTop: 'La rama queda encima de `main`',
      linear: 'Mantiene un solo commit, sin merges',
      both: '`src/config.js` tiene `timeout: {timeout}` y `retries: {retries}`, sin marcadores',
      finished: 'El rebase terminó y estás en la rama',
    },
    hints: [
      'Empieza con `git rebase main` y lee el mensaje.',
      'Edita `src/config.js`: conserva ambos valores nuevos y quita los marcadores.',
      '`git add src/config.js` y luego `git rebase --continue`.',
    ],
  },
  squash: {
    title: 'Fusiona tus commits (squash)',
    summary: 'Convierte varios commits desordenados en uno solo y limpio.',
    description:
      'Tu rama tiene cuatro commits ("WIP", "more work", "fix typo", "done!!"). Antes de abrir un pull request quieres un solo commit llamado "Add {feature}".\n\n' +
      'Dos formas clásicas:\n\n' +
      '- `git rebase -i main` y marcar commits como `squash`/`fixup`\n- `git reset --soft main` (deja todos los cambios en staging) y un `git commit` nuevo',
    goals: {
      single: 'Exactamente un commit encima de `main`',
      message: 'Su mensaje es "Add {feature}"',
      content: 'El contenido final es el mismo de antes',
      finished: 'No hay operaciones en curso',
    },
    hints: [
      'Con reset: `git reset --soft main` deja todo el trabajo en staging.',
      'Luego `git commit -m "Add {feature}"`.',
      'Con rebase: `git rebase -i main`, deja el primero como reword y el resto como fixup.',
    ],
  },
  'rebase-interactive': {
    title: 'Ordena con rebase interactivo',
    summary: 'Elimina un commit y corrige un mensaje con rebase -i.',
    description:
      'Antes de compartir `feature/{feature}` quieres ordenarla:\n\n' +
      '- El commit "Add debug logs" debe desaparecer.\n- El commit "Add {feature} veiw" tiene un error de tipeo: debería decir "Add {feature} view".\n\n' +
      '`git rebase -i <base>` abre una lista de tareas donde cada commit recibe una acción: `pick` (mantener), `reword` (cambiar mensaje), `drop` (eliminar), `squash`/`fixup` (fusionar)…',
    goals: {
      dropped: '"Add debug logs" (y `debug.log`) ya no existe',
      reworded: 'El mensaje ahora dice "Add {feature} view"',
      count: 'Quedan 2 commits encima de `main`',
      finished: 'El rebase terminó y estás en la rama',
    },
    hints: [
      '`git rebase -i main` (o `HEAD~3`).',
      'En la ventana: elige "drop" para el commit de debug y "reword" para el último.',
      'Al continuar, escribe el nuevo mensaje "Add {feature} view".',
    ],
  },
  'move-commits': {
    title: 'Hice commit en main por error',
    summary: 'Mueve commits no subidos a una rama nueva y limpia main.',
    description:
      'Hiciste dos commits del formulario de {feature} directamente en `main`, pero debían ir en `feature/{feature}`. Todavía no has hecho push (`origin/main` sigue en el primer commit).\n\n' +
      'Truco: una rama nueva creada aquí "guarda" los commits; después mueves `main` de vuelta a `origin/main`.',
    goals: {
      branch: '`feature/{feature}` contiene ambos commits',
      mainBack: '`main` vuelve a `origin/main`',
      onFeature: 'Terminas en `feature/{feature}` con el directorio de trabajo limpio',
    },
    hints: [
      '`git branch feature/{feature}` crea la rama aquí sin cambiarte.',
      '`git reset --hard origin/main` devuelve `main` (los commits quedan a salvo en la rama nueva).',
      'Finalmente `git switch feature/{feature}`.',
    ],
  },
  'first-push': {
    title: 'Publica una rama nueva',
    summary: 'Sube una rama por primera vez y configura su upstream.',
    description:
      'Tu rama `feature/{feature}` solo existe en tu computador. Para compartirla, súbela al remoto `origin`.\n\n' +
      'La primera vez git no sabe a dónde enviarla. `-u` (`--set-upstream`) vincula tu rama con `origin/feature/{feature}`, así después basta con `git push` / `git pull`.',
    goals: {
      pushed: '`origin` tiene `feature/{feature}` con tus commits',
      upstream: 'La rama sigue a `origin/feature/{feature}`',
    },
    hints: [
      'Prueba primero `git push` y lee el error: te dice el comando.',
      '`git push -u origin feature/{feature}`.',
      'El gráfico del remoto muestra la rama nueva en origin.',
    ],
  },
  'pull-rebase': {
    title: 'Push rechazado',
    summary: 'Integra el trabajo de un compañero antes de subir el tuyo.',
    description:
      'Hiciste un commit en `main`, pero {mate} ya subió "Add CI pipeline" a `origin/main`. Si intentas hacer push, git lo **rechaza**: el remoto tiene trabajo que tú no tienes.\n\n' +
      'La solución típica: descargarlo y poner tus commits encima con `git pull --rebase`, y luego `git push`. (Un `git pull` simple te pedirá elegir entre merge y rebase.)',
    goals: {
      integrated: 'Tienes el commit de {mate} (`.github/ci.yml`)',
      linear: 'El historial se mantiene lineal (sin commit de merge)',
      pushed: '`origin/main` tiene tu commit',
    },
    hints: [
      'Prueba `git push` y lee por qué falla.',
      '`git pull --rebase` descarga y reaplica tu commit encima.',
      'Después `git push`.',
    ],
  },
  'stash-hotfix': {
    title: 'Corrección urgente con stash',
    summary: 'Guarda trabajo a medias, arregla algo en main y vuelve.',
    description:
      'Estás a mitad de `src/{feature}.js` (sin commit) cuando reportan un error de tipeo en producción: `src/header.html` dice "Welcom".\n\n' +
      '`git stash` guarda tus cambios a medias y limpia el directorio de trabajo para que puedas cambiar de rama. Después `git stash pop` los trae de vuelta.',
    goals: {
      fixed: 'Hay un commit nuevo en `main` que lo corrige a "Welcome"',
      back: 'Vuelves a `feature/{feature}`',
      wip: 'Tu trabajo a medias en `src/{feature}.js` está de vuelta',
      stashEmpty: 'El stash queda vacío',
    },
    hints: [
      '`git stash` y luego `git switch main`.',
      'Arregla el archivo (`echo "<h1>Welcome</h1>" > src/header.html`) y `git commit -am "Fix welcome typo"`.',
      '`git switch feature/{feature}` y `git stash pop`.',
    ],
  },
  'tag-release': {
    title: 'Etiqueta una versión',
    summary: 'Crea un tag anotado en un commit pasado y publícalo.',
    description:
      'La versión {version} fue el commit "Release {version}", pero nadie la etiquetó. Los tags marcan puntos importantes del historial, como las versiones publicadas.\n\n' +
      '- Tag liviano: `git tag nombre`\n- Tag anotado (con mensaje y autor, recomendado para versiones): `git tag -a nombre -m "mensaje"`\n\n' +
      'Los tags no se envían con un `git push` normal: tienes que subirlos explícitamente.',
    goals: {
      tag: 'Tag anotado `v{version}` en el commit "Release {version}"',
      pushed: 'El tag existe en `origin`',
    },
    hints: [
      'Busca el commit con `git log --oneline`.',
      '`git tag -a v{version} <hash> -m "Version {version}"`.',
      '`git push origin v{version}` (o `git push --tags`).',
    ],
  },
  'sync-before-pr': {
    title: 'Sincroniza tu rama antes del PR',
    summary: 'Haz rebase sobre el último origin/main y sube de forma segura.',
    description:
      'Tu rama `feature/{feature}` ya está en `origin`, pero mientras tanto {mate} integró dos commits en `origin/main`. Antes de abrir el pull request quieres tu rama encima del último `main`.\n\n' +
      '- `git fetch` descarga las novedades (solo actualiza `origin/main`).\n' +
      '- `git rebase origin/main` mueve tus commits encima.\n' +
      '- El rebase reescribió commits que ya habías subido, así que un push normal es rechazado: usa `git push --force-with-lease`, que solo sobrescribe si nadie más subió cambios a tu rama.',
    goals: {
      based: 'Tu rama parte desde el último `origin/main`',
      linear: 'Tus 2 commits quedan encima, sin merges',
      pushed: '`origin/feature/{feature}` está actualizada',
    },
    hints: [
      'Primero `git fetch` — tu repositorio aún no conoce los commits nuevos.',
      '`git rebase origin/main`.',
      '`git push --force-with-lease`.',
    ],
  },
};
