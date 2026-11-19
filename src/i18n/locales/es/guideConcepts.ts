import type { GuideConcept } from '../../../content/types';

export const guideConcepts: GuideConcept[] = [
  {
    id: 'repository',
    title: "Repositorio",
    body:
      "Un **repositorio** (o \"repo\") es una carpeta de proyecto cuyo historial registra git. Son tus archivos más una carpeta oculta `.git`, donde git guarda cada commit, cada rama y la configuración del repositorio.\n\nPiénsalo como tu proyecto con una máquina del tiempo incorporada: la carpeta muestra el presente, y `.git` guarda todas las versiones pasadas que fuiste guardando.\n\n- `git init` convierte la carpeta actual en un repositorio nuevo (crea `.git`).\n- `git clone <url>` descarga un repositorio existente, con todo su historial.\n- Si borras la carpeta `.git`, el proyecto vuelve a ser una carpeta normal, sin historial. ¡No lo hagas por accidente!\n\nGit es **distribuido**: cada clon es un repositorio completo con todo el historial. Un servidor como GitHub solo aloja una copia más, que todos acuerdan usar para compartir su trabajo (un \"remoto\").",
    related: ['init', 'clone', 'status', 'remote', 'config'],
    keywords: ['repositorio', 'repo', 'carpeta .git', 'proyecto', 'init', 'clone'],
  },
  {
    id: 'three-areas',
    title: "Las tres áreas: directorio de trabajo, staging area y repositorio",
    body:
      "Git maneja tres versiones de tus archivos a la vez. Cuando las entiendes, la mayoría de los comandos cobran sentido:\n\n- **Directorio de trabajo** (working directory o working tree): los archivos reales que ves y editas en tu carpeta.\n- **Staging area** (también llamada **index**): un borrador de tu próximo commit. Tú decides qué entra con `git add`.\n- **Repositorio**: los commits guardados, dentro de `.git`. `git commit` toma lo que hay en el staging area y lo guarda como un commit nuevo.\n\nAnalogía: estás armando una caja para enviar. El directorio de trabajo es tu pieza con todo desordenado, el staging area es la caja abierta con las cosas que elegiste, y hacer commit es cerrar la caja y ponerle una etiqueta. Antes de cerrarla puedes meter cosas (`git add`) y sacarlas (`git restore --staged`) todas las veces que quieras.\n\n¿Para qué el paso extra? Te permite hacer commit solo de una parte de tus cambios: si arreglaste dos cosas sin relación, puedes hacer un commit para cada una con su propio mensaje.\n\nLos comandos para inspeccionar siguen las mismas áreas: `git diff` compara directorio de trabajo vs staging area, `git diff --staged` compara staging area vs último commit, y `git status` resume ambas cosas.",
    related: ['add', 'commit', 'status', 'diff', 'restore', 'reset'],
    keywords: ['staging area', 'index', 'directorio de trabajo', 'working tree', 'preparar cambios', 'tres áreas', 'git add'],
  },
  {
    id: 'commit',
    title: "Commit",
    body:
      "Un **commit** es una foto de todo tu proyecto en un momento dado, guardada en el repositorio. Piénsalo como un punto de guardado en un videojuego: siempre puedes volver a él.\n\nCada commit guarda:\n\n- el estado completo de los archivos (los que no cambiaron se guardan de forma eficiente, así que no se desperdicia espacio)\n- un mensaje que explica el cambio\n- el autor y la fecha\n- un enlace a su **padre**, el commit anterior (un merge commit tiene dos padres)\n\nCada commit se identifica con un **hash** como `a1b2c3d4e5f6...`, que normalmente se acorta a sus primeros 7 caracteres (`a1b2c3d`). El hash se calcula a partir del contenido, así que si cambias cualquier cosa (aunque sea solo el mensaje, con `--amend`) obtienes un commit **nuevo** con otro hash. A eso se le llama \"reescribir el historial\".\n\nBuenos hábitos: commits chicos que hagan una sola cosa, con mensajes que digan qué y por qué (en inglés suelen escribirse en imperativo: \"Fix login redirect after logout\").",
    related: ['commit', 'add', 'log', 'show', 'commit-amend'],
    keywords: ['commit', 'foto', 'hash', 'SHA', 'punto de guardado', 'padre', 'mensaje de commit'],
  },
  {
    id: 'branch',
    title: "Rama (branch)",
    body:
      "Una **rama** es simplemente una etiqueta móvil que apunta a un commit. Cuando haces un commit nuevo, la etiqueta de la rama en la que estás avanza sola hasta él.\n\nComo una rama es solo un puntero (un archivo diminuto que contiene un hash), crear una es instantáneo y gratis. Por eso los flujos de trabajo con git usan muchas: una por funcionalidad o arreglo (`feature/login`, `fix/header`), que se integra a `main` cuando está lista.\n\nAnalogía: los commits son paradas a lo largo de un camino y una rama es un marcador que dice \"esta línea de trabajo va aquí\". Dos ramas pueden apuntar al mismo commit; a medida que cada una recibe commits nuevos, sus caminos se separan.\n\n- `git branch` lista las ramas; `git branch feature/login` crea una.\n- `git switch feature/login` te cambia a ella (`git switch -c feature/login` la crea y te cambia en un paso; la forma antigua es `git checkout -b`).\n- Borrar una rama borra la etiqueta, no los commits (por un tiempo, `git reflog` todavía puede encontrarlos).\n\n`main` (o `master` en repositorios más antiguos) no tiene nada especial para git: es solo el nombre habitual de la línea principal de trabajo.",
    related: ['branch', 'switch', 'checkout', 'merge', 'log'],
    keywords: ['rama', 'branch', 'puntero', 'rama de funcionalidad', 'main', 'master', 'crear rama'],
  },
  {
    id: 'head',
    title: "HEAD",
    body:
      "**HEAD** significa \"dónde estás ahora\". Normalmente apunta a la rama actual (por ejemplo `main`), y esa rama apunta a un commit. Cuando haces commit, la rama avanza y HEAD avanza con ella.\n\nPiensa en HEAD como el marcador \"Usted está aquí\" de un mapa. `git switch` mueve el marcador a otra rama, y los archivos de tu carpeta cambian para coincidir.\n\nMuchos comandos usan HEAD como punto de referencia:\n\n- `HEAD~1` (o `HEAD~`) es el commit anterior a HEAD; `HEAD~3` es tres commits atrás.\n- `HEAD^2` es el segundo padre de un merge commit.\n- `git show HEAD` muestra el último commit.\n- `git reset --soft HEAD~1` mueve la rama actual un commit hacia atrás.\n\nEl archivo `.git/HEAD` contiene literalmente algo como `ref: refs/heads/main`. Cada vez que HEAD se mueve, git lo anota en el reflog (`git reflog`).",
    related: ['log', 'show', 'reset', 'switch', 'reflog'],
    keywords: ['HEAD', 'rama actual', 'HEAD~1', 'usted está aquí', 'puntero', 'virgulilla'],
  },
  {
    id: 'detached-head',
    title: "Detached HEAD (HEAD desacoplado)",
    body:
      "Normalmente HEAD apunta a una rama. En estado **detached HEAD** apunta directamente a un commit. Llegas ahí al hacer checkout de un commit específico, un tag o una rama de seguimiento remoto (`git checkout a1b2c3d`, `git switch --detach v1.0`), y git también lo hace temporalmente durante `git bisect` o cuando un rebase se detiene.\n\nNo es un error: es perfecto para mirar una versión antigua, ejecutarla o probar algo. El problema: si haces commits ahí, ninguna rama apunta a ellos. Cuando te cambias a otra rama quedan \"flotando\", y cuando salen del reflog git termina borrándolos.\n\nAnalogía: te saliste de los senderos marcados. Puedes explorar libremente, pero si construyes algo ahí y te vas sin poner un letrero (una rama), no lo vas a encontrar fácilmente de nuevo.\n\n- ¿Solo estabas mirando? Vuelve con `git switch main` (o `git switch -` para volver a la rama anterior).\n- ¿Hiciste commits que quieres conservar? Crea una rama ahí mismo: `git switch -c experiment`.\n- ¿Ya te fuiste sin crearla? Busca el commit en `git reflog` y ejecuta `git branch experiment <hash>`.\n\n`git switch` se niega a desacoplar HEAD a menos que agregues `--detach`, lo que hace más difícil llegar ahí por accidente; `git checkout` lo hace sin preguntar.",
    related: ['checkout', 'switch', 'branch', 'reflog', 'bisect', 'tag'],
    keywords: ['detached HEAD', 'HEAD desacoplado', 'checkout de commit', 'HEAD detached at', 'sin rama', 'commits perdidos'],
  },
  {
    id: 'merge-vs-rebase',
    title: "Merge vs rebase",
    body:
      "Ambos llevan los cambios de una rama a otra. La diferencia está en cómo queda el historial.\n\n**Merge** (`git merge main` estando en `feature/login`) une los dos historiales. Si ambas ramas tienen commits nuevos, git crea un **merge commit** con dos padres. No se modifica nada de lo que ya existe, así que siempre es seguro, pero el historial se llena de merge commits y parece una trenza.\n\n**Fast-forward:** si la rama a la que haces merge no tiene commits propios desde que se separaron, no hay nada que unir, así que git solo mueve su etiqueta hacia adelante hasta la punta de la otra rama. No se crea merge commit. (`git merge --no-ff` fuerza un merge commit igual; `git merge --ff-only` rechaza todo lo que no sea fast-forward.)\n\n**Rebase** (`git rebase main` estando en `feature/login`) toma tus commits y los **reaplica** uno por uno encima de `main`, como si hubieras empezado tu trabajo desde el `main` más reciente. El resultado es una línea recta, pero tus commits se recrean con hashes nuevos: el historial se reescribe.\n\n- Merge: historial real, seguro en ramas compartidas, pero más ruidoso.\n- Rebase: historial limpio y lineal, ideal para actualizar tu propia rama antes de un PR, pero reescribe commits.\n\n**La regla de oro del rebase:** nunca hagas rebase de commits que otras personas ya tienen (por ejemplo, commits subidos a una rama compartida como `main`). Sus copias siguen teniendo los commits antiguos, y todos terminan con historiales duplicados y en conflicto. Haz rebase solo de tus ramas locales o personales.",
    related: ['merge', 'rebase', 'rebase-interactive', 'pull', 'push', 'log'],
    keywords: ['merge vs rebase', 'fast-forward', 'merge commit', 'historial lineal', 'regla de oro', 'reescribir historial', 'no-ff'],
  },
  {
    id: 'remote',
    title: "Remotos, origin y ramas de seguimiento remoto",
    body:
      "Un **remoto** es otra copia del repositorio con la que te sincronizas, normalmente en un servidor como GitHub. Cuando clonas, git llama automáticamente **origin** al remoto desde el que clonaste. `git remote -v` lista tus remotos y sus URLs.\n\nTu repositorio guarda **ramas de seguimiento remoto** (remote-tracking branches) como `origin/main`: marcadores de solo lectura que recuerdan dónde estaban las ramas del remoto **la última vez que hablaste con él**. No se actualizan solas; solo `git fetch` (o `git pull`, que hace fetch primero) las refresca.\n\nUna rama local puede tener un **upstream**: la rama remota a la que está vinculada (por ejemplo, `main` sigue a `origin/main`). Ese vínculo te permite escribir solo `git push` o `git pull`, y es lo que hace que `git status` diga \"Your branch is ahead of 'origin/main' by 2 commits\". Lo configuras la primera vez que subes una rama con `git push -u origin feature/login`.\n\n- `git fetch` descarga los commits nuevos y actualiza `origin/*`. **No** toca tus ramas ni tus archivos, así que siempre es seguro.\n- `git pull` es `fetch` + integrar (merge o rebase) en tu rama actual, así que sí cambia tu rama.\n- `git push` sube tus commits y mueve la rama en el remoto.\n\nAnalogía: `origin/main` es una foto del remoto tomada la última vez que lo miraste. `fetch` toma una foto nueva; `pull` toma la foto y además actualiza tu propia copia para que coincida.",
    related: ['remote', 'fetch', 'pull', 'push', 'clone', 'branch'],
    keywords: ['remoto', 'origin', 'upstream', 'origin/main', 'rama de seguimiento remoto', 'fetch vs pull', 'adelantado atrasado'],
  },
  {
    id: 'conflicts',
    title: "Conflictos",
    body:
      "Un **conflicto** ocurre cuando git tiene que combinar dos cambios (en un merge, rebase, cherry-pick, revert o `git stash pop`) y ambos lados cambiaron las **mismas líneas** de un archivo, o un lado editó un archivo que el otro borró. Git no adivina: se detiene y te pide que decidas.\n\nLos conflictos son normales, no una señal de que rompiste algo. Git combina solo todo lo que puede y marca únicamente las partes que no pudo. Dentro del archivo vas a ver:\n\n- `<<<<<<< HEAD`: inicio de la versión del lado actual\n- `=======`: separador entre las dos versiones\n- `>>>>>>> feature/login`: fin de la versión que llega\n\nPara resolverlo: edita el archivo hasta dejar la versión que quieres (un lado, el otro o una combinación), borra todos los marcadores, haz `git add` del archivo para marcarlo como resuelto y continúa la operación (`git merge --continue` o `git commit`, `git rebase --continue`, `git cherry-pick --continue`).\n\n- `git status` siempre te dice qué archivos siguen en conflicto y qué operación está en curso.\n- **ours** / **theirs**: en un merge, ours = tu rama actual y theirs = la que estás integrando. Durante un rebase están invertidos (ours = la rama sobre la que haces rebase).\n- ¿Te perdiste? `git merge --abort` o `git rebase --abort` te devuelve a como estaba todo antes de empezar.\n\nPara tener menos conflictos: trae `main` a tu rama seguido, mantén las ramas cortas y evita reformatear archivos completos que otras personas también están editando.",
    related: ['merge', 'rebase', 'status', 'add', 'checkout', 'restore', 'diff'],
    keywords: ['conflicto', 'conflicto de merge', 'marcadores de conflicto', 'resolver conflicto', 'ours', 'theirs', 'both modified'],
  },
];
