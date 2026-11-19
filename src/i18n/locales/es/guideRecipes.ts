import type { GuideRecipe } from '../../../content/types';

export const guideRecipes: GuideRecipe[] = [
  {
    id: 'undo-last-commit-keep-changes',
    title: "Deshacer el último commit sin perder mis cambios",
    problem:
      "Acabas de hacer un commit y te diste cuenta de que fue muy pronto: le falta algo, incluye archivos que no eran o deberían ser dos commits. Quieres echarlo atrás sin perder nada del trabajo que contiene.",
    category: 'undo',
    level: 1,
    steps: [
      {
        text: "Mira los últimos commits para saber exactamente qué vas a deshacer.",
        code: 'git log --oneline -3',
      },
      {
        text: "Mueve la rama un commit hacia atrás con `--soft`. El commit desaparece del historial, pero sus cambios quedan en el staging area, listos para volver a hacer commit.",
        code: 'git reset --soft HEAD~1',
      },
      {
        text: "Revisa el resultado: los archivos del commit deshecho aparecen ahora en \"Changes to be committed\".",
        code: 'git status',
      },
      {
        text: "Arregla lo que necesites (edita archivos, haz `git add` de lo que falte o `git restore --staged` de lo que sobre) y vuelve a hacer commit.",
        code: 'git commit -m "Add login form validation"',
      },
    ],
    notes: [
      "`HEAD~1` significa \"el commit anterior a HEAD\". `HEAD~3` desharía los últimos tres commits de una vez.",
      "`git reset HEAD~1` (igual que `--mixed`, la opción por defecto) también conserva tus cambios, pero los saca del staging area: quedan en el directorio de trabajo como modificaciones normales.",
      "`git reset --hard HEAD~1` **bota los cambios**. Úsalo solo si de verdad quieres perder ese trabajo (aun así, `git reflog` normalmente puede recuperar el commit).",
      "Si ya hiciste push del commit, no uses reset: otras personas pueden tenerlo. Usa `git revert` (mira \"Deshacer un commit que ya subí\").",
      "Si solo quieres corregir el mensaje o agregar un archivo olvidado, `git commit --amend` es más simple.",
    ],
    related: ['reset', 'commit-amend', 'reflog', 'revert', 'log', 'status'],
    keywords: ['deshacer commit', 'quitar commit', 'reset soft', 'último commit', 'echar atrás commit', 'HEAD~1'],
  },
  {
    id: 'change-last-commit-message',
    title: "Cambiar el mensaje de mi último commit",
    problem:
      "Te equivocaste al escribir el mensaje del último commit, o no describe bien el cambio, y todavía no has hecho push.",
    category: 'rewriting',
    level: 1,
    steps: [
      {
        text: "Asegúrate de no tener nada en el staging area que no quieras en ese commit: `--amend` también incluye lo que esté en el staging area en ese momento.",
        code: 'git status',
      },
      {
        text: "Reescribe el mensaje. `--amend` reemplaza el último commit por uno nuevo con los mismos cambios y el mensaje nuevo.",
        code: 'git commit --amend -m "Fix login redirect after logout"',
      },
      {
        text: "Revisa el resultado.",
        code: 'git log --oneline -3',
      },
    ],
    notes: [
      "Sin `-m`, `git commit --amend` abre tu editor con el mensaje anterior para que lo modifiques.",
      "Hacer amend crea un commit nuevo con otro hash. Si ya habías hecho push, necesitarías `git push --force-with-lease`, y eso solo está bien en una rama que nadie más usa.",
      "Para cambiar el mensaje de un commit más antiguo, usa `git rebase -i HEAD~3` (ajusta el número) y cambia `pick` por `reword` en la línea de ese commit.",
    ],
    related: ['commit-amend', 'commit', 'rebase-interactive', 'push', 'log'],
    keywords: ['mensaje de commit', 'error de tipeo', 'reword', 'amend', 'editar mensaje', 'corregir commit'],
  },
  {
    id: 'add-file-to-last-commit',
    title: "Agregar un archivo olvidado a mi último commit",
    problem:
      "Hiciste commit y después notaste que se te olvidó un archivo (o un arreglo chico). Prefieres que quede dentro de ese mismo commit en vez de hacer otro commit tipo \"ups\".",
    category: 'rewriting',
    level: 1,
    steps: [
      {
        text: "Agrega al staging area el archivo olvidado (o el arreglo extra).",
        code: 'git add src/app.js',
      },
      {
        text: "Modifica el último commit. `--no-edit` mantiene el mensaje que ya tenía.",
        code: 'git commit --amend --no-edit',
      },
      {
        text: "Verifica que el commit ahora incluye el archivo.",
        code: 'git show --stat HEAD',
      },
    ],
    notes: [
      "La regla de siempre con `--amend`: solo modifica commits que no has subido, o que están en una rama que usas solo tú (en ese caso, sube con `git push --force-with-lease`).",
      "¿Incluiste un archivo nuevo por error? `git rm --cached <archivo>` y luego `git commit --amend --no-edit` lo saca del commit y lo deja en tu disco.",
      "Omite `--no-edit` si además quieres cambiar el mensaje.",
    ],
    related: ['commit-amend', 'add', 'show', 'rm', 'push'],
    keywords: ['archivo olvidado', 'amend', 'agregar al commit', 'falta un archivo', 'corregir último commit', 'no-edit'],
  },
  {
    id: 'discard-local-changes',
    title: "Descartar mis cambios locales",
    problem:
      "Editaste algunos archivos y quieres dejarlos exactamente como estaban en el último commit, ya sea un solo archivo o todo el proyecto.",
    category: 'undo',
    level: 1,
    steps: [
      {
        text: "Mira qué cambió antes de botar cualquier cosa.",
        code: 'git status',
      },
      {
        text: "Descarta los cambios no agregados al staging area de un archivo. Vuelve a la versión del staging area (que es la del último commit, si no agregaste nada).",
        code: 'git restore src/app.js',
      },
      {
        text: "Si el archivo también estaba en el staging area, restaura ambos (staging area y directorio de trabajo) desde el último commit.",
        code: 'git restore --staged --worktree src/app.js',
      },
      {
        text: "Para descartar todos los cambios (en el staging area o no) de todos los archivos versionados, úsalo con `.` desde la raíz del proyecto.",
        code: 'git restore --staged --worktree .',
      },
      {
        text: "Los archivos sin seguimiento (untracked: archivos nuevos que git nunca ha visto) no se tocan con `restore`. Primero revisa qué se borraría…",
        code: 'git clean -n',
      },
      {
        text: "…y después bórralos de verdad. `-d` también elimina carpetas sin seguimiento.",
        code: 'git clean -fd',
      },
    ],
    notes: [
      "**Esto no se puede deshacer.** Los cambios descartados nunca estuvieron en un commit, así que ni `git reflog` puede recuperarlos. Si tienes dudas, usa `git stash`: guarda los cambios para que puedas recuperarlos después.",
      "Equivalentes antiguos que verás en tutoriales: `git checkout -- src/app.js` para un archivo, y `git reset --hard` para dejar todos los archivos versionados (en el staging area o no) como en el último commit.",
      "`git clean -fdx` también borra los archivos ignorados (como `node_modules` o lo generado por el build). Úsalo con cuidado.",
    ],
    related: ['restore', 'clean', 'stash', 'status', 'checkout', 'reset'],
    keywords: ['descartar cambios', 'deshacer ediciones', 'restaurar archivo', 'botar cambios', 'archivos sin seguimiento', 'limpiar directorio'],
  },
  {
    id: 'unstage-file',
    title: "Sacar un archivo del staging area (deshacer git add)",
    problem:
      "Hiciste `git add` de un archivo que no quieres en el próximo commit. Quieres sacarlo del staging area sin perder lo que editaste.",
    category: 'undo',
    level: 1,
    steps: [
      {
        text: "Revisa qué hay en el staging area (\"Changes to be committed\").",
        code: 'git status',
      },
      {
        text: "Saca el archivo del staging area. Tus cambios siguen en el directorio de trabajo, intactos.",
        code: 'git restore --staged src/app.js',
      },
      {
        text: "O saca todo de una vez.",
        code: 'git restore --staged .',
      },
      {
        text: "Confirma: el archivo aparece ahora en \"Changes not staged for commit\" (o en \"Untracked files\" si es nuevo).",
        code: 'git status',
      },
    ],
    notes: [
      "Equivalente antiguo: `git reset HEAD src/app.js` (o solo `git reset` para sacar todo). Lo vas a encontrar en muchas respuestas antiguas en internet.",
      "`git rm --cached <archivo>` es distinto: deja en el staging area la **eliminación** del archivo del repositorio (git deja de seguirlo), pero lo conserva en tu disco. Sirve para archivos que debieron estar en `.gitignore`.",
      "En un repositorio recién creado, sin ningún commit, `git restore --staged` falla porque todavía no existe HEAD; usa `git rm --cached <archivo>`.",
    ],
    related: ['restore', 'reset', 'add', 'status', 'rm'],
    keywords: ['unstage', 'deshacer add', 'sacar del staging', 'staging area', 'index', 'git add por error'],
  },
  {
    id: 'resolve-merge-conflict',
    title: "Resolver un conflicto de merge",
    problem:
      "Hiciste `git merge` y git se detuvo con \"CONFLICT (content): Merge conflict in src/app.js\". Las dos ramas cambiaron las mismas líneas, así que git necesita que tú decidas cómo debe quedar la versión final.",
    category: 'branching',
    level: 2,
    steps: [
      {
        text: "Este es el merge que se detuvo: estás en `main` y le estás haciendo merge de `feature/login`.",
        code: 'git merge feature/login',
      },
      {
        text: "Lista los archivos en conflicto: aparecen en \"Unmerged paths\" marcados como \"both modified\".",
        code: 'git status',
      },
      {
        text: "Abre cada archivo en conflicto en tu editor y busca los marcadores de conflicto. Por ejemplo, `src/app.js` podría tener estas líneas:\n\n- `<<<<<<< HEAD`\n- `const timeout = 30;`\n- `=======`\n- `const timeout = 60;`\n- `>>>>>>> feature/login`\n\nEntre `<<<<<<<` y `=======` está la versión de tu rama actual (HEAD, aquí `main`). Entre `=======` y `>>>>>>>` está la versión de la rama que estás integrando (`feature/login`).",
      },
      {
        text: "Edita el archivo hasta dejarlo como debe quedar: con un lado, con el otro o con una mezcla de ambos, y **borra las tres líneas de marcadores**. En el ejemplo, si lo correcto es 60, solo queda `const timeout = 60;`.",
      },
      {
        text: "Marca el archivo como resuelto agregándolo al staging area. Repite editar + `git add` con cada archivo en conflicto.",
        code: 'git add src/app.js',
      },
      {
        text: "Cuando `git status` ya no muestre unmerged paths, termina el merge. Git crea el merge commit con un mensaje ya escrito (guarda y cierra el editor).",
        code: 'git merge --continue',
      },
    ],
    notes: [
      "`git commit` también sirve para terminar el merge; `git merge --continue` solo verifica primero que haya un merge en curso.",
      "¿Quieres un lado completo del archivo sin editarlo a mano? `git checkout --ours src/app.js` deja la versión de tu rama actual y `git checkout --theirs src/app.js` deja la versión de la rama que llega. Después haz `git add`. Equivalente moderno: `git restore --ours` / `git restore --theirs`.",
      "En un merge, **ours** = la rama en la que estás (HEAD) y **theirs** = la rama que pusiste en `git merge`. En un rebase es al revés (mira \"Resolver un conflicto durante un rebase\").",
      "Antes de hacer `git add`, `git diff --check` te avisa si quedaron marcadores de conflicto sin borrar.",
      "Editores como VS Code muestran botones (Accept Current / Accept Incoming / Accept Both) sobre los marcadores. Solo editan el texto por ti: igual tienes que hacer `git add` y terminar el merge.",
      "¿Quieres ver también la versión original en común? `git config --global merge.conflictStyle zdiff3` agrega una sección `|||||||` con la versión base entre los dos lados.",
      "¿Te perdiste? `git merge --abort` deja todo como estaba antes del merge.",
    ],
    related: ['merge', 'status', 'add', 'diff', 'commit', 'checkout', 'restore'],
    keywords: ['conflicto de merge', 'marcadores de conflicto', 'resolver conflicto', 'both modified', 'unmerged paths', 'ours theirs', 'CONFLICT'],
  },
  {
    id: 'resolve-rebase-conflict',
    title: "Resolver un conflicto durante un rebase",
    problem:
      "Estás haciendo rebase de `feature/login` sobre `main` y git se detuvo con \"CONFLICT\" y \"Could not apply a1b2c3d... Add login form\". Un rebase vuelve a aplicar tus commits uno por uno, así que puede detenerse en cada commit que choque.",
    category: 'rewriting',
    level: 2,
    steps: [
      {
        text: "Este es el rebase que se detuvo: estás en `feature/login`, reaplicando sus commits encima de `main`.",
        code: 'git rebase main',
      },
      {
        text: "Mira dónde estás: `git status` te dice qué commit se está aplicando y qué archivos tienen conflicto.",
        code: 'git status',
      },
      {
        text: "Abre el archivo en conflicto. **Ojo: los lados están invertidos respecto a un merge.** Durante un rebase, HEAD es la nueva base que se está construyendo (`main` más tus commits ya reaplicados), no tu rama. En `src/app.js` podrías ver:\n\n- `<<<<<<< HEAD`\n- `const timeout = 60;` (lo que ya está en `main`)\n- `=======`\n- `const timeout = 30;` (de tu commit que se está reaplicando)\n- `>>>>>>> a1b2c3d (Add login form)`",
      },
      {
        text: "Edita el archivo hasta su versión final, borra todas las líneas de marcadores y agrégalo al staging area para marcarlo como resuelto.",
        code: 'git add src/app.js',
      },
      {
        text: "Continúa el rebase. Git aplica los commits que faltan y puede detenerse otra vez en otro conflicto: repite los pasos anteriores cada vez.",
        code: 'git rebase --continue',
      },
      {
        text: "Cuando termine, revisa el historial: tus commits ahora están encima de `main`.",
        code: 'git log --oneline --graph -5',
      },
    ],
    notes: [
      "**ours/theirs están invertidos en un rebase:** `git checkout --ours src/app.js` toma la versión de la rama sobre la que haces rebase (`main`), y `git checkout --theirs src/app.js` toma la versión de **tu** commit. Parece al revés porque un rebase parte desde `main` y reaplica tus commits encima.",
      "Aquí no necesitas `git commit`: `git add` + `git rebase --continue` crea el commit por ti. Puede que se abra tu editor para ajustar el mensaje; guarda y ciérralo para seguir.",
      "Si después de resolver el commit queda vacío (por ejemplo, te quedaste completamente con la versión de `main`), git te lo dice; usa `git rebase --skip` para saltarte ese commit.",
      "`git rebase --abort` deja tu rama exactamente como estaba antes de empezar el rebase.",
      "Si la rama ya estaba subida, después del rebase vas a necesitar `git push --force-with-lease`.",
      "¿Resuelves los mismos conflictos una y otra vez? `git config --global rerere.enabled true` hace que git recuerde cómo los resolviste y lo repita.",
    ],
    related: ['rebase', 'status', 'add', 'checkout', 'log', 'push', 'rebase-interactive'],
    keywords: ['conflicto en rebase', 'continuar rebase', 'could not apply', 'ours theirs invertidos', 'rebase --continue', 'rebase --skip'],
  },
  {
    id: 'abort-merge-or-rebase',
    title: "Cancelar un merge o rebase que salió mal",
    problem:
      "Estás en medio de un merge, rebase o cherry-pick lleno de conflictos y solo quieres salir y volver a como estaba todo antes de empezar.",
    category: 'undo',
    level: 1,
    steps: [
      {
        text: "Averigua qué está en curso. `git status` dice \"You have unmerged paths\" (merge), \"You are currently rebasing\" (rebase) o \"You are currently cherry-picking\" (cherry-pick).",
        code: 'git status',
      },
      {
        text: "Cancelar un merge: la rama y los archivos vuelven a como estaban antes de `git merge`.",
        code: 'git merge --abort',
      },
      {
        text: "Cancelar un rebase: la rama vuelve a donde estaba antes de `git rebase`, como si nada hubiera pasado.",
        code: 'git rebase --abort',
      },
      {
        text: "Cancelar un cherry-pick, de la misma forma.",
        code: 'git cherry-pick --abort',
      },
    ],
    notes: [
      "Ejecuta solo el comando que corresponde a lo que está en curso; los otros solo muestran un error como \"There is no merge to abort\".",
      "`--abort` descarta las resoluciones de conflicto que llevabas en esa operación. Los cambios sin commit que tenías **antes** de empezar un merge podrían no recuperarse bien; por eso conviene hacer commit o stash antes de un merge.",
      "¿El merge ya terminó (el merge commit existe)? `--abort` ya no sirve. Si no lo has subido, `git reset --hard ORIG_HEAD` lo deshace; si ya lo subiste, usa `git revert -m 1 <hash-del-merge>`.",
      "¿El rebase ya terminó y te arrepentiste? Usa `git reset --hard ORIG_HEAD` justo después, o busca la posición anterior en `git reflog` y haz `git reset --hard <hash>`.",
    ],
    related: ['merge', 'rebase', 'cherry-pick', 'status', 'reset', 'reflog', 'revert'],
    keywords: ['abortar merge', 'cancelar rebase', 'deshacer merge', 'salir', 'merge --abort', 'rebase --abort', 'pánico'],
  },
  {
    id: 'update-branch-with-main',
    title: "Actualizar mi rama con los últimos cambios de main",
    problem:
      "Estás trabajando en `feature/login` y `main` avanzó (tu equipo integró su trabajo). Quieres esos commits nuevos en tu rama. Hay dos formas de hacerlo: rebase (opción A) o merge (opción B).",
    category: 'branching',
    level: 2,
    steps: [
      {
        text: "Trae los últimos commits del remoto. Esto actualiza `origin/main` sin tocar tus archivos ni tus ramas.",
        code: 'git fetch origin',
      },
      {
        text: "Ve a tu rama de trabajo, con el directorio de trabajo limpio (antes haz commit o stash de lo pendiente).",
        code: 'git switch feature/login',
      },
      {
        text: "**Opción A, rebase:** reaplica tus commits encima del `main` más reciente. El historial queda en línea recta, como si hubieras creado tu rama hoy.",
        code: 'git rebase origin/main',
      },
      {
        text: "Opción A, continuación: si ya habías subido `feature/login`, el rebase reescribió sus commits, así que actualiza el remoto con un force push seguro.",
        code: 'git push --force-with-lease',
      },
      {
        text: "**Opción B, merge:** trae `main` a tu rama con un merge commit. No se reescribe nada.",
        code: 'git merge origin/main',
      },
      {
        text: "Opción B, continuación: haz push como siempre, sin forzar.",
        code: 'git push',
      },
    ],
    notes: [
      "**Elige rebase** cuando la rama es solo tuya (nadie más hace commits en ella): obtienes un historial limpio y lineal, y un PR más fácil de revisar. Es lo habitual antes de abrir un PR.",
      "**Elige merge** cuando otras personas comparten la rama, o no quieres reescribir commits que ya subiste: siempre es seguro, a cambio de commits extra del tipo \"Merge remote-tracking branch 'origin/main'\".",
      "En ambos casos puede haber conflictos. Resuélvelos como se explica en \"Resolver un conflicto durante un rebase\" o \"Resolver un conflicto de merge\".",
      "¿Por qué `origin/main` y no `main`? Tu `main` local está tan actualizado como la última vez que hiciste pull, en cambio `git fetch` acaba de actualizar `origin/main`. Ni siquiera necesitas cambiarte a `main`.",
      "El camino largo también funciona: `git switch main`, `git pull`, `git switch feature/login` y luego `git rebase main` (o `git merge main`).",
      "Atajo: `git pull --rebase origin main` hace el fetch y el rebase en un solo comando.",
    ],
    related: ['fetch', 'rebase', 'merge', 'pull', 'push', 'switch'],
    keywords: ['actualizar rama', 'sincronizar con main', 'rebase sobre main', 'merge de main', 'rama desactualizada', 'atrasada respecto a main'],
  },
  {
    id: 'squash-commits',
    title: "Juntar varios commits en uno (squash)",
    problem:
      "Tu rama `feature/login` tiene una serie desordenada de commits (\"wip\", \"fix typo\", \"fix again\") y quieres combinarlos en un solo commit limpio antes de compartirla.",
    category: 'rewriting',
    level: 3,
    steps: [
      {
        text: "Mira los últimos commits y cuenta cuántos van juntos. En este ejemplo, los últimos 3.",
        code: 'git log --oneline -5',
      },
      {
        text: "Inicia un rebase interactivo sobre esos 3 commits.",
        code: 'git rebase -i HEAD~3',
      },
      {
        text: "Se abre tu editor con una línea por commit, **del más antiguo al más nuevo**. Deja `pick` en la primera línea y cambia `pick` por `squash` (o solo `s`) en las demás:\n\n- `pick a1b2c3d Add login form`\n- `squash d4e5f6a wip`\n- `squash 789abcd fix typo`\n\nGuarda y cierra el editor.",
      },
      {
        text: "Git abre el editor otra vez con todos los mensajes juntos. Escribe el mensaje final (por ejemplo `Add login form`), guarda y cierra.",
      },
      {
        text: "Revisa el resultado: un commit en vez de tres.",
        code: 'git log --oneline -3',
      },
      {
        text: "Si la rama ya estaba subida, sobrescríbela de forma segura.",
        code: 'git push --force-with-lease',
      },
    ],
    notes: [
      "Usa `fixup` (o `f`) en vez de `squash` para fusionar un commit con el anterior y **descartar su mensaje** sin preguntar.",
      "Alternativa sin editor: `git reset --soft HEAD~3` seguido de `git commit -m \"Add login form\"` convierte los últimos 3 commits en uno.",
      "Tip para la próxima: haz los arreglos con `git commit --fixup a1b2c3d`, y después `git rebase -i --autosquash main` ordena los squash por ti.",
      "Haz squash **antes** de compartir. Reescribir commits que otros ya descargaron los obliga a reparar sus copias.",
      "GitHub y plataformas similares también ofrecen \"Squash and merge\" en los pull requests, que junta toda la rama en un solo commit en `main`.",
      "¿Atrapado en Vim? Presiona `i` para editar, `Esc` al terminar, y luego escribe `:wq` y Enter para guardar y salir. Puedes cambiar de editor, por ejemplo con `git config --global core.editor \"code --wait\"`.",
      "Si algo sale mal a mitad del rebase, `git rebase --abort` te devuelve al punto de partida.",
    ],
    related: ['rebase-interactive', 'reset', 'commit', 'log', 'push', 'commit-amend'],
    keywords: ['squash', 'juntar commits', 'combinar commits', 'limpiar historial', 'fixup', 'rebase interactivo'],
  },
  {
    id: 'move-commits-to-new-branch',
    title: "Mover a una rama nueva los commits que hice en main",
    problem:
      "Se te olvidó crear una rama e hiciste un par de commits directamente en `main` (sin push todavía). Deberían estar en `feature/login`, y `main` debería volver a quedar igual que `origin/main`.",
    category: 'branching',
    level: 2,
    steps: [
      {
        text: "Con el directorio de trabajo limpio (haz commit o stash de lo pendiente), lista los commits que están en tu `main` pero no en `origin/main`.",
        code: 'git log --oneline origin/main..main',
      },
      {
        text: "Crea la rama nueva justo aquí, **sin cambiarte a ella**. Apunta a tu último commit, así que el trabajo ya está a salvo en `feature/login`.",
        code: 'git branch feature/login',
      },
      {
        text: "Devuelve `main` a donde está el remoto. `--hard` es seguro aquí porque los commits ya quedaron guardados en la rama nueva.",
        code: 'git reset --hard origin/main',
      },
      {
        text: "Cámbiate a la rama nueva y sigue trabajando.",
        code: 'git switch feature/login',
      },
      {
        text: "Verifica: `main` y `origin/main` apuntan al mismo commit, y tus commits están solo en `feature/login`.",
        code: 'git log --oneline --graph --all -6',
      },
    ],
    notes: [
      "¿No tienes remoto? En el paso 3 usa `git reset --hard HEAD~2` (2 = la cantidad de commits a mover).",
      "Si solo tienes cambios **sin commit** (todavía no hiciste commits), es aún más fácil: `git switch -c feature/login` se los lleva a la rama nueva.",
      "¿Los necesitas en una rama que **ya existe**? `git switch feature/login`, `git cherry-pick <hash>` por cada commit, y después vuelve a `main` y haz el reset como en el paso 3.",
      "Si ya subiste esos commits a `main`, no hagas reset: usa `git revert` en `main` y habla con tu equipo.",
    ],
    related: ['branch', 'reset', 'switch', 'cherry-pick', 'log', 'stash'],
    keywords: ['commit en rama equivocada', 'commit en main', 'mover commits', 'rama nueva', 'rama equivocada', 'olvidé crear la rama'],
  },
  {
    id: 'bring-commit-from-another-branch',
    title: "Traer un commit específico de otra rama",
    problem:
      "Un commit de otra rama (por ejemplo, un arreglo de un bug en `feature/login`) también se necesita en tu rama actual, pero no quieres hacer merge de la rama completa.",
    category: 'branching',
    level: 2,
    steps: [
      {
        text: "Busca el hash del commit que quieres.",
        code: 'git log --oneline feature/login',
      },
      {
        text: "Cámbiate a la rama que lo va a recibir.",
        code: 'git switch main',
      },
      {
        text: "Copia el commit a tu rama actual. Git crea un commit nuevo con los mismos cambios y el mismo mensaje (pero con otro hash).",
        code: 'git cherry-pick a1b2c3d',
      },
      {
        text: "Si hay un conflicto, resuelve el archivo como en un merge (edítalo, borra los marcadores) y agrégalo al staging area.",
        code: 'git add src/app.js',
      },
      {
        text: "Luego deja que el cherry-pick termine.",
        code: 'git cherry-pick --continue',
      },
      {
        text: "Verifica que el commit nuevo está ahí.",
        code: 'git log --oneline -3',
      },
    ],
    notes: [
      "Varios commits: `git cherry-pick a1b2c3d d4e5f6a`. Un rango `git cherry-pick a1b2c3d..789abcd` toma los commits **posteriores** a `a1b2c3d` hasta `789abcd` inclusive.",
      "`git cherry-pick -x a1b2c3d` agrega \"(cherry picked from commit …)\" al mensaje, útil para rastrear backports.",
      "`git cherry-pick -n a1b2c3d` (`--no-commit`) aplica los cambios sin hacer commit, para que puedas ajustarlos antes.",
      "Cherry-pick **copia**, no mueve: el commit original sigue en su rama.",
      "`git cherry-pick --abort` cancela y deja tu rama como estaba.",
    ],
    related: ['cherry-pick', 'log', 'switch', 'add', 'merge'],
    keywords: ['cherry-pick', 'copiar commit', 'un solo commit', 'traer commit', 'backport', 'commit de otra rama'],
  },
  {
    id: 'undo-pushed-commit',
    title: "Deshacer un commit que ya subí",
    problem:
      "Un commit que ya está en el remoto (y quizás en las copias de tu equipo) rompió algo. Necesitas deshacerlo sin causarle problemas a los demás.",
    category: 'undo',
    level: 2,
    steps: [
      {
        text: "Busca el hash del commit malo.",
        code: 'git log --oneline -5',
      },
      {
        text: "Crea un commit nuevo que hace exactamente lo contrario del commit malo. Git abre el editor con un mensaje como \"Revert \"Add login form\"\"; guarda y cierra (o agrega `--no-edit` para saltarte el editor).",
        code: 'git revert a1b2c3d',
      },
      {
        text: "Revisa qué deshace el commit de revert.",
        code: 'git show --stat HEAD',
      },
      {
        text: "Súbelo como cualquier commit normal. No hace falta forzar, porque no se reescribió nada.",
        code: 'git push',
      },
    ],
    notes: [
      "**¿Por qué no usar reset?** `git reset` saca el commit del historial de tu rama, así que tu rama deja de coincidir con el remoto y tendrías que forzar el push. Quien ya había descargado el historial anterior queda con copias divergentes y merges confusos, e incluso el commit \"borrado\" puede volver. Revert solo **agrega** un commit, así que los demás simplemente hacen pull.",
      "Para revertir un merge commit, dile a git cuál padre es la línea principal: `git revert -m 1 <hash-del-merge>`.",
      "Deshacer varios commits recientes de una vez: `git revert --no-commit HEAD~3..HEAD` y luego `git commit -m \"Revert login changes\"`.",
      "Los conflictos de un revert se resuelven como cualquier otro: editas, `git add` y luego `git revert --continue`.",
      "¿Cambiaste de opinión? Revertir el commit de revert trae los cambios de vuelta.",
      "Excepción: en una rama que usas solo tú y que nadie descargó, `git reset` + `git push --force-with-lease` es aceptable.",
    ],
    related: ['revert', 'reset', 'push', 'log', 'show'],
    keywords: ['deshacer commit subido', 'revert', 'deshacer después de push', 'rollback', 'historial público', 'anular commit'],
  },
  {
    id: 'recover-deleted-branch-or-commit',
    title: "Recuperar una rama borrada o commits perdidos",
    problem:
      "Borraste una rama con `git branch -D`, o hiciste `git reset --hard` y perdiste commits. No se han ido de verdad: git guarda un registro (el reflog) de cada lugar por donde ha pasado HEAD.",
    category: 'undo',
    level: 3,
    steps: [
      {
        text: "Abre el reflog: cada posición por la que pasó HEAD, de la más reciente a la más antigua, con líneas como `a1b2c3d HEAD@{2}: commit: Add login form`.",
        code: 'git reflog',
      },
      {
        text: "Busca el último commit del trabajo perdido (fíjate en su mensaje, o en la línea justo antes del reset o del cambio de rama). Revísalo para estar seguro.",
        code: 'git show a1b2c3d',
      },
      {
        text: "Vuelve a crear la rama apuntando a ese commit.",
        code: 'git branch feature/login a1b2c3d',
      },
      {
        text: "Cámbiate a ella.",
        code: 'git switch feature/login',
      },
      {
        text: "Comprueba que todos tus commits volvieron.",
        code: 'git log --oneline -5',
      },
    ],
    notes: [
      "Cuando borras una rama, git muestra su último commit: `Deleted branch feature/login (was a1b2c3d)`. Ese hash es todo lo que necesitas para el paso 3.",
      "¿Perdiste commits con `git reset --hard` en tu rama actual? En vez de una rama nueva, devuélvela: `git reset --hard HEAD@{1}` (la posición anterior de HEAD) o usa el hash del reflog.",
      "En PowerShell, pon entre comillas las referencias con llaves: `git reset --hard 'HEAD@{1}'`.",
      "El reflog es **local** (solo existe en tu máquina) y las entradas antiguas expiran (por defecto entre 30 y 90 días), así que recupera pronto.",
      "Los cambios que nunca estuvieron en un commit (descartados con `git restore` o `reset --hard`) no aparecen en el reflog; ahí no puede ayudarte.",
    ],
    related: ['reflog', 'branch', 'reset', 'switch', 'show', 'log'],
    keywords: ['recuperar rama', 'rama borrada', 'commits perdidos', 'reflog', 'deshacer reset', 'restaurar commit', 'recuperar commit'],
  },
  {
    id: 'push-rejected',
    title: "Mi push fue rechazado (fetch first / non-fast-forward)",
    problem:
      "`git push` falló con \"! [rejected] main -> main (fetch first)\" o \"(non-fast-forward)\" y \"Updates were rejected because the remote contains work that you do not have locally\". Alguien más subió commits que tú todavía no tienes.",
    category: 'remotes',
    level: 1,
    steps: [
      {
        text: "Descarga los commits nuevos del remoto, sin cambiar tu rama todavía.",
        code: 'git fetch origin',
      },
      {
        text: "Mira la situación: `git status` dirá algo como \"Your branch and 'origin/main' have diverged, and have 1 and 2 different commits each\".",
        code: 'git status',
      },
      {
        text: "Pon tus commits locales encima de los del remoto con un rebase (o usa `git merge origin/main` si prefieres un merge commit). Resuelve los conflictos si aparecen.",
        code: 'git rebase origin/main',
      },
      {
        text: "Vuelve a hacer push. Ahora tu rama contiene todo lo que tiene el remoto, así que lo acepta.",
        code: 'git push',
      },
    ],
    notes: [
      "Los pasos 1 a 3 en un solo comando: `git pull --rebase` (mira también \"git pull dice que tengo ramas divergentes\").",
      "**No fuerces el push sin pensar.** Agregar `--force` sobrescribiría la rama remota y borraría los commits de tu equipo. El force push es solo para tus propias ramas después de un rebase, y aun así es mejor `--force-with-lease`.",
      "\"non-fast-forward\" significa que la rama remota no puede simplemente avanzar hasta tu commit, porque tiene commits que no están en tu historial.",
      "Si `--force-with-lease` es rechazado con \"stale info\", alguien subió algo a esa rama desde tu último fetch: haz fetch, revisa lo que hizo e intégralo antes de volver a intentarlo.",
    ],
    related: ['push', 'fetch', 'pull', 'rebase', 'merge', 'status'],
    keywords: ['push rechazado', 'fetch first', 'non-fast-forward', 'failed to push', 'updates were rejected', 'atrasado respecto al remoto'],
  },
  {
    id: 'pull-divergent-branches',
    title: "git pull dice que tengo ramas divergentes",
    problem:
      "`git pull` se detiene con \"hint: You have divergent branches and need to specify how to reconcile them\" y \"fatal: Need to specify how to reconcile divergent branches\". Tienes commits locales y el remoto tiene commits nuevos, y las versiones recientes de git te obligan a elegir explícitamente cómo combinarlos.",
    category: 'remotes',
    level: 2,
    steps: [
      {
        text: "Elige una estrategia para este pull. **Rebase** (lo recomendado en la mayoría de los casos): tus commits locales se reaplican encima de los del remoto y el historial queda en línea recta.",
        code: 'git pull --rebase',
      },
      {
        text: "**O merge:** crea un merge commit que une ambos historiales (el comportamiento clásico).",
        code: 'git pull --no-rebase',
      },
      {
        text: "**O solo fast-forward:** se niega a combinar nada, así que solo funciona si no tienes commits locales. Ideal para `main` si nunca haces commits directamente en ella.",
        code: 'git pull --ff-only',
      },
      {
        text: "Para no volver a ver el mensaje, configura una opción por defecto una sola vez para todos tus repositorios. Esta hace que `git pull` siempre use rebase:",
        code: 'git config --global pull.rebase true',
      },
    ],
    notes: [
      "Otras opciones por defecto: `git config --global pull.rebase false` (siempre merge) o `git config --global pull.ff only` (solo fast-forward; cuando los historiales diverjan, decides tú a mano).",
      "**¿Por qué pregunta git?** \"Divergentes\" significa que cada lado tiene commits que el otro no tiene. Las versiones antiguas creaban un merge commit sin avisar, llenando el historial de commits \"Merge branch 'main' of …\", así que ahora te hace elegir.",
      "Con rebase, los conflictos se resuelven como en un rebase (`git add` + `git rebase --continue`); con merge, como en un merge (`git add` + `git commit`).",
      "`git config --global rebase.autoStash true` hace que `git pull --rebase` guarde en el stash y vuelva a aplicar tus cambios sin commit automáticamente.",
      "¿No estás seguro? Haz `git fetch` y luego `git log --oneline --graph main origin/main` para ver ambos lados antes del pull.",
    ],
    related: ['pull', 'config', 'fetch', 'rebase', 'merge'],
    keywords: ['ramas divergentes', 'divergent branches', 'reconcile', 'pull.rebase', 'pull rebase', 'ff-only'],
  },
  {
    id: 'stash-switch-branch',
    title: "Guardar trabajo a medias para cambiar de rama",
    problem:
      "Estás a mitad de algo en `feature/login` y necesitas cambiarte a `main` con urgencia (un bug, una revisión), pero tus cambios no están listos para un commit, y git no te deja cambiar de rama (\"Your local changes would be overwritten\") o no quieres llevártelos.",
    category: 'stash',
    level: 1,
    steps: [
      {
        text: "Guarda tus cambios en el stash; el directorio de trabajo queda limpio. `-u` también guarda los archivos sin seguimiento (nuevos) y `-m` le pone una etiqueta.",
        code: 'git stash push -u -m "login form half done"',
      },
      {
        text: "Cámbiate a la otra rama sin problemas.",
        code: 'git switch main',
      },
      {
        text: "Haz lo que necesitabas ahí (arreglar, commit, push) y vuelve.",
        code: 'git switch feature/login',
      },
      {
        text: "Mira tus stashes guardados (el más reciente es `stash@{0}`).",
        code: 'git stash list',
      },
      {
        text: "Vuelve a aplicar el último stash y sácalo de la lista.",
        code: 'git stash pop',
      },
    ],
    notes: [
      "`git stash apply` vuelve a aplicar los cambios pero **conserva** el stash en la lista (útil para aplicarlo en varias ramas). Bórralo después con `git stash drop`.",
      "Elige un stash específico con `git stash pop 1` (igual que `stash@{1}`; en PowerShell escribe `'stash@{1}'` entre comillas).",
      "Si `pop` genera un conflicto, resuélvelo como siempre y haz `git add` del archivo. En ese caso el stash **no** se borra, así que ejecuta `git stash drop` cuando termines.",
      "Sin `-u`, los archivos nuevos sin seguimiento se quedan en tu directorio de trabajo y te acompañan a la otra rama.",
      "`git stash show -p` muestra qué hay dentro del último stash.",
      "Alternativa: un commit temporal (`git commit -m \"WIP\"`) que después deshaces con `git reset --soft HEAD~1` (mira \"Deshacer el último commit sin perder mis cambios\").",
    ],
    related: ['stash', 'switch', 'status', 'commit', 'reset'],
    keywords: ['stash', 'guardar trabajo', 'cambiar de rama', 'cambios sin commit', 'wip', 'would be overwritten', 'guardar temporalmente'],
  },
  {
    id: 'rename-branch',
    title: "Renombrar una rama (local y en el remoto)",
    problem:
      "Tu rama se llama `feature/loign` (error de tipeo) o el nombre ya no le queda. Quieres renombrarla a `feature/login`, también en el remoto si ya la subiste.",
    category: 'branching',
    level: 2,
    steps: [
      {
        text: "Renombra la rama en la que estás. Desde otra rama, indica ambos nombres: `git branch -m feature/loign feature/login`.",
        code: 'git branch -m feature/login',
      },
      {
        text: "Si ya la habías subido: sube el nombre nuevo y configúralo como upstream.",
        code: 'git push -u origin feature/login',
      },
      {
        text: "Borra el nombre antiguo del remoto.",
        code: 'git push origin --delete feature/loign',
      },
      {
        text: "Verifica: la rama ahora sigue a `origin/feature/login`.",
        code: 'git branch -vv',
      },
    ],
    notes: [
      "`-m` se niega si ya existe una rama con el nombre nuevo; `-M` fuerza el cambio y la sobrescribe.",
      "Si alguien de tu equipo tenía la rama antigua: `git fetch --prune` elimina su `origin/feature/loign` obsoleta, y puede renombrar su copia local de la misma forma.",
      "Si hay un pull request abierto desde la rama antigua, borrarla en el remoto normalmente cierra el PR. En GitHub, mejor renombra la rama desde la interfaz web (lista de ramas → renombrar); así el PR se mantiene.",
      "Renombrar `master` a `main` funciona igual; además cambia la rama por defecto en la configuración de la plataforma.",
    ],
    related: ['branch', 'push', 'remote', 'fetch'],
    keywords: ['renombrar rama', 'nombre de rama', 'error en nombre de rama', 'branch -m', 'cambiar nombre de rama', 'renombrar rama remota'],
  },
  {
    id: 'delete-branch',
    title: "Borrar una rama (local y en el remoto)",
    problem:
      "`feature/login` ya se integró y quieres limpiarla, tanto en tu máquina como en el remoto.",
    category: 'branching',
    level: 1,
    steps: [
      {
        text: "Primero sal de la rama: no puedes borrar la rama en la que estás.",
        code: 'git switch main',
      },
      {
        text: "Borra la rama local. `-d` solo funciona si ya se integró, lo que te protege de perder trabajo.",
        code: 'git branch -d feature/login',
      },
      {
        text: "Bórrala en el remoto.",
        code: 'git push origin --delete feature/login',
      },
      {
        text: "Limpia las ramas de seguimiento remoto cuya rama ya no existe en el remoto (por ejemplo, las que se borraron en GitHub al integrar un PR).",
        code: 'git fetch --prune',
      },
    ],
    notes: [
      "Si `-d` dice \"The branch 'feature/login' is not fully merged\", git te está avisando que perderías commits. Si estás seguro, fuérzalo con `git branch -D feature/login`.",
      "Después de un \"Squash and merge\" o \"Rebase and merge\" en GitHub, git muchas veces cree que la rama no está integrada (los commits en `main` son otros). En ese caso `-D` está bien.",
      "¿Borraste la que no era? La salida dice `(was a1b2c3d)`, y `git branch feature/login a1b2c3d` la trae de vuelta (mira \"Recuperar una rama borrada o commits perdidos\").",
      "`git config --global fetch.prune true` hace que cada fetch limpie automáticamente.",
      "Sintaxis antigua para borrar en el remoto, todavía válida: `git push origin :feature/login`.",
    ],
    related: ['branch', 'push', 'fetch', 'switch', 'reflog'],
    keywords: ['borrar rama', 'eliminar rama', 'limpiar ramas', 'branch -d', 'borrar rama remota', 'prune'],
  },
  {
    id: 'sync-feature-branch-before-pr',
    title: "Actualizar mi rama antes de abrir un pull request",
    problem:
      "Estás por abrir (o actualizar) un pull request desde `feature/login`, pero `main` avanzó. Quieres tu rama encima del `main` más reciente, con los conflictos resueltos por ti y un historial limpio.",
    category: 'remotes',
    level: 2,
    steps: [
      {
        text: "Ve a tu rama de trabajo.",
        code: 'git switch feature/login',
      },
      {
        text: "Asegúrate de que todo está en un commit (o en el stash): el rebase necesita el directorio de trabajo limpio.",
        code: 'git status',
      },
      {
        text: "Trae el estado más reciente del remoto.",
        code: 'git fetch origin',
      },
      {
        text: "Haz rebase de tu rama sobre `origin/main` actualizado. Resuelve los conflictos si aparecen (mira \"Resolver un conflicto durante un rebase\").",
        code: 'git rebase origin/main',
      },
      {
        text: "Opcional: ordena tus commits (junta los \"wip\" y \"fix typo\" con squash). El editor muestra solo los commits de tu rama.",
        code: 'git rebase -i origin/main',
      },
      {
        text: "Ejecuta la app y los tests para comprobar que todo sigue funcionando encima del nuevo `main`.",
      },
      {
        text: "Haz push. El rebase reescribió tus commits, así que un push normal sería rechazado; `--force-with-lease` sobrescribe la rama remota solo si nadie más subió algo desde tu último fetch.",
        code: 'git push --force-with-lease',
      },
    ],
    notes: [
      "¿Es el primer push de la rama? Usa `git push -u origin feature/login`; no hace falta forzar.",
      "**Lease vs force a secas:** `--force` sobrescribe a ciegas. `--force-with-lease` primero comprueba que la rama remota sigue donde la viste por última vez, para que no borres por accidente los commits de alguien de tu equipo.",
      "Haz esto solo en ramas que son tuyas. Si otras personas suben cambios a la misma rama, mejor haz merge de `origin/main` (mira \"Actualizar mi rama con los últimos cambios de main\").",
      "El pull request se actualiza solo después del push.",
      "Para salir a mitad del rebase: `git rebase --abort`.",
    ],
    related: ['fetch', 'rebase', 'rebase-interactive', 'push', 'switch', 'status'],
    keywords: ['pull request', 'PR', 'sincronizar rama', 'force-with-lease', 'rebase antes del PR', 'actualizar PR', 'al día con main'],
  },
  {
    id: 'find-bug-commit',
    title: "Encontrar qué commit introdujo un bug",
    problem:
      "Algo que antes funcionaba ahora está roto, y hay decenas de commits entremedio. En vez de revisarlos uno por uno, `git bisect` hace una búsqueda binaria por ti.",
    category: 'inspection',
    level: 3,
    steps: [
      {
        text: "Inicia una sesión de bisect.",
        code: 'git bisect start',
      },
      {
        text: "Marca el commit actual como malo (aquí está el bug).",
        code: 'git bisect bad',
      },
      {
        text: "Marca un commit que sabes que estaba bien, por ejemplo un tag o un hash antiguo.",
        code: 'git bisect good v1.2.0',
      },
      {
        text: "Git te deja en un commit a medio camino entre ambos. Pruébalo (ejecuta la app, los tests…) y da tu veredicto: `git bisect good` si funciona, `git bisect bad` si el bug está. Repite hasta que git diga \"a1b2c3d is the first bad commit\".",
        code: 'git bisect good',
      },
      {
        text: "Mira al culpable.",
        code: 'git show a1b2c3d',
      },
      {
        text: "Termina la sesión y vuelve a la rama desde donde empezaste.",
        code: 'git bisect reset',
      },
    ],
    notes: [
      "Cada respuesta corta el rango a la mitad: con unos 1000 commits, bastan alrededor de 10 pruebas.",
      "¿No puedes probar un commit (por ejemplo, no compila)? `git bisect skip` pasa a uno cercano.",
      "Automatízalo: `git bisect run npm test` ejecuta el comando en cada paso. Código de salida 0 significa bueno, 125 significa saltar y cualquier otro significa malo.",
      "Durante el bisect estás en detached HEAD; es normal. `git bisect reset` te devuelve a tu rama.",
      "Atajo: `git bisect start HEAD v1.2.0` marca el malo y el bueno en un solo comando. Si \"good/bad\" no calza con lo que buscas, puedes usar `old`/`new` en su lugar.",
    ],
    related: ['bisect', 'log', 'show', 'tag', 'blame', 'checkout'],
    keywords: ['bisect', 'encontrar bug', 'regresión', 'qué commit rompió', 'búsqueda binaria', 'commit culpable'],
  },
  {
    id: 'see-what-changed',
    title: "Ver qué cambió (diff, log y show)",
    problem:
      "Quieres revisar cambios: lo que modificaste pero no has agregado al staging area, lo que va a entrar en el próximo commit, qué hizo un commit específico o en qué se diferencian dos ramas.",
    category: 'inspection',
    level: 1,
    steps: [
      {
        text: "Cambios en tu directorio de trabajo que **todavía no están** en el staging area.",
        code: 'git diff',
      },
      {
        text: "Cambios que **sí están** en el staging area, es decir, lo que entrará en el próximo commit.",
        code: 'git diff --staged',
      },
      {
        text: "Todos los cambios desde el último commit, estén o no en el staging area.",
        code: 'git diff HEAD',
      },
      {
        text: "Historial compacto: una línea por commit, con el gráfico de todas las ramas.",
        code: 'git log --oneline --graph --all',
      },
      {
        text: "Qué hizo un commit específico: su mensaje, autor y diff.",
        code: 'git show a1b2c3d',
      },
      {
        text: "El historial de un solo archivo, con el diff de cada commit.",
        code: 'git log -p -- src/app.js',
      },
      {
        text: "Los commits de `feature/login` que todavía no están en `main`.",
        code: 'git log --oneline main..feature/login',
      },
      {
        text: "Todo lo que cambió `feature/login` desde que se separó de `main` (más o menos lo que mostrará su pull request).",
        code: 'git diff main...feature/login',
      },
    ],
    notes: [
      "`--staged` y `--cached` son sinónimos.",
      "`git diff --stat` (o `git show --stat a1b2c3d`) muestra solo un resumen de archivos y líneas cambiadas.",
      "**Dos puntos vs tres puntos** en `git diff`: `main..feature/login` compara directamente las puntas de ambas ramas (los cambios hechos en `main` también aparecen, al revés); `main...feature/login` muestra solo lo que cambió en `feature/login` desde que se separó, que normalmente es lo que quieres para una revisión.",
      "En `git log`, `main..feature/login` significa \"commits alcanzables desde feature/login pero no desde main\".",
      "Si la salida es larga se abre un paginador: muévete con las flechas o Espacio, y sal con `q`.",
      "Filtros útiles para log: `--author=\"Ana\"`, `--since=\"2 weeks ago\"`, `--grep=\"login\"`.",
      "`git diff --word-diff` destaca las palabras cambiadas en vez de líneas completas, ideal para archivos de texto como `README.md`.",
      "Para ver quién cambió por última vez cada línea de un archivo: `git blame src/app.js`.",
    ],
    related: ['diff', 'log', 'show', 'status', 'blame'],
    keywords: ['diff', 'qué cambió', 'comparar', 'historial', 'cambios en staging', 'comparar ramas', 'log'],
  },
];
