import type { QuizText } from '../../../content/types';

export const quizTexts: Record<string, QuizText> = {
  // ---------------------------------------------------------------- Nivel 1
  'config-user-name': {
    prompt: "Configura tu nombre de usuario de git como `Ada Lovelace` para todos los repositorios de este computador.",
    explanation:
      "`--global` guarda la configuración en tu archivo de usuario (`~/.gitconfig`), así que aplica a todos tus repositorios; sin esa opción, solo afecta al repositorio actual. Las comillas son necesarias porque el nombre tiene un espacio. Configura `user.email` de la misma forma, ya que cada commit registra ambos datos.",
  },
  'init-repo': {
    prompt: "Convierte la carpeta actual en un repositorio git nuevo y vacío.",
    explanation:
      "`git init` crea la carpeta oculta `.git`, donde git guarda todo el historial y la configuración. Puedes usarlo en una carpeta que ya tiene archivos: nada se versiona hasta que hagas `add` y `commit`. Evita ejecutarlo dentro de una carpeta que ya forma parte de otro repositorio.",
  },
  'clone-into-folder': {
    prompt: "Descarga el repositorio `https://github.com/acme/shop.git` en una carpeta nueva llamada `shop-dev`.",
    explanation:
      "`git clone <url> <carpeta>` copia todo el historial y configura un remoto llamado `origin` que apunta a esa URL. Sin el último argumento, la carpeta se llamaría igual que el repositorio (`shop`).",
  },
  'stage-all': {
    prompt: "Agrega al staging area todos los cambios del repositorio (archivos nuevos, modificados y eliminados) para el próximo commit.",
    explanation:
      "`git add -A` (`--all`) agrega todos los cambios de todo el directorio de trabajo. `git add .` hace lo mismo, pero solo para la carpeta actual y sus subcarpetas, así que es equivalente si estás en la raíz del repo. Revisa `git status` antes, para no agregar archivos por error.",
  },
  'commit-with-message': {
    prompt: "Haz un commit de los cambios que están en el staging area con el mensaje `Add login form`, sin abrir un editor.",
    explanation:
      "`-m` entrega el mensaje directamente; sin esa opción, git abre el editor que tengas configurado. Solo los cambios del staging area entran en el commit, así que primero usa `git add` (o agrega `-a` para incluir todos los archivos versionados que modificaste).",
  },
  'create-and-switch-branch': {
    prompt: "Crea una rama llamada `hotfix` y cámbiate a ella con un solo comando.",
    explanation:
      "`git switch -c` (de \"create\") es la forma moderna; `git checkout -b` hace lo mismo y funciona también en versiones antiguas de git. La rama nueva parte desde el commit en que estás. Con `git branch hotfix` solo la crearías, sin cambiarte a ella.",
  },
  'delete-merged-branch': {
    prompt: "Elimina la rama local `feature/login`, que ya fue integrada con un merge.",
    explanation:
      "`-d` solo borra la rama si ya fue integrada por completo, así que no puedes perder trabajo por accidente. No puedes borrar la rama en la que estás: cámbiate a otra primero. Esto no afecta a la rama en el remoto.",
  },
  'unstage-file': {
    prompt: "Agregaste `app.js` al staging area por error. Sácalo de ahí, pero conserva los cambios en el archivo.",
    explanation:
      "`git restore --staged` saca el archivo del staging area y deja tus cambios intactos en el directorio de trabajo. Los tutoriales más antiguos usan `git reset HEAD <archivo>`, que hace lo mismo. Ojo: sin `--staged`, `git restore` descartaría tus cambios.",
  },
  'discard-file-changes': {
    prompt: "Editaste `style.css` (sin agregarlo al staging area) y quieres descartar esos cambios para volver a la versión del último commit.",
    explanation:
      "`git restore <archivo>` sobrescribe el archivo con la versión del staging area, que es la del último commit si no has agregado nada. No se puede deshacer: los cambios sin commit no quedan en el historial. El equivalente antiguo es `git checkout -- <archivo>`; el `--` evita confusiones con una rama del mismo nombre.",
  },
  'add-remote': {
    prompt: "Conecta tu repositorio local a `https://github.com/acme/shop.git` con el nombre `origin`.",
    explanation:
      "`git remote add <nombre> <url>` guarda un nombre corto para esa URL, para que puedas hacer `push` y `fetch` con él; `origin` es solo el nombre habitual del remoto principal. Revísalo con `git remote -v`. Si `origin` ya existe, cambia su URL con `git remote set-url`.",
  },
  'push-set-upstream': {
    prompt: "Sube tu nueva rama local `feature` a `origin` por primera vez y configúrala como su upstream, para que después baste con un simple `git push`.",
    explanation:
      "`-u` (`--set-upstream`) vincula tu rama local con `origin/feature`. Desde ahí, `git push`, `git pull` y `git status` saben con qué rama remota trabajar. Solo lo necesitas una vez por rama.",
  },
  'stash-pop': {
    prompt: "Vuelve a aplicar tu stash más reciente y elimínalo de la lista de stashes.",
    explanation:
      "`pop` equivale a `apply` + `drop`. Si al aplicarlo hay un conflicto, el stash **no** se elimina, así que puedes resolverlo y luego borrarlo con `git stash drop`. Usa `git stash apply` si quieres conservar el stash.",
  },
  'diff-staged': {
    prompt: "Muestra los cambios que ya están en el staging area, es decir, lo que entrará en el próximo commit.",
    explanation:
      "Un `git diff` a secas solo muestra los cambios que **no** están en el staging area, lo que confunde a muchos justo después de un `git add`. `--staged` y `--cached` son sinónimos. Para ver todo comparado con el último commit, usa `git diff HEAD`.",
  },
  'show-commit': {
    prompt: "Muestra el autor, el mensaje y los cambios del commit `a1b2c3d`.",
    explanation:
      "`git show <commit>` muestra los datos del commit seguidos de su diff; sin argumentos muestra `HEAD`. También puedes ver un archivo tal como estaba en ese commit con `git show a1b2c3d:ruta/al/archivo`.",
  },
  'tag-lightweight': {
    prompt: "Pon un tag liviano (lightweight) llamado `v1.0` en el commit actual.",
    explanation:
      "Un tag liviano es solo un nombre que apunta a un commit, sin autor ni mensaje; para releases se prefieren los tags anotados (`git tag -a`). Los tags no se suben por defecto: envíalos con `git push origin v1.0`.",
  },

  // ---------------------------------------------------------------- Nivel 2
  'config-default-branch': {
    prompt: "Haz que todos los repositorios que crees con `git init` partan con una rama llamada `main` (para todos los repositorios de este computador).",
    explanation:
      "`init.defaultBranch` define el nombre de la primera rama que crea `git init`. Solo afecta a los repositorios nuevos; para renombrar la rama en uno existente, usa `git branch -m main`.",
  },
  'stop-tracking-file': {
    prompt: "Hiciste commit de `secrets.env` por error. Haz que git deje de versionarlo, pero conserva el archivo en tu disco.",
    explanation:
      "`--cached` quita el archivo solo del índice: el próximo commit lo elimina del repositorio, pero tu copia local se mantiene. Agrégalo a `.gitignore` para que no vuelva a entrar al staging area. Sigue estando en los commits anteriores, así que si tenía secretos reales, cámbialos.",
  },
  'switch-previous-branch': {
    prompt: "Vuelve a la rama en la que estabas justo antes de la actual.",
    explanation:
      "`-` es un atajo para `@{-1}`, la rama anterior, igual que `cd -` en la terminal. Si lo ejecutas de nuevo vuelves a la otra, así que es muy útil para alternar entre dos ramas.",
  },
  'force-delete-branch': {
    prompt: "Elimina la rama local `experiment`, aunque tenga commits que nunca se integraron.",
    explanation:
      "`-D` es la abreviación de `--delete --force`: se salta la verificación de si la rama está integrada, así que esos commits quedan sin rama. Si te arrepientes, normalmente `git reflog` todavía puede encontrar el último commit durante un tiempo.",
  },
  'rename-current-branch': {
    prompt: "Renombra la rama en la que estás a `main`.",
    explanation:
      "Con un argumento, `git branch -m` renombra la rama actual; con dos (`-m vieja nueva`) renombra cualquier rama. `-M` lo fuerza aunque `main` ya exista. En el remoto se mantiene el nombre antiguo hasta que hagas push del nuevo y borres el viejo allá.",
  },
  'merge-no-ff': {
    prompt: "Haz merge de `feature` en la rama actual creando siempre un merge commit, aunque se pudiera hacer fast-forward.",
    explanation:
      "Si tu rama no ha avanzado desde que se creó `feature`, git simplemente adelanta el puntero (fast-forward) y no crea un merge commit. `--no-ff` obliga a crearlo, dejando registro en el historial de que `feature` fue una línea de trabajo separada.",
  },
  'merge-abort': {
    prompt: "Un merge se detuvo por conflictos y prefieres no lidiar con ellos ahora. Cancela el merge y vuelve a como estaba todo antes de empezarlo.",
    explanation:
      "`git merge --abort` devuelve tu rama y tus archivos al estado previo al merge. Si prefieres resolverlo: corrige los archivos, agrégalos con `git add` y termina con `git merge --continue` (o `git commit`). Haz commit o stash de tus cambios antes de un merge, porque el abort no siempre puede recuperar trabajo sin commit.",
  },
  'undo-commit-keep-staged': {
    prompt: "Deshaz tu último commit, pero deja sus cambios **en el staging area**, listos para volver a hacer commit.",
    explanation:
      "`--soft` solo mueve el puntero de la rama un commit hacia atrás; el staging area y tus archivos no se tocan, así que todo lo de ese commit sigue agregado. `HEAD~1` significa \"el padre de `HEAD`\". No lo hagas con commits que ya subiste a una rama compartida; ahí usa `git revert`.",
  },
  'undo-commit-keep-unstaged': {
    prompt: "Deshaz tu último commit y conserva sus cambios en tus archivos, pero **fuera** del staging area.",
    explanation:
      "`--mixed` es el modo por defecto de `git reset`: mueve la rama hacia atrás y limpia el staging area, pero no toca tus archivos. Compáralo con `--soft` (los cambios quedan en el staging area) y `--hard` (los cambios se descartan).",
  },
  'undo-commit-discard': {
    prompt: "Descarta por completo tu último commit **y** todos sus cambios, como si nunca hubiera existido.",
    explanation:
      "`--hard` mueve la rama hacia atrás y sobrescribe tanto el staging area como tus archivos. Cualquier cambio sin commit se pierde para siempre, aunque el commit descartado todavía se puede recuperar por un tiempo con `git reflog`. Nunca lo hagas con commits que otras personas ya descargaron.",
  },
  'revert-commit': {
    prompt: "El commit `a1b2c3d` ya está en una rama compartida e introdujo un bug. Deshaz sus cambios con un commit nuevo, sin reescribir el historial.",
    explanation:
      "`git revert` crea un commit nuevo que aplica lo inverso del commit indicado, así que el historial queda intacto y es seguro en ramas compartidas. `git revert HEAD` deshace el commit más reciente. Para revertir un merge commit necesitas `-m 1`, que indica qué padre conservar.",
  },
  'amend-no-edit': {
    prompt: "Se te olvidó un archivo en el último commit. Ya lo agregaste al staging area: súmalo a ese commit **sin cambiar su mensaje**.",
    explanation:
      "`--amend` reemplaza el último commit por uno nuevo que también incluye lo que está en el staging area; `--no-edit` reutiliza el mensaje existente en vez de abrir el editor. Como el commit queda con otro hash, no hagas amend de commits que ya subiste, a menos que estés dispuesto a hacer force push.",
  },
  'cherry-pick': {
    prompt: "Copia los cambios del commit `f00ba12` (que está en otra rama) a tu rama actual como un commit nuevo.",
    explanation:
      "`git cherry-pick` reaplica un solo commit encima de `HEAD`, creando un commit nuevo con otro hash. Agrega `-x` para dejar el hash original en el mensaje. Si hay conflictos, resuélvelos, agrega los archivos con `git add` y ejecuta `git cherry-pick --continue` (o `--abort`).",
  },
  'pull-rebase': {
    prompt: "Actualiza tu rama actual desde su upstream, dejando tus commits locales **encima** de los que llegan, en vez de crear un merge commit.",
    explanation:
      "`git pull --rebase` hace un `fetch` y luego un rebase de tus commits no subidos sobre la rama remota actualizada, manteniendo el historial lineal. Para que sea el comportamiento por defecto, usa `git config --global pull.rebase true`. Si aparecen conflictos, resuélvelos y usa `git rebase --continue`.",
  },
  'delete-remote-branch': {
    prompt: "Elimina la rama `old-feature` del remoto `origin`.",
    explanation:
      "Borrar una rama local con `git branch -d` no la borra en el remoto; tienes que hacer push de la eliminación. La sintaxis antigua `git push origin :old-feature` (subir \"nada\" a esa rama) hace lo mismo. Tus compañeros pueden limpiar su `origin/old-feature` obsoleta con `git fetch --prune`.",
  },
  'stash-with-message': {
    prompt: "Guarda tus cambios sin commit en el stash con la descripción `wip login form`.",
    explanation:
      "Un mensaje hace que `git stash list` sea mucho más fácil de leer que el `WIP on main: ...` por defecto. `git stash save` es la forma antigua, ya obsoleta. Los archivos sin versionar **no** se guardan a menos que agregues `-u`.",
  },
  'stash-include-untracked': {
    prompt: "Guarda en el stash todos tus cambios, **incluyendo** los archivos nuevos que git todavía no versiona.",
    explanation:
      "Sin `-u`, `git stash` solo guarda los archivos versionados, así que los archivos nuevos se quedan en tu directorio de trabajo. `-a` (`--all`) va más allá e incluye también los archivos ignorados, lo que rara vez es lo que quieres.",
  },
  'log-oneline-graph-all': {
    prompt: "Muestra el historial de **todas** las ramas como un gráfico compacto, con una línea por commit.",
    explanation:
      "`--oneline` resume cada commit en hash + título, `--graph` dibuja las líneas de las ramas y `--all` incluye todas las ramas, no solo la actual. Mucha gente lo guarda como alias, por ejemplo `git config --global alias.lg \"log --oneline --graph --all\"`.",
  },
  'blame-file': {
    prompt: "Averigua quién cambió por última vez cada línea de `src/app.ts`, y en qué commit.",
    explanation:
      "`git blame` anota cada línea con el commit, el autor y la fecha de su último cambio; limítalo a algunas líneas con `-L 10,20`. Ese último cambio puede ser solo de formato: `-w` ignora los cambios de espacios, y `git log -L` muestra la historia completa de un rango de líneas.",
  },
  'tag-annotated': {
    prompt: "Crea un tag anotado `v1.2.0` en el commit actual con el mensaje `Release 1.2.0`.",
    explanation:
      "Un tag anotado es un objeto completo de git con su propio autor, fecha y mensaje, ideal para releases. `-m` sin `-a` también crea un tag anotado. Como todo tag, no se sube automáticamente: usa `git push origin v1.2.0`.",
  },
  'push-tags': {
    prompt: "Sube todos tus tags locales a `origin`.",
    explanation:
      "Un `git push` normal **no** envía los tags. `--tags` los sube todos; para subir solo uno, usa `git push origin v1.2.0`. `--follow-tags` es un punto medio más seguro: solo sube los tags anotados que apuntan a los commits que estás subiendo.",
  },

  // ---------------------------------------------------------------- Nivel 3
  'checkout-theirs': {
    prompt: "Estás haciendo merge de `feature` en `main` y `config.json` tiene conflictos. Reemplázalo en tu directorio de trabajo con la versión del archivo que viene de `feature` (\"theirs\").",
    explanation:
      "Durante un merge, `--ours` es la rama en la que estás y `--theirs` es la que estás integrando. Después de elegir un lado, marca el conflicto como resuelto con `git add config.json`. Ojo: durante un **rebase** los papeles se invierten, y `--ours` es la rama sobre la que estás haciendo el rebase.",
  },
  'rebase-continue': {
    prompt: "Durante un rebase resolviste un conflicto y agregaste el archivo al staging area. Dile a git que siga con el resto del rebase.",
    explanation:
      "A diferencia de un merge, durante un rebase no haces commit a mano: `--continue` crea el commit y reaplica los que faltan. Si se complica demasiado, `git rebase --abort` deja todo como estaba antes del rebase, y `--skip` descarta el commit actual.",
  },
  'rebase-interactive-last-3': {
    prompt: "Inicia un rebase interactivo para cambiar el mensaje, combinar (squash) o reordenar tus últimos 3 commits.",
    explanation:
      "`HEAD~3` es la base: los tres commits que vienen después se abren en tu editor, del más antiguo al más nuevo, y ahí cambias `pick` por `reword`, `squash`, `fixup`, `drop`, etc. Esto reescribe los hashes de esos commits, así que hazlo solo con commits que no hayas compartido (o prepárate para hacer push con `--force-with-lease`).",
  },
  'rebase-onto': {
    prompt: "Estás en `feature`, que creaste desde `develop` por error. Mueve solo los commits propios de `feature` para que partan desde `main`.",
    explanation:
      "`git rebase --onto <base-nueva> <base-antigua>` toma los commits posteriores a `<base-antigua>` (aquí, los que están en `feature` pero no en `develop`) y los reaplica sobre `<base-nueva>`. Un simple `git rebase main` también arrastraría los commits de `develop` que no están en `main`.",
  },
  reflog: {
    prompt: "Después de un `git reset --hard` perdiste un commit. Muestra el registro de todas las posiciones por las que ha pasado `HEAD`, para encontrar su hash.",
    explanation:
      "El reflog es un registro local de adónde ha apuntado `HEAD` (y cada rama), incluso commits que ya no son alcanzables desde ninguna rama. Cuando encuentres el hash, recupéralo con `git branch rescate <hash>` o `git reset --hard <hash>`. Nunca se sube al remoto y las entradas antiguas expiran (por defecto, las inalcanzables después de unos 30 días).",
  },
  'restore-file-from-commit': {
    prompt: "Deja `README.md` exactamente como estaba en el commit `a1b2c3d`, sin mover ninguna rama.",
    explanation:
      "`--source` (`-s`) le indica a `git restore` de qué commit sacar el archivo; solo cambia ese archivo y tu rama se queda donde está. `git checkout a1b2c3d -- README.md` también funciona, pero además deja el archivo en el staging area. Haz commit del resultado si quieres conservarlo.",
  },
  'push-force-with-lease': {
    prompt: "Hiciste rebase de tu rama `feature`, que ya estaba en `origin`. Súbela, sobrescribiendo la rama remota solo si nadie más hizo push desde tu último fetch.",
    explanation:
      "Un rebase reescribe los hashes, así que un push normal es rechazado. `--force` sobrescribe a ciegas y puede borrar el trabajo de tus compañeros; `--force-with-lease` se niega si la rama remota cambió desde tu último fetch. Ojo: un `git fetch` justo antes del push actualiza esa referencia y anula la protección.",
  },
  'stash-apply-specific': {
    prompt: "Aplica el stash `stash@{2}` a tu directorio de trabajo, pero mantenlo en la lista de stashes.",
    explanation:
      "`apply` deja el stash en la lista (a diferencia de `pop`), lo que sirve si quieres aplicarlo en varias ramas. Busca el índice correcto con `git stash list`. En PowerShell ponlo entre comillas (`'stash@{2}'`), porque ahí las llaves tienen un significado especial.",
  },
  'log-search-string': {
    prompt: "Encuentra los commits que agregaron o eliminaron el texto `API_KEY` en cualquier parte del código.",
    explanation:
      "`-S` (el \"pickaxe\") lista los commits en que cambió la cantidad de apariciones de ese texto, es decir, donde se agregó o se eliminó. Agrega `-p` para ver los diffs. No lo confundas con `--grep`, que busca en los **mensajes** de los commits.",
  },
  'bisect-start': {
    prompt: "En un solo comando, inicia una sesión de bisect indicando que el commit actual (`HEAD`) está malo y que el tag `v1.0` estaba bueno.",
    explanation:
      "`git bisect start <malo> <bueno>` inicia una búsqueda binaria entre esos dos commits. Git hace checkout de uno intermedio; lo pruebas y respondes `git bisect good` o `git bisect bad` hasta que te indique el primer commit malo. Termina con `git bisect reset` para volver a donde estabas.",
  },
  'log-commits-not-in-main': {
    prompt: "Lista los commits que están en `feature` pero todavía no en `main`.",
    explanation:
      "`A..B` significa \"alcanzable desde `B` pero no desde `A`\", así que `main..feature` muestra lo que traería a `main` un merge de `feature`. Inviértelos (`feature..main`) para ver lo que te falta a ti. Con tres puntos (`main...feature`) obtienes los commits que están en uno de los dos lados, pero no en ambos.",
  },
  'delete-remote-tag': {
    prompt: "Elimina el tag `v0.9` del remoto `origin` (localmente ya lo borraste).",
    explanation:
      "Borrar un tag local con `git tag -d` no afecta al remoto. `--delete` funciona con tags igual que con ramas; usa el nombre completo `refs/tags/v0.9` si hay una rama con el mismo nombre. Quien ya haya descargado el tag conserva su copia hasta que lo borre por su cuenta.",
  },
};
