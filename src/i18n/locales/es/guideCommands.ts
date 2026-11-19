import type { GuideCommand } from '../../../content/types';

export const guideCommands: GuideCommand[] = [
  // ------------------------------------------------------------------ setup
  {
    id: 'config',
    command: 'git config',
    category: 'setup',
    level: 1,
    summary: 'Configura tu nombre, tu email y otras preferencias que usa git.',
    description:
      'Antes de tu primer commit, git necesita saber quién eres: cada commit guarda el nombre y el email de su autor. `git config` lee y escribe esa configuración, junto con muchas otras preferencias (editor por defecto, alias, cómo se comporta `git pull`...).\n\n' +
      'La configuración existe en tres niveles, y gana el más específico:\n\n' +
      '- `--system`: todos los usuarios del computador\n' +
      '- `--global`: tu usuario (lo más común), guardado en `~/.gitconfig`\n' +
      '- `--local`: solo el repositorio actual (es el nivel por defecto cuando estás dentro de uno), guardado en `.git/config`\n\n' +
      'Normalmente configuras tu identidad una sola vez con `--global` y te olvidas. Usa un valor local cuando un proyecto necesite algo distinto, por ejemplo tu email del trabajo en un repositorio de la empresa.',
    syntax: [
      'git config --global <clave> "<valor>"',
      'git config <clave>',
      'git config --list --show-origin',
      'git config --global --unset <clave>',
      'git config --global --edit',
    ],
    examples: [
      {
        code: 'git config --global user.name "Ada Lovelace"',
        explanation: 'Define el nombre de autor que aparecerá en todos tus commits.',
      },
      {
        code: 'git config --global user.email "ada@example.com"',
        explanation:
          'Define el email de autor. Usa el mismo email de tu cuenta de GitHub/GitLab para que tus commits queden asociados a tu perfil.',
      },
      {
        code: 'git config --global init.defaultBranch main',
        explanation:
          'Los repositorios nuevos creados con `git init` partirán en una rama llamada `main` en vez de `master`.',
      },
      {
        code: 'git config --global pull.rebase false',
        explanation:
          'Le indica a `git pull` que haga merge cuando tu rama y la remota se hayan separado (y evita que git te lo pregunte cada vez).',
      },
      {
        code: 'git config --global core.editor "code --wait"',
        explanation: 'Usa VS Code para escribir los mensajes de commit y editar los rebases interactivos.',
      },
      {
        code: 'git config --list --show-origin',
        explanation:
          'Muestra toda la configuración activa y el archivo de donde viene cada valor. Útil cuando algo no tiene el valor que esperas.',
      },
      {
        code: 'git config --global alias.st status',
        explanation: 'Crea un alias: así `git st` ejecuta `git status`.',
      },
    ],
    tips: [
      'Ejecuta `git config user.email` dentro de un repositorio para ver qué email se usará realmente ahí (un valor local tiene prioridad sobre el global).',
      'Un alias útil para ver el historial compacto: `git config --global alias.lg "log --oneline --graph --all"`, y luego solo escribe `git lg`.',
      'Tu nombre y tu email no son un login: son solo texto que queda estampado en cada commit. La autenticación con GitHub se maneja aparte (llaves SSH o un administrador de credenciales).',
    ],
    related: ['init', 'commit', 'pull'],
    keywords: ['configurar', 'nombre', 'email', 'correo', 'identidad', 'alias', 'ajustes', 'preferencias'],
  },
  {
    id: 'init',
    command: 'git init',
    category: 'setup',
    level: 1,
    summary: 'Crea un repositorio git nuevo y vacío en la carpeta actual.',
    description:
      '`git init` convierte una carpeta común en un repositorio git creando dentro una carpeta oculta llamada `.git`. Esa carpeta **es** el repositorio: guarda todos los commits, ramas y configuración. Tus archivos se quedan exactamente donde están; simplemente git pasa a poder seguirles la pista.\n\n' +
      'Úsalo cuando empiezas un proyecto desde cero, o cuando tienes un proyecto que todavía no está bajo control de versiones. Si el proyecto ya existe en GitHub u otro servidor, usa `git clone`.\n\n' +
      'Después de `git init` todavía no se sigue ningún archivo: tienes que hacer `git add` de tus archivos y crear el primer `git commit`.',
    syntax: ['git init', 'git init <carpeta>', 'git init -b <rama>'],
    examples: [
      {
        code: 'git init',
        explanation: 'Convierte la carpeta actual en un repositorio git.',
      },
      {
        code: 'git init my-project',
        explanation: 'Crea la carpeta `my-project` (si no existe) e inicializa un repositorio dentro.',
      },
      {
        code: 'git init -b main',
        explanation: 'Inicializa el repositorio usando `main` como nombre de la primera rama.',
      },
      {
        code: 'git init --bare server-repo.git',
        explanation:
          'Crea un repositorio "bare" (desnudo): solo el historial, sin archivos de trabajo. Es el tipo de repositorio que usan los servidores como remoto compartido.',
      },
    ],
    tips: [
      'Ejecutar `git init` en una carpeta que ya es repositorio es seguro: no borra nada.',
      'Cuidado con ejecutarlo por error en tu carpeta de usuario o en la raíz de un disco: git trataría todo lo que hay debajo como un único repositorio gigante. Si te pasa, basta con borrar esa carpeta `.git` que quedó de más.',
      'Crea pronto un archivo `.gitignore` para dejar fuera del repositorio cosas como `node_modules/`, los archivos compilados o `.env`.',
    ],
    related: ['clone', 'config', 'add', 'commit'],
    keywords: ['crear repositorio', 'repo nuevo', 'empezar proyecto', 'inicializar', 'control de versiones', 'gitignore'],
  },
  {
    id: 'clone',
    command: 'git clone',
    category: 'setup',
    level: 1,
    summary: 'Descarga una copia completa de un repositorio existente.',
    description:
      '`git clone` copia a tu computador un repositorio que está en otro lugar (normalmente GitHub, GitLab o un servidor de la empresa). Obtienes todos los archivos **y** todo el historial: cada commit y cada rama.\n\n' +
      'Además deja todo configurado: el origen queda guardado como un remoto llamado `origin`, y la rama por defecto (por ejemplo `main`) queda activa y conectada con `origin/main`, así que `git pull` y `git push` funcionan de inmediato.\n\n' +
      'Úsalo cada vez que quieras trabajar en un proyecto que ya existe. Solo se clona una vez; después te mantienes al día con `git pull` o `git fetch`.',
    syntax: [
      'git clone <url>',
      'git clone <url> <carpeta>',
      'git clone --branch <rama> <url>',
      'git clone --depth 1 <url>',
    ],
    examples: [
      {
        code: 'git clone https://github.com/vitejs/vite.git',
        explanation: 'Clona el repositorio en una carpeta nueva llamada `vite`.',
      },
      {
        code: 'git clone git@github.com:my-user/my-app.git',
        explanation: 'Clona usando SSH (requiere tener una llave SSH agregada a tu cuenta).',
      },
      {
        code: 'git clone https://github.com/my-user/my-app.git app',
        explanation: 'Clona en una carpeta llamada `app` en vez de `my-app`.',
      },
      {
        code: 'git clone --branch develop https://github.com/my-user/my-app.git',
        explanation: 'Clona y deja activa la rama `develop` en lugar de la rama por defecto.',
      },
      {
        code: 'git clone --depth 1 https://github.com/torvalds/linux.git',
        explanation:
          'Clon superficial: solo el último commit, sin el historial. Mucho más rápido en repositorios enormes cuando solo necesitas el código.',
      },
    ],
    tips: [
      'Las URLs HTTPS son lo más fácil para empezar; las URLs SSH (`git@github.com:...`) te evitan escribir credenciales una vez que configuras tu llave.',
      'Clona en una carpeta normal, no dentro de otro repositorio, y luego entra con `cd` a la carpeta nueva antes de usar otros comandos de git.',
      'Localmente solo se crea la rama por defecto, pero se descargan todas las ramas remotas. `git switch <nombre>` crea automáticamente una rama local a partir de `origin/<nombre>`.',
    ],
    related: ['init', 'remote', 'pull', 'fetch'],
    keywords: ['descargar', 'copiar repositorio', 'bajar proyecto', 'github', 'ssh', 'https'],
  },

  // ----------------------------------------------------------------- basics
  {
    id: 'status',
    command: 'git status',
    category: 'basics',
    level: 1,
    summary: 'Muestra qué cambió: archivos modificados, en staging y sin seguimiento.',
    description:
      '`git status` es tu panel de control. Te dice en qué rama estás, cómo se compara con su rama remota y el estado de cada archivo modificado. Úsalo todo el tiempo: antes de agregar, antes de hacer commit y siempre que no tengas claro qué está pasando.\n\n' +
      'Los archivos aparecen agrupados en tres secciones:\n\n' +
      '- **Changes to be committed**: archivos en el staging area, que entrarán en el próximo commit\n' +
      '- **Changes not staged for commit**: archivos con seguimiento que modificaste pero aún no agregaste\n' +
      '- **Untracked files**: archivos nuevos que git todavía no sigue\n\n' +
      'Durante un merge, rebase o cherry-pick, `git status` también te dice qué operación está en curso, qué archivos tienen conflictos y qué comando ejecutar a continuación.',
    syntax: ['git status', 'git status -s', 'git status -sb', 'git status --ignored'],
    examples: [
      {
        code: 'git status',
        explanation: 'Salida completa y explicada, con sugerencias de lo que puedes hacer después.',
      },
      {
        code: 'git status -s',
        explanation:
          'Formato corto, una línea por archivo: `M` = modificado, `A` = agregado, `??` = sin seguimiento. La columna izquierda es el staging area y la derecha tu directorio de trabajo.',
      },
      {
        code: 'git status -sb',
        explanation: 'Formato corto más la línea de la rama, por ejemplo `## main...origin/main [ahead 2]`.',
      },
      {
        code: 'git status --ignored',
        explanation: 'También muestra los archivos que se están ignorando por el `.gitignore`.',
      },
    ],
    tips: [
      'Lee las sugerencias: `git status` muchas veces muestra el comando exacto para deshacer o continuar, como `use "git restore --staged <file>..." to unstage`.',
      "\"Your branch is ahead of 'origin/main' by 2 commits\" significa que tienes commits locales que todavía no subes con push. Esta información de adelantado/atrasado es tan reciente como tu último `git fetch`.",
    ],
    related: ['add', 'diff', 'commit', 'restore'],
    keywords: ['qué cambió', 'estado', 'archivos modificados', 'sin seguimiento', 'staging', 'rama actual', 'revisar'],
  },
  {
    id: 'add',
    command: 'git add',
    category: 'basics',
    level: 1,
    summary: 'Agrega cambios al staging area, listos para el próximo commit.',
    description:
      'Git no guarda automáticamente todo lo que cambiaste. Primero eliges qué entra en el próximo commit agregándolo al **staging area** (también llamado índice). `git add` hace exactamente eso: toma una foto del archivo tal como está en ese momento y lo deja preparado.\n\n' +
      'Esto te permite armar commits ordenados: si arreglaste un bug y además ajustaste unos estilos, puedes agregarlos y hacer commit por separado.\n\n' +
      'Importante: `git add` prepara el contenido **de ese momento**. Si vuelves a editar el archivo después, tienes que agregarlo de nuevo para incluir los cambios nuevos.\n\n' +
      '`git add` también sirve para empezar a seguir un archivo nuevo, y para marcar un conflicto como resuelto durante un merge o un rebase.',
    syntax: ['git add <archivo>...', 'git add <carpeta>', 'git add .', 'git add -A', 'git add -p'],
    examples: [
      {
        code: 'git add index.html',
        explanation: 'Agrega un solo archivo al staging area.',
      },
      {
        code: 'git add src/components/',
        explanation: 'Agrega todo lo que cambió dentro de esa carpeta.',
      },
      {
        code: 'git add .',
        explanation:
          'Agrega todos los cambios (archivos nuevos, modificados y eliminados) de la carpeta actual y sus subcarpetas.',
      },
      {
        code: 'git add -A',
        explanation: 'Agrega todos los cambios de todo el repositorio, sin importar en qué carpeta estés.',
      },
      {
        code: 'git add -p',
        explanation:
          'Modo interactivo: te muestra cada cambio ("hunk") y te pregunta si agregarlo (`y`/`n`, `s` para dividirlo en partes más chicas). Ideal para separar tu trabajo en varios commits.',
      },
      {
        code: 'git add "*.css"',
        explanation:
          'Agrega todos los archivos CSS. Las comillas hacen que sea git quien expanda el patrón, así que también encuentra archivos en subcarpetas.',
      },
    ],
    tips: [
      'Ejecuta `git status` o `git diff --staged` antes del commit para revisar bien qué preparaste.',
      'Para sacar algo del staging area sin perder tus cambios, usa `git restore --staged <archivo>`.',
      'Los archivos que están en `.gitignore` se omiten con `git add .`, que es justo lo que quieres para cosas como `node_modules/` o `.env`.',
    ],
    related: ['status', 'commit', 'restore', 'diff', 'rm'],
    keywords: ['preparar', 'staging', 'índice', 'preparar commit', 'seguir archivo', 'incluir cambios', 'agregar archivo'],
  },
  {
    id: 'commit',
    command: 'git commit',
    category: 'basics',
    level: 1,
    summary: 'Guarda en el historial una foto de los cambios en staging.',
    description:
      'Un commit es una foto guardada de tu proyecto, con un mensaje que explica qué cambió y por qué. `git commit` toma lo que hay en el staging area y lo registra como un commit nuevo en la rama actual. Cada commit tiene un identificador único (un hash como `a1b2c3d`), un autor, una fecha y un enlace a su commit padre; juntos forman el historial.\n\n' +
      'Solo se incluyen los cambios en staging. Lo que no agregaste con `git add` se queda intacto en tu directorio de trabajo para un commit posterior.\n\n' +
      'Buenos hábitos:\n\n' +
      '- Haz commits pequeños que hagan una sola cosa\n' +
      '- Escribe una línea de resumen corta (unos 50 caracteres) que diga qué hace el cambio, por ejemplo "Agregar formulario de login" o, en inglés, "Add login form"\n' +
      '- Si necesitas más detalle, deja una línea en blanco después del resumen y explica el porqué',
    syntax: [
      'git commit -m "<mensaje>"',
      'git commit',
      'git commit -a -m "<mensaje>"',
      'git commit -m "<título>" -m "<cuerpo>"',
      'git commit --amend',
    ],
    examples: [
      {
        code: 'git commit -m "Add login form"',
        explanation: 'Crea un commit con los cambios en staging y un mensaje de una línea.',
      },
      {
        code: 'git commit',
        explanation:
          'Abre tu editor para que escribas un mensaje más largo (título, línea en blanco, cuerpo). Al guardar y cerrar el editor se crea el commit.',
      },
      {
        code: 'git commit -am "Fix typo in README"',
        explanation:
          'Agrega todos los archivos **con seguimiento** que modificaste y hace el commit en un solo paso. Los archivos nuevos (sin seguimiento) no se incluyen.',
      },
      {
        code: 'git commit -m "Fix cart total" -m "Discounts were applied twice when a coupon was used."',
        explanation:
          'Cada `-m` se convierte en un párrafo distinto: el primero es el título y el segundo el cuerpo.',
      },
      {
        code: 'git commit --allow-empty -m "Trigger CI"',
        explanation: 'Crea un commit sin cambios; a veces se usa para volver a ejecutar un pipeline de CI.',
      },
    ],
    tips: [
      'Si se abrió Vim y quedaste atrapado: presiona `Esc`, escribe `:wq` y Enter para guardar y salir (o `:q!` para salir sin hacer el commit).',
      '¿Olvidaste un archivo o te equivocaste en el mensaje? Si todavía no haces push, `git commit --amend` arregla el último commit.',
      'Haz commits seguido. Son baratos, y los commits pequeños son mucho más fáciles de revisar, revertir o copiar con cherry-pick después.',
    ],
    related: ['add', 'status', 'commit-amend', 'log', 'diff'],
    keywords: ['guardar', 'foto', 'registrar cambios', 'mensaje', 'punto de control', 'versión'],
  },
  {
    id: 'diff',
    command: 'git diff',
    category: 'basics',
    level: 1,
    summary: 'Muestra exactamente qué líneas cambiaron.',
    description:
      '`git diff` muestra los cambios línea por línea: las líneas que empiezan con `-` se eliminaron y las que empiezan con `+` se agregaron. Úsalo para revisar tu trabajo antes de prepararlo o hacer commit.\n\n' +
      'Lo que ves depende de qué comparas:\n\n' +
      '- `git diff`: directorio de trabajo vs staging area (cambios que aún no agregas)\n' +
      '- `git diff --staged`: staging area vs último commit (lo que entrará en el próximo commit)\n' +
      '- `git diff HEAD`: todo lo que cambió desde el último commit, esté en staging o no\n' +
      '- `git diff <a> <b>`: dos commits o ramas cualquiera\n\n' +
      'Si `git diff` no muestra nada pero sabes que cambiaste algo, probablemente esos cambios ya están en staging: prueba con `git diff --staged`.',
    syntax: [
      'git diff',
      'git diff --staged',
      'git diff <commit> <commit>',
      'git diff <rama>...<rama>',
      'git diff <commit> -- <archivo>',
    ],
    examples: [
      {
        code: 'git diff',
        explanation: 'Cambios que no están en staging, en todos los archivos.',
      },
      {
        code: 'git diff --staged',
        explanation: 'Lo que preparaste y entrará en el commit (`--cached` significa lo mismo).',
      },
      {
        code: 'git diff HEAD~1 HEAD',
        explanation: 'Los cambios que introdujo el último commit.',
      },
      {
        code: 'git diff main feature/login',
        explanation: 'Diferencias entre los últimos commits de dos ramas.',
      },
      {
        code: 'git diff main...feature/login',
        explanation:
          'Solo lo que cambió en `feature/login` desde que se separó de `main`: lo que mostraría un pull request.',
      },
      {
        code: 'git diff --stat',
        explanation: 'Un resumen de qué archivos cambiaron y cuántas líneas, sin el detalle.',
      },
      {
        code: 'git diff HEAD -- src/app.ts',
        explanation:
          'Cambios en un solo archivo desde el último commit. El `--` separa los commits de las rutas de archivos.',
      },
    ],
    tips: [
      'Presiona `q` para salir cuando el diff es largo; usa las flechas o la barra espaciadora para desplazarte.',
      '`git diff --word-diff` resalta las palabras que cambiaron en vez de líneas completas, útil para texto y líneas largas.',
      'Los archivos nuevos sin seguimiento no aparecen en `git diff` hasta que les haces `git add`.',
    ],
    related: ['status', 'add', 'show', 'log'],
    keywords: ['cambios', 'comparar', 'diferencias', 'qué cambió', 'líneas', 'revisar'],
  },
  {
    id: 'log',
    command: 'git log',
    category: 'basics',
    level: 1,
    summary: 'Recorre el historial de commits.',
    description:
      '`git log` lista los commits empezando por el más reciente, con el hash, autor, fecha y mensaje de cada uno. Así averiguas qué pasó, cuándo y quién lo hizo, y de ahí sacas los identificadores de commit que necesitan otros comandos (`show`, `revert`, `reset`, `cherry-pick`...).\n\n' +
      'Por defecto muestra el historial de la rama actual. Puedes filtrar por autor, fecha, mensaje, archivo o contenido, y usar `--oneline --graph` para ver las ramas y los merges dibujados como diagrama.',
    syntax: [
      'git log',
      'git log --oneline --graph --all',
      'git log -n <cantidad>',
      'git log <rama>..<rama>',
      'git log -- <archivo>',
      'git log -S "<texto>"',
    ],
    examples: [
      {
        code: 'git log --oneline',
        explanation: 'Un commit por línea: hash corto y mensaje.',
      },
      {
        code: 'git log --oneline --graph --all',
        explanation:
          'Dibuja todas las ramas y sus merges como un gráfico de texto. La vista más útil para entender la forma del historial.',
      },
      {
        code: 'git log -3',
        explanation: 'Solo los últimos 3 commits.',
      },
      {
        code: 'git log main..feature/login',
        explanation: 'Commits que están en `feature/login` pero todavía no en `main`.',
      },
      {
        code: 'git log -p -- src/app.ts',
        explanation: 'El historial de un solo archivo, incluyendo el diff de cada commit.',
      },
      {
        code: 'git log --author="Ada" --since="2 weeks ago"',
        explanation: 'Commits de Ada en las últimas dos semanas.',
      },
      {
        code: 'git log -S "calculateTotal"',
        explanation:
          'Commits que agregaron o eliminaron el texto `calculateTotal`: ideal para saber cuándo apareció o desapareció una función.',
      },
    ],
    tips: [
      'Presiona `q` para salir del log, espacio para avanzar una página y `/` para buscar dentro.',
      '`git log origin/main..HEAD` muestra los commits que estás a punto de subir con push.',
      'Los commits que "perdiste" con un reset o un rebase ya no aparecen aquí; búscalos en `git reflog`.',
    ],
    related: ['show', 'diff', 'reflog', 'blame'],
    keywords: ['historial', 'commits', 'cambios anteriores', 'quién cambió', 'línea de tiempo', 'gráfico'],
  },
  {
    id: 'show',
    command: 'git show',
    category: 'basics',
    level: 1,
    summary: 'Muestra los detalles de un commit y los cambios que introdujo.',
    description:
      '`git show` muestra un objeto en detalle. Para un commit, eso significa sus datos (autor, fecha, mensaje) seguidos del diff completo de lo que cambió. Sin argumentos muestra el último commit (`HEAD`).\n\n' +
      'También puede mostrar un archivo exactamente como estaba en cualquier commit o rama, lo que sirve para ver una versión antigua sin tener que cambiarte a ella.',
    syntax: [
      'git show',
      'git show <commit>',
      'git show --stat <commit>',
      'git show <commit>:<archivo>',
      'git show <tag>',
    ],
    examples: [
      {
        code: 'git show',
        explanation: 'El último commit y sus cambios.',
      },
      {
        code: 'git show a1b2c3d',
        explanation: 'Un commit específico, identificado por su hash (corto).',
      },
      {
        code: 'git show HEAD~2',
        explanation: 'El commit que está dos pasos antes del actual.',
      },
      {
        code: 'git show --stat HEAD',
        explanation: 'Solo la lista de archivos que cambiaron en el último commit, con la cantidad de líneas.',
      },
      {
        code: 'git show main:package.json',
        explanation: 'El contenido de `package.json` tal como está en `main`, sin cambiar de rama.',
      },
      {
        code: 'git show v1.0.0',
        explanation: 'Información del tag y del commit al que apunta.',
      },
    ],
    tips: [
      '`HEAD~1` (o `HEAD~`) es el padre del commit actual, `HEAD~2` el abuelo, y así sucesivamente.',
      'Guarda en disco una versión antigua de un archivo: `git show HEAD~3:config.json > old-config.json`.',
    ],
    related: ['log', 'diff', 'tag', 'blame'],
    keywords: ['inspeccionar commit', 'detalles', 'ver cambios', 'versión antigua', 'archivo en un commit'],
  },
  {
    id: 'rm',
    command: 'git rm',
    category: 'basics',
    level: 1,
    summary: 'Elimina un archivo y prepara la eliminación, o deja de seguirlo.',
    description:
      '`git rm` borra un archivo de tu directorio de trabajo **y** deja esa eliminación en staging, así el próximo commit registra que el archivo se eliminó. Es lo mismo que borrar el archivo a mano y después hacer `git add` sobre él.\n\n' +
      'Con `--cached` hace algo distinto y muy útil: deja de seguir el archivo (desaparece del repositorio en el próximo commit) pero **lo mantiene en tu disco**. Es la solución cuando hiciste commit por error de algo que debía ignorarse, como `.env` o `node_modules/`.',
    syntax: [
      'git rm <archivo>',
      'git rm -r <carpeta>',
      'git rm --cached <archivo>',
      'git rm -r --cached <carpeta>',
    ],
    examples: [
      {
        code: 'git rm old-script.js',
        explanation: 'Borra el archivo y deja la eliminación en staging.',
      },
      {
        code: 'git rm -r docs/drafts',
        explanation: 'Borra una carpeta completa (`-r` = recursivo).',
      },
      {
        code: 'git rm --cached .env',
        explanation:
          'Deja de seguir `.env` pero conserva tu copia local. Agrégalo después a `.gitignore` para que no vuelva a colarse.',
      },
      {
        code: 'git rm -r --cached node_modules',
        explanation:
          'Saca del repositorio una carpeta `node_modules` que se subió por error, pero la mantiene en tu computador.',
      },
    ],
    tips: [
      'Git se niega a eliminar un archivo con cambios sin commit, para proteger tu trabajo. `-f` lo fuerza, pero piénsalo dos veces.',
      'Si ya borraste un archivo a mano, `git add <archivo>` (o `git add -A`) también prepara la eliminación.',
      '`--cached` solo quita el archivo de los commits futuros: sigue estando en los antiguos. Si contenía una contraseña o API key, considérala filtrada y cámbiala.',
    ],
    related: ['mv', 'add', 'status', 'restore'],
    keywords: ['borrar archivo', 'eliminar', 'dejar de seguir', 'quitar del repositorio', 'gitignore', 'sacar archivo'],
  },
  {
    id: 'mv',
    command: 'git mv',
    category: 'basics',
    level: 1,
    summary: 'Renombra o mueve un archivo y prepara el cambio.',
    description:
      '`git mv` renombra o mueve un archivo con seguimiento y deja el cambio en staging en un solo paso. Es un atajo para mover el archivo tú mismo y luego hacer `git rm` de la ruta antigua y `git add` de la nueva.\n\n' +
      'En realidad git no guarda los renombres: los detecta comparando contenidos. Así que `git mv` y mover el archivo a mano terminan igual; `git mv` solo te ahorra pasos. Donde de verdad ayuda es al cambiar solo mayúsculas y minúsculas de un nombre (`readme.md` a `README.md`) en Windows o macOS, cuyos sistemas de archivos no las distinguen.',
    syntax: ['git mv <origen> <destino>', 'git mv <archivo>... <carpeta>'],
    examples: [
      {
        code: 'git mv app.js main.js',
        explanation: 'Renombra `app.js` a `main.js` y deja el cambio en staging.',
      },
      {
        code: 'git mv utils.ts src/lib/',
        explanation: 'Mueve el archivo a la carpeta `src/lib/`.',
      },
      {
        code: 'git mv readme.md README.md',
        explanation:
          'Cambia solo las mayúsculas, algo que puede confundir a git en sistemas que no distinguen mayúsculas si lo haces a mano.',
      },
    ],
    tips: [
      '`git log --follow -- <archivo>` muestra el historial de un archivo incluso a través de renombres.',
      'Evita renombrar y editar mucho un archivo en el mismo commit: git podría dejar de reconocerlo como un renombre.',
    ],
    related: ['rm', 'add', 'status'],
    keywords: ['renombrar', 'mover archivo', 'cambiar nombre', 'reubicar', 'mayúsculas'],
  },

  // -------------------------------------------------------------- branching
  {
    id: 'branch',
    command: 'git branch',
    category: 'branching',
    level: 1,
    summary: 'Lista, crea, renombra y elimina ramas.',
    description:
      'Una rama (branch) es una etiqueta móvil que apunta a un commit. Cuando haces commit, la rama actual avanza al commit nuevo. Las ramas te permiten trabajar en una funcionalidad o un arreglo de forma aislada, sin tocar `main`, y después incorporar ese trabajo con un merge o un rebase.\n\n' +
      '`git branch` administra esas etiquetas. Sin argumentos lista tus ramas locales (la actual aparece marcada con `*`). Ojo: `git branch <nombre>` crea una rama pero **no** te cambia a ella; para crearla y moverte de una vez, usa `git switch -c <nombre>`.\n\n' +
      'En git las ramas son baratísimas (crear una solo escribe el identificador de un commit en un archivo pequeño), así que úsalas sin miedo.',
    syntax: [
      'git branch',
      'git branch <nombre>',
      'git branch -m <antiguo> <nuevo>',
      'git branch -d <rama>',
      'git branch -a',
      'git branch -u <remoto>/<rama>',
    ],
    examples: [
      {
        code: 'git branch',
        explanation: 'Lista las ramas locales; `*` marca la rama en la que estás.',
      },
      {
        code: 'git branch -a',
        explanation: 'También lista las ramas remotas, como `remotes/origin/main`.',
      },
      {
        code: 'git branch -vv',
        explanation:
          'Muestra el último commit de cada rama y su upstream (la rama remota asociada), con cuántos commits va adelantada o atrasada.',
      },
      {
        code: 'git branch feature/search',
        explanation: 'Crea la rama en el commit actual, pero te quedas donde estás.',
      },
      {
        code: 'git branch -m master main',
        explanation: 'Renombra `master` a `main`. Con un solo nombre, renombra la rama actual.',
      },
      {
        code: 'git branch -d feature/search',
        explanation:
          'Elimina una rama que ya fue integrada con merge. Git se niega si tiene trabajo sin integrar.',
      },
      {
        code: 'git branch -D experiment',
        explanation: 'Fuerza la eliminación de una rama aunque sus commits no estén integrados en ninguna parte.',
      },
    ],
    tips: [
      '`git branch --merged` lista las ramas ya integradas en la actual: candidatas seguras para limpiar.',
      'Borrar una rama local no la borra en el servidor; para eso usa `git push origin --delete <rama>`.',
      'Usa nombres descriptivos con prefijos, como `feature/login`, `fix/cart-total` o `docs/readme`.',
    ],
    warning:
      '`git branch -D` elimina una rama aunque sus commits no existan en ningún otro lado. Normalmente puedes recuperarlos por un tiempo con `git reflog`, pero mejor no confiarse.',
    related: ['switch', 'checkout', 'merge', 'push'],
    keywords: ['crear rama', 'borrar rama', 'renombrar rama', 'listar ramas', 'branch', 'limpiar ramas'],
  },
  {
    id: 'switch',
    command: 'git switch',
    category: 'branching',
    level: 1,
    summary: 'Cámbiate a otra rama, o crea una y cámbiate a ella.',
    description:
      '`git switch` cambia la rama en la que estás trabajando. Actualiza los archivos de tu carpeta para que coincidan con esa rama y mueve `HEAD` (el marcador de "estás aquí" de git) hacia ella, así los commits nuevos irán a esa rama.\n\n' +
      'Se agregó en git 2.23 para hacerse cargo de la parte de ramas del antiguo y sobrecargado `git checkout`. Es más claro y más seguro, por eso hoy es la forma recomendada de cambiar de rama.\n\n' +
      'Si tienes cambios sin commit que el cambio de rama sobrescribiría, git se detiene y te avisa. Primero haz commit, guárdalos con `git stash` o descártalos. Los cambios que no generan conflicto simplemente te acompañan a la nueva rama.',
    syntax: [
      'git switch <rama>',
      'git switch -c <rama-nueva>',
      'git switch -c <rama-nueva> <punto-de-partida>',
      'git switch -',
      'git switch --detach <commit>',
    ],
    examples: [
      {
        code: 'git switch main',
        explanation: 'Te cambia a la rama `main`.',
      },
      {
        code: 'git switch -c feature/login',
        explanation: 'Crea `feature/login` a partir del commit actual y te cambia a ella.',
      },
      {
        code: 'git switch -c hotfix/header origin/main',
        explanation: 'Crea una rama nueva que parte desde `origin/main` en vez de desde donde estás.',
      },
      {
        code: 'git switch -',
        explanation: 'Vuelve a la rama anterior, como `cd -` en la terminal.',
      },
      {
        code: 'git switch feature/payments',
        explanation:
          'Si la rama solo existe en el remoto (`origin/feature/payments`), git crea una rama local que la sigue.',
      },
      {
        code: 'git switch --detach v1.2.0',
        explanation:
          'Te mueve al commit de un tag sin estar en ninguna rama ("detached HEAD"), para revisar o probar una versión antigua.',
      },
    ],
    tips: [
      'Equivalencias con el comando antiguo: `git switch <rama>` = `git checkout <rama>`, y `git switch -c <rama>` = `git checkout -b <rama>`.',
      'Si hiciste commits en detached HEAD y quieres conservarlos, crea una rama ahí mismo: `git switch -c <nombre>`.',
      '¿Empezaste a trabajar en la rama equivocada? `git switch -c <nombre>` se lleva tus cambios sin commit a una rama nueva.',
    ],
    related: ['branch', 'checkout', 'stash', 'restore'],
    keywords: ['cambiar de rama', 'ir a una rama', 'crear rama', 'moverse de rama', 'detached head', 'saltar'],
  },
  {
    id: 'checkout',
    command: 'git checkout',
    category: 'branching',
    level: 2,
    summary: 'El clásico comando todo en uno: cambia de rama o restaura archivos.',
    description:
      '`git checkout` es el comando original tanto para cambiar de rama como para restaurar archivos. Como hacía demasiadas cosas distintas (y un pequeño error al escribirlo podía descartar tu trabajo), git 2.23 lo dividió en `git switch` (ramas) y `git restore` (archivos). `checkout` sigue funcionando y lo verás en todas partes: tutoriales, scripts y respuestas en internet, así que conviene reconocerlo.\n\n' +
      'Equivalencias:\n\n' +
      '- `git checkout <rama>` = `git switch <rama>`\n' +
      '- `git checkout -b <nueva>` = `git switch -c <nueva>`\n' +
      '- `git checkout <commit>` = `git switch --detach <commit>`\n' +
      '- `git checkout -- <archivo>` = `git restore <archivo>` (¡descarta cambios!)\n' +
      '- `git checkout <commit> -- <archivo>` = `git restore --source <commit> --staged --worktree <archivo>`\n\n' +
      'El `--` significa "lo que sigue son rutas de archivos", y evita ambigüedades cuando un archivo y una rama se llaman igual.',
    syntax: [
      'git checkout <rama>',
      'git checkout -b <rama-nueva> [<punto-de-partida>]',
      'git checkout <commit>',
      'git checkout -- <archivo>',
      'git checkout <commit> -- <archivo>',
    ],
    examples: [
      {
        code: 'git checkout main',
        explanation: 'Te cambia a `main` (igual que `git switch main`).',
      },
      {
        code: 'git checkout -b fix/navbar',
        explanation: 'Crea `fix/navbar` y te cambia a ella (igual que `git switch -c fix/navbar`).',
      },
      {
        code: 'git checkout a1b2c3d',
        explanation: 'Te mueve a un commit antiguo en estado "detached HEAD", para revisarlo.',
      },
      {
        code: 'git checkout -- src/app.ts',
        explanation:
          'Descarta los cambios sin staging de `src/app.ts` (igual que `git restore src/app.ts`).',
      },
      {
        code: 'git checkout main -- package.json',
        explanation: 'Reemplaza tu `package.json` por la versión de `main` y lo deja en staging.',
      },
    ],
    tips: [
      'En tu propio trabajo, prefiere `switch` y `restore`: sus nombres dicen lo que hacen y es más difícil usarlos mal.',
      '"Detached HEAD" solo significa que estás sobre un commit y no sobre una rama. Es inofensivo; crea una rama si quieres conservar los commits que hagas ahí.',
    ],
    warning:
      '`git checkout -- <archivo>` y `git checkout <commit> -- <archivo>` sobrescriben tus cambios locales en esos archivos sin preguntar, y git no puede recuperarlos.',
    related: ['switch', 'restore', 'branch'],
    keywords: ['cambiar de rama', 'descartar cambios', 'versión antigua', 'detached head', 'comando antiguo', 'restaurar archivo'],
  },
  {
    id: 'merge',
    command: 'git merge',
    category: 'branching',
    level: 2,
    summary: 'Une el historial de otra rama con la rama actual.',
    description:
      '`git merge <rama>` trae los commits de `<rama>` a la rama en la que estás. El flujo típico: terminas una funcionalidad en `feature/login`, te cambias a `main` y haces merge.\n\n' +
      'Git elige automáticamente una de dos formas:\n\n' +
      '- **Fast-forward** (avance rápido): si tu rama actual no se ha movido desde que se creó la otra, git simplemente adelanta la etiqueta hasta el último commit de la otra rama. No se crea ningún commit nuevo y el historial queda en línea recta.\n' +
      '- **Merge commit** (merge de tres vías): si ambas ramas tienen commits nuevos, git los combina y crea un commit especial con dos padres que une ambos historiales.\n\n' +
      'Usa `--no-ff` para crear siempre un merge commit, incluso cuando se podría hacer fast-forward; a algunos equipos les gusta porque deja marcado dónde empezó y terminó una funcionalidad. `--ff-only` es lo contrario: solo hace el merge si puede ser fast-forward, y si no, falla.\n\n' +
      'Los **conflictos** ocurren cuando ambas ramas cambiaron las mismas líneas (o una borró un archivo que la otra editó). Git pausa el merge y marca las zonas en conflicto dentro de los archivos con `<<<<<<<`, `=======` y `>>>>>>>`. La parte de arriba (`HEAD`, "ours") es tu rama actual; la de abajo ("theirs") es la rama que estás integrando. Para resolverlo:\n\n' +
      '- Ejecuta `git status` para ver los archivos en conflicto ("both modified")\n' +
      '- Edita cada uno, deja el código correcto y borra los marcadores\n' +
      '- Ejecuta `git add <archivo>` para marcarlo como resuelto\n' +
      '- Ejecuta `git commit` (o `git merge --continue`) para terminar el merge\n\n' +
      'Si te enredas, `git merge --abort` cancela el merge y deja todo como estaba antes de empezar.',
    syntax: [
      'git merge <rama>',
      'git merge --no-ff <rama>',
      'git merge --ff-only <rama>',
      'git merge --squash <rama>',
      'git merge --continue',
      'git merge --abort',
    ],
    examples: [
      {
        code: 'git merge feature/login',
        explanation: 'Integra `feature/login` en la rama actual (por ejemplo, `main`).',
      },
      {
        code: 'git merge --no-ff feature/login',
        explanation:
          'Crea siempre un merge commit, dejando la funcionalidad visible como un grupo en el historial.',
      },
      {
        code: 'git merge --ff-only origin/main',
        explanation:
          'Actualiza tu rama a `origin/main` solo si es un fast-forward limpio; si no, falla en vez de crear un merge commit.',
      },
      {
        code: 'git merge --squash feature/experiment',
        explanation:
          'Deja todos los cambios de la rama en el staging area sin hacer commit; luego `git commit` crea un único commit normal.',
      },
      {
        code: 'git restore --theirs src/config.ts',
        explanation:
          'Durante un conflicto, se queda con la versión completa del archivo que viene de la otra rama (`--ours` se queda con la tuya). Después haz `git add`.',
      },
      {
        code: 'git merge --continue',
        explanation: 'Después de resolver y agregar todos los archivos en conflicto, termina el merge.',
      },
      {
        code: 'git merge --abort',
        explanation: 'Cancela un merge con conflictos y vuelve al estado de antes del merge.',
      },
    ],
    tips: [
      'Antes de hacer merge, asegúrate de que tu directorio de trabajo esté limpio (`git status`) y de que la rama donde integras esté al día (`git pull`).',
      'Editores como VS Code muestran botones como "Accept Current" / "Accept Incoming" sobre los marcadores de conflicto, lo que facilita mucho resolverlos.',
      'Un merge nunca reescribe commits existentes, así que siempre es seguro en ramas compartidas.',
      '`git log --oneline --graph` muestra claramente si un merge fue fast-forward o creó un merge commit.',
    ],
    related: ['branch', 'switch', 'rebase', 'pull', 'revert'],
    keywords: ['combinar ramas', 'unir ramas', 'integrar', 'conflicto', 'fast-forward', 'merge commit', 'resolver conflictos', 'fusionar'],
  },

  // ------------------------------------------------------------------- undo
  {
    id: 'restore',
    command: 'git restore',
    category: 'undo',
    level: 1,
    summary: 'Descarta cambios en archivos o sácalos del staging area.',
    description:
      '`git restore` (git 2.23+) devuelve archivos a un estado anterior. Es el reemplazo moderno y específico de los usos de `git checkout` y `git reset <archivo>` relacionados con archivos.\n\n' +
      'Sus dos usos principales:\n\n' +
      '- `git restore <archivo>`: descarta tus cambios sin staging, devolviendo el archivo a su versión en staging (normalmente, la del último commit)\n' +
      '- `git restore --staged <archivo>`: saca el archivo del staging area (deshace un `git add`) pero conserva tus cambios en él\n\n' +
      'Con `--source <commit>` puedes recuperar un archivo tal como estaba en cualquier commit, por ejemplo para rescatar algo que borraste o rompiste hace varios commits.',
    syntax: [
      'git restore <archivo>...',
      'git restore .',
      'git restore --staged <archivo>...',
      'git restore --staged --worktree <archivo>',
      'git restore --source <commit> <archivo>',
    ],
    examples: [
      {
        code: 'git restore src/app.ts',
        explanation: 'Descarta los cambios sin staging de `src/app.ts`.',
      },
      {
        code: 'git restore .',
        explanation:
          'Descarta todos los cambios sin staging de la carpeta actual y sus subcarpetas. Los archivos sin seguimiento no se tocan (para eso está `git clean`).',
      },
      {
        code: 'git restore --staged src/app.ts',
        explanation: 'Saca el archivo del staging area; tus cambios se quedan en el archivo.',
      },
      {
        code: 'git restore --staged --worktree src/app.ts',
        explanation:
          'Lo saca del staging **y** descarta los cambios: el archivo vuelve a estar exactamente como en el último commit.',
      },
      {
        code: 'git restore --source HEAD~3 config.json',
        explanation:
          'Recupera `config.json` tal como estaba hace tres commits (solo en tu directorio de trabajo; revísalo y haz commit si quieres conservarlo).',
      },
      {
        code: 'git restore deleted-page.html',
        explanation: 'Recupera un archivo que ya estaba en un commit y que borraste por accidente.',
      },
    ],
    tips: [
      '`git status` muestra estos comandos junto a cada sección, así que no necesitas memorizarlos.',
      'Equivalencias antiguas: `git checkout -- <archivo>` = `git restore <archivo>`, y `git reset <archivo>` = `git restore --staged <archivo>`.',
    ],
    warning:
      '`git restore <archivo>` (sin `--staged`) elimina para siempre los cambios sin commit de ese archivo. Como nunca se guardaron en un commit, git no puede recuperarlos.',
    related: ['reset', 'checkout', 'clean', 'add', 'status'],
    keywords: ['descartar cambios', 'deshacer cambios', 'sacar del staging', 'volver atrás un archivo', 'recuperar archivo', 'botar cambios'],
  },
  {
    id: 'reset',
    command: 'git reset',
    category: 'undo',
    level: 2,
    summary: 'Mueve la rama actual a otro commit y, si quieres, descarta cambios.',
    description:
      '`git reset <commit>` mueve la rama actual (y `HEAD`) a otro commit, normalmente uno anterior, así que los commits posteriores desaparecen de la rama. Qué pasa con los cambios de esos commits depende del modo:\n\n' +
      '- `--soft`: solo mueve la rama. Los cambios de los commits deshechos quedan **en staging**, listos para volver a hacer commit. Perfecto para juntar tus últimos commits en uno.\n' +
      '- `--mixed` (el modo por defecto): mueve la rama y vacía el staging area. Los cambios se quedan en tus archivos, pero **fuera de staging**. Úsalo para rehacer tus commits de otra forma.\n' +
      '- `--hard`: mueve la rama y hace que el staging area y tus archivos queden idénticos a ese commit. Los cambios de los commits deshechos **y** cualquier trabajo sin commit se **pierden**.\n\n' +
      'Una forma de recordarlo: `--soft` toca 1 cosa (la rama), `--mixed` 2 (rama + staging area) y `--hard` 3 (rama + staging area + tus archivos).\n\n' +
      'Reset reescribe el historial, así que úsalo con commits que no hayas subido con push. Para deshacer algo que ya está compartido, usa `git revert`.\n\n' +
      'Con una ruta de archivo (`git reset <archivo>`) no mueve ninguna rama: solo saca ese archivo del staging area, igual que `git restore --staged`.',
    syntax: [
      'git reset --soft <commit>',
      'git reset [--mixed] <commit>',
      'git reset --hard <commit>',
      'git reset <archivo>',
    ],
    examples: [
      {
        code: 'git reset --soft HEAD~1',
        explanation:
          'Deshace el último commit pero deja sus cambios en staging. Típico de "hice commit demasiado pronto".',
      },
      {
        code: 'git reset HEAD~1',
        explanation: 'Deshace el último commit; sus cambios se quedan en tus archivos, fuera de staging.',
      },
      {
        code: 'git reset --soft HEAD~3 && git commit -m "Add search feature"',
        explanation: 'Junta los últimos 3 commits en uno solo.',
      },
      {
        code: 'git reset --hard HEAD',
        explanation:
          'Descarta todos los cambios sin commit en archivos con seguimiento, volviendo al último commit.',
      },
      {
        code: 'git reset --hard origin/main',
        explanation:
          'Deja tu rama local idéntica a la remota, descartando tus commits y cambios locales. Ejecuta `git fetch` antes.',
      },
      {
        code: 'git reset --hard ORIG_HEAD',
        explanation:
          'Deshace un merge, rebase o reset que acabas de hacer (`ORIG_HEAD` es donde estaba `HEAD` antes de esa operación).',
      },
      {
        code: 'git reset src/app.ts',
        explanation: 'Saca `src/app.ts` del staging area (igual que `git restore --staged src/app.ts`).',
      },
    ],
    tips: [
      '`HEAD~1` significa "un commit antes de HEAD". También puedes usar cualquier hash de `git log`.',
      '¿Te equivocaste con reset? `git reflog` muestra dónde estaba tu rama antes, y `git reset --hard <ese-hash>` te devuelve ahí.',
      'Antes de un `--hard` riesgoso, crea una rama de respaldo (`git branch backup`) o ejecuta `git stash`, por si acaso.',
    ],
    warning:
      '`git reset --hard` borra para siempre los cambios sin commit (nunca se guardaron, así que ni el reflog puede recuperarlos). Además, hacer reset de commits que ya subiste reescribe historial compartido: tu próximo push será rechazado, y forzarlo le causa problemas a tu equipo. Para commits ya publicados, usa `git revert`.',
    related: ['restore', 'revert', 'reflog', 'commit-amend', 'stash'],
    keywords: ['deshacer commit', 'volver atrás', 'quitar último commit', 'descartar cambios', 'retroceder', 'reset hard', 'borrar commit'],
  },
  {
    id: 'revert',
    command: 'git revert',
    category: 'undo',
    level: 2,
    summary: 'Crea un commit nuevo que deshace un commit anterior.',
    description:
      '`git revert <commit>` no borra nada: crea un commit **nuevo** que aplica lo contrario de los cambios de `<commit>`. Si el original agregó una línea, el revert la quita, y viceversa. El historial conserva tanto el error como su corrección.\n\n' +
      'Como solo agrega commits, es la forma segura de deshacer cambios que ya subiste o que están en una rama compartida como `main`: no se reescribe el historial de nadie, y tu equipo solo tiene que hacer pull del commit nuevo.\n\n' +
      'Si commits posteriores tocaron las mismas líneas, el revert puede tener conflictos. Resuélvelos como en un merge, haz `git add` de los archivos y ejecuta `git revert --continue` (o `git revert --abort` para desistir).\n\n' +
      'Para revertir un merge commit necesitas `-m 1`, que le indica a git qué padre es la "línea principal" a la que volver (normalmente 1, la rama donde se hizo el merge).',
    syntax: [
      'git revert <commit>',
      'git revert --no-edit <commit>',
      'git revert --no-commit <commit>..<commit>',
      'git revert -m 1 <merge-commit>',
      'git revert --continue',
      'git revert --abort',
    ],
    examples: [
      {
        code: 'git revert a1b2c3d',
        explanation:
          'Crea un commit que deshace `a1b2c3d`, abriendo el editor con un mensaje como `Revert "Add banner"`.',
      },
      {
        code: 'git revert HEAD --no-edit',
        explanation: 'Deshace el último commit con el mensaje por defecto, sin abrir el editor.',
      },
      {
        code: 'git revert HEAD~3..HEAD',
        explanation:
          'Revierte los últimos tres commits, creando un commit de revert por cada uno (del más nuevo al más antiguo).',
      },
      {
        code: 'git revert --no-commit HEAD~3..HEAD',
        explanation:
          'Aplica los tres reverts a tus archivos y al staging area sin hacer commit, para que puedas crear un solo commit que los deshaga todos.',
      },
      {
        code: 'git revert -m 1 9f8e7d6',
        explanation:
          'Revierte un merge commit, volviendo al estado de su primer padre (la rama donde se integró la funcionalidad).',
      },
      {
        code: 'git revert --abort',
        explanation: 'Cancela un revert que se detuvo por conflictos.',
      },
    ],
    tips: [
      'Regla práctica: ¿commit sin subir? `reset` o `--amend` están bien. ¿Ya hiciste push? Usa `revert`.',
      'Puedes revertir un revert para recuperar el cambio original.',
      'Después de revertir un merge, volver a hacer merge de esa misma rama no trae de vuelta los cambios revertidos (git cree que ya están integrados). En ese caso, revierte el revert.',
    ],
    related: ['reset', 'commit', 'merge', 'cherry-pick', 'log'],
    keywords: ['deshacer commit', 'deshacer commit subido', 'deshacer seguro', 'revertir', 'anular cambios', 'volver atrás'],
  },
  {
    id: 'commit-amend',
    command: 'git commit --amend',
    category: 'undo',
    level: 2,
    summary: 'Arregla el último commit: cambia su mensaje o agrega cambios olvidados.',
    description:
      '`git commit --amend` reemplaza el último commit por uno nuevo que lo combina con lo que tengas en staging en ese momento. Úsalo en los clásicos momentos de "ups" justo después de un commit: un error en el mensaje, un archivo olvidado, un `console.log` que quedó por ahí.\n\n' +
      'Si no hay nada en staging, solo te deja editar el mensaje. Si preparaste cambios, se suman al commit.\n\n' +
      'Parece que editaste el commit, pero técnicamente es un commit **nuevo** con otro hash, y el antiguo sale de la rama. Por eso hacer amend solo es seguro con commits que todavía no subiste con push.',
    syntax: [
      'git commit --amend',
      'git commit --amend -m "<mensaje-nuevo>"',
      'git commit --amend --no-edit',
      'git commit --amend --reset-author --no-edit',
    ],
    examples: [
      {
        code: 'git commit --amend -m "Fix login redirect"',
        explanation: 'Reemplaza el mensaje del último commit.',
      },
      {
        code: 'git add forgotten.css && git commit --amend --no-edit',
        explanation: 'Agrega un archivo olvidado al último commit, manteniendo el mismo mensaje.',
      },
      {
        code: 'git commit --amend',
        explanation:
          'Abre el editor con el mensaje actual para que lo reescribas; también incluye lo que esté en staging.',
      },
      {
        code: 'git commit --amend --reset-author --no-edit',
        explanation:
          'Actualiza el autor con tu `user.name` y `user.email` actuales (útil si hiciste commit con el email equivocado).',
      },
    ],
    tips: [
      'Para arreglar un commit más antiguo (no el último), usa `git commit --fixup <commit>` seguido de `git rebase -i --autosquash`, o edítalo directamente con `git rebase -i`.',
      '¿Te arrepentiste de un amend? La versión anterior del commit sigue apareciendo en `git reflog`.',
    ],
    warning:
      'Hacer amend reescribe el último commit. Si ya lo subiste, tu próximo push será rechazado y necesitarías `git push --force-with-lease`, lo que complica a cualquiera que ya haya hecho pull del commit antiguo. Evita hacer amend de commits publicados en ramas compartidas.',
    related: ['commit', 'reset', 'rebase-interactive', 'push', 'reflog'],
    keywords: ['arreglar último commit', 'cambiar mensaje de commit', 'olvidé un archivo', 'editar commit', 'error de tipeo', 'amend'],
  },
  {
    id: 'clean',
    command: 'git clean',
    category: 'undo',
    level: 2,
    summary: 'Borra los archivos sin seguimiento de tu directorio de trabajo.',
    description:
      '`git clean` elimina los archivos que git no está siguiendo: resultados de compilación, archivos temporales, cosas que creaste y ya no quieres. Comandos como `git restore` y `git reset --hard` solo trabajan con archivos con seguimiento; `clean` se encarga de los que no lo tienen.\n\n' +
      'Como borra archivos que nunca estuvieron en un commit, git hace difícil ejecutarlo por accidente: se niega a hacer nada a menos que uses `-f` (forzar), `-n` (simulación) o `-i` (interactivo).\n\n' +
      'Haz siempre primero una simulación con `-n` para ver qué se borraría.',
    syntax: ['git clean -n', 'git clean -f', 'git clean -fd', 'git clean -fdx', 'git clean -i'],
    examples: [
      {
        code: 'git clean -n',
        explanation: 'Simulación: lista los archivos sin seguimiento que se borrarían, sin borrar nada.',
      },
      {
        code: 'git clean -nd',
        explanation: 'Simulación que también incluye carpetas sin seguimiento.',
      },
      {
        code: 'git clean -fd',
        explanation: 'Borra los archivos y carpetas sin seguimiento.',
      },
      {
        code: 'git clean -fdx',
        explanation:
          'También borra los archivos ignorados por `.gitignore` (como `node_modules/`, `dist/` o `.env`): deja todo como recién clonado.',
      },
      {
        code: 'git clean -i',
        explanation: 'Abre un menú interactivo para elegir qué borrar.',
      },
    ],
    tips: [
      '`git reset --hard` seguido de `git clean -fd` deja tu carpeta exactamente como el último commit, incluyendo archivos con y sin seguimiento.',
      '¿Quieres apartar los archivos sin seguimiento en vez de borrarlos? Usa `git stash -u`.',
    ],
    warning:
      '`git clean -f` borra para siempre archivos que git nunca guardó: no van a la papelera y no se pueden recuperar. Con `-x` también borra archivos ignorados, como un `.env` con tus secretos. Ejecuta siempre `git clean -n` antes.',
    related: ['restore', 'reset', 'stash', 'status'],
    keywords: ['borrar sin seguimiento', 'eliminar archivos nuevos', 'limpiar', 'archivos basura', 'dejar limpio', 'archivos ignorados'],
  },
  {
    id: 'reflog',
    command: 'git reflog',
    category: 'undo',
    level: 2,
    summary: 'Registro de todo lugar por donde pasó HEAD: tu red de seguridad para recuperar trabajo perdido.',
    description:
      'Cada vez que `HEAD` se mueve (commit, switch, reset, rebase, merge, amend...), git anota una entrada en el **reflog**. `git reflog` muestra esa lista, de la más reciente a la más antigua, con entradas como `HEAD@{2}: reset: moving to HEAD~1`.\n\n' +
      'Por eso es la herramienta para recuperar commits "perdidos". Después de un mal `reset --hard`, un rebase que salió mal, un amend del que te arrepientes o una rama borrada, los commits antiguos siguen existiendo, y el reflog te dice sus hashes. Encuentra la entrada correcta y crea una rama ahí o vuelve a ella con reset.\n\n' +
      'El reflog es local (no se sube con push ni se copia al clonar) y sus entradas expiran con el tiempo (por defecto a los 90 días, o a los 30 para commits a los que no apunta ninguna rama). Los cambios sin commit nunca entran en él, así que no puede recuperar trabajo que nunca guardaste en un commit.',
    syntax: [
      'git reflog',
      'git reflog show <rama>',
      'git reset --hard HEAD@{<n>}',
      'git branch <nombre> <hash>',
    ],
    examples: [
      {
        code: 'git reflog',
        explanation:
          'Lista las posiciones recientes de HEAD, con sus hashes y la acción que causó cada una.',
      },
      {
        code: 'git reflog show feature/login',
        explanation: 'El historial de posiciones de una sola rama.',
      },
      {
        code: 'git reset --hard HEAD@{1}',
        explanation:
          'Vuelve a donde estaba HEAD un movimiento atrás, por ejemplo para deshacer un reset o un rebase que acabas de hacer.',
      },
      {
        code: 'git branch rescue a1b2c3d',
        explanation:
          'Crea una rama sobre un commit perdido que encontraste en el reflog, para que vuelva a estar a salvo.',
      },
      {
        code: 'git reflog --date=relative',
        explanation:
          'Muestra cuándo ocurrió cada movimiento ("2 hours ago"), lo que ayuda a encontrar "cómo estaba todo antes de almorzar".',
      },
    ],
    tips: [
      'Antes de intentar arreglar un desastre, detente y ejecuta `git reflog`: el estado anterior casi siempre está ahí.',
      '`HEAD@{1}` es "donde estaba HEAD antes del último movimiento". `ORIG_HEAD` es parecido, pero solo lo actualizan operaciones como reset, merge y rebase.',
    ],
    related: ['reset', 'log', 'branch', 'rebase', 'commit-amend'],
    keywords: ['recuperar', 'commits perdidos', 'deshacer reset', 'recuperar rama borrada', 'rescatar', 'historial de head', 'me equivoqué'],
  },

  // -------------------------------------------------------------- rewriting
  {
    id: 'rebase',
    command: 'git rebase',
    category: 'rewriting',
    level: 3,
    summary: 'Vuelve a aplicar tus commits encima de otra rama para tener un historial lineal.',
    description:
      '`git rebase <base>` toma los commits de tu rama actual que no están en `<base>` y los vuelve a aplicar, uno por uno, encima del último commit de `<base>`. El resultado es como si hubieras empezado tu trabajo desde el `<base>` actual: un historial en línea recta, sin merge commits.\n\n' +
      'Uso típico: estás en `feature/login` y `main` avanzó. En vez de hacer merge de `main` en tu rama, ejecutas `git rebase main` y tus commits quedan bien ordenados encima del nuevo `main`.\n\n' +
      'Los commits reaplicados son commits **nuevos** (con otros hashes), aunque su contenido parezca igual. Por eso el rebase reescribe el historial.\n\n' +
      'Si un commit tiene conflictos, el rebase se pausa en él:\n\n' +
      '- Arregla los archivos y luego `git add <archivo>`\n' +
      '- `git rebase --continue` pasa al siguiente commit\n' +
      '- `git rebase --skip` descarta por completo el commit actual\n' +
      '- `git rebase --abort` cancela todo y vuelve a como estaba\n\n' +
      '**Cuidado con "ours" y "theirs":** durante un rebase están invertidos respecto a un merge. "Ours" (`HEAD`, la parte de arriba de los marcadores de conflicto) es la rama **sobre** la que haces el rebase (por ejemplo `main`), y "theirs" es **tu** commit que se está reaplicando.\n\n' +
      '**Regla de oro:** nunca hagas rebase de commits que otras personas ya tienen (subidos a una rama compartida). Haz rebase con libertad de tus commits locales o de tu rama personal; para historial compartido, usa merge.\n\n' +
      '`--onto` trasplanta commits a otra base: `git rebase --onto <base-nueva> <base-antigua> <rama>` toma los commits de `<rama>` que vienen después de `<base-antigua>` y los reaplica encima de `<base-nueva>`.',
    syntax: [
      'git rebase <base>',
      'git rebase <base> <rama>',
      'git rebase --continue | --skip | --abort',
      'git rebase --onto <base-nueva> <base-antigua> [<rama>]',
      'git rebase -i <base>',
    ],
    examples: [
      {
        code: 'git rebase main',
        explanation: 'Reaplica los commits de la rama actual encima de `main`.',
      },
      {
        code: 'git fetch && git rebase origin/main',
        explanation:
          'Actualiza tu rama de funcionalidad con el `main` más reciente del servidor, sin merge commit.',
      },
      {
        code: 'git rebase --continue',
        explanation: 'Después de resolver un conflicto y hacer `git add`, continúa con el siguiente commit.',
      },
      {
        code: 'git rebase --abort',
        explanation: 'Cancela el rebase y deja la rama en su estado original.',
      },
      {
        code: 'git rebase --onto main feature/base feature/child',
        explanation:
          'Mueve solo los commits propios de `feature/child` (los que vienen después de `feature/base`) encima de `main`, por ejemplo cuando la rama base se abandonó o se integró con squash.',
      },
      {
        code: 'git pull --rebase',
        explanation:
          'Descarga y reaplica tus commits locales encima de los remotos, en vez de hacer merge.',
      },
      {
        code: 'git push --force-with-lease',
        explanation:
          'Después de hacer rebase de una rama que ya habías subido (¡solo si es tuya!), actualiza el remoto de forma segura.',
      },
    ],
    tips: [
      'Rebase vs merge: rebase deja un historial limpio y lineal pero reescribe commits; merge conserva el historial real y siempre es seguro. Muchos equipos hacen rebase de sus ramas de funcionalidad en local y después las integran a `main` con merge.',
      '`git config --global rebase.autoStash true` guarda con stash tus cambios sin commit antes del rebase y los restaura al terminar.',
      'Si un rebase ya terminado salió mal, `git reset --hard ORIG_HEAD` (de inmediato) o `git reflog` te devuelven al estado anterior.',
      '`git config --global rerere.enabled true` hace que git recuerde cómo resolviste un conflicto y lo vuelva a aplicar solo la próxima vez.',
    ],
    warning:
      'Rebase reescribe el historial. Nunca hagas rebase de commits que ya están en una rama compartida (como `main`, o una rama en la que trabaja alguien más): sus copias no coincidirán con las tuyas y necesitarás un force push que puede borrar su trabajo. Hacer rebase de tus propios commits no publicados no tiene problema.',
    related: ['merge', 'rebase-interactive', 'cherry-pick', 'pull', 'push', 'reflog'],
    keywords: ['historial lineal', 'actualizar rama', 'reaplicar commits', 'mover commits', 'rebase onto', 'conflictos', 'reescribir historial'],
  },
  {
    id: 'rebase-interactive',
    command: 'git rebase -i',
    category: 'rewriting',
    level: 3,
    summary: 'Edita, reordena, junta o elimina commits antes de compartirlos.',
    description:
      '`git rebase -i <base>` abre en tu editor una lista (la "todo list") con todos los commits posteriores a `<base>`, el más antiguo arriba. Cada línea empieza con una acción. Cambiando esas palabras, reordenando líneas o borrándolas, reescribes el historial exactamente como quieras; luego guardas y cierras el editor para aplicarlo.\n\n' +
      'Las acciones:\n\n' +
      '- `pick`: deja el commit tal cual\n' +
      '- `reword`: lo deja, pero te permite editar su mensaje\n' +
      '- `edit`: se detiene en ese commit para que lo modifiques (con amend, dividiéndolo...) y luego sigues con `git rebase --continue`\n' +
      '- `squash`: lo junta con el commit anterior y combina ambos mensajes\n' +
      '- `fixup`: lo junta con el commit anterior y descarta su mensaje\n' +
      '- `drop`: elimina el commit (borrar su línea hace lo mismo)\n\n' +
      'Es la herramienta ideal para pulir una rama antes de abrir un pull request: convertir commits tipo "wip", "fix typo" y "ups" en unos pocos commits limpios y con sentido.\n\n' +
      'Los conflictos y la recuperación funcionan igual que en un rebase normal: `--continue`, `--skip` y `--abort`.',
    syntax: [
      'git rebase -i <base>',
      'git rebase -i HEAD~<n>',
      'git rebase -i --root',
      'git commit --fixup <commit>',
      'git rebase -i --autosquash <base>',
    ],
    examples: [
      {
        code: 'git rebase -i HEAD~4',
        explanation: 'Abre los últimos 4 commits para editarlos.',
      },
      {
        code: 'git rebase -i main',
        explanation: 'Te deja editar todos los commits de tu rama que no están en `main`.',
      },
      {
        code: 'git rebase -i --root',
        explanation: 'Incluye todos los commits, hasta el primero de todos.',
      },
      {
        code: 'git commit --fixup a1b2c3d',
        explanation:
          'Crea un commit marcado como arreglo de `a1b2c3d` (su mensaje empieza con `fixup!`).',
      },
      {
        code: 'git rebase -i --autosquash main',
        explanation:
          'Mueve automáticamente los commits `fixup!` justo debajo de su commit objetivo y los marca como `fixup`; solo tienes que guardar y cerrar.',
      },
      {
        code: 'git rebase --continue',
        explanation: 'Continúa después de detenerse en un commit marcado con `edit` o de resolver un conflicto.',
      },
    ],
    tips: [
      'Para juntar varios commits en uno, cambia `pick` por `squash` (o `s`) en todas las líneas menos la primera.',
      'Cada acción tiene un atajo de una letra: `p`, `r`, `e`, `s`, `f`, `d`.',
      'Reordenar líneas reordena los commits, pero si dependen entre sí pueden aparecer conflictos al intercambiarlos.',
      'Si borras todas las líneas y guardas, el rebase se cancela y no cambia nada.',
    ],
    warning:
      'El rebase interactivo reescribe todos los commits desde el primero que modificas en adelante. Hazlo solo con commits que no hayas subido, o en tu propia rama (y después sube con `--force-with-lease`). Nunca en ramas compartidas como `main`.',
    related: ['rebase', 'commit-amend', 'reset', 'cherry-pick', 'push'],
    keywords: ['juntar commits', 'squash', 'combinar commits', 'editar commit', 'reordenar commits', 'borrar commit', 'limpiar historial', 'fixup'],
  },
  {
    id: 'cherry-pick',
    command: 'git cherry-pick',
    category: 'rewriting',
    level: 2,
    summary: 'Copia un commit específico de otra rama a la rama actual.',
    description:
      '`git cherry-pick <commit>` toma los cambios que introdujo un commit y los aplica como un commit **nuevo** en tu rama actual. Es como copiar y pegar un commit: el original se queda donde estaba y tú obtienes una copia con otro hash.\n\n' +
      'Úsalo cuando necesitas un cambio en particular y no la rama completa: llevar un arreglo de `main` a una rama de release, rescatar un commit que hiciste en la rama equivocada, o tomar un solo commit útil de la rama de alguien de tu equipo.\n\n' +
      'Si el cambio no se aplica limpiamente, git se detiene con un conflicto. Resuélvelo, haz `git add` de los archivos y ejecuta `git cherry-pick --continue`; o usa `--skip` para saltarte ese commit, o `--abort` para cancelar todo.\n\n' +
      'No uses cherry-pick como forma habitual de mover trabajo entre ramas: los commits duplicados pueden causar conflictos confusos más adelante. Si necesitas todo, usa merge o rebase.',
    syntax: [
      'git cherry-pick <commit>',
      'git cherry-pick <commit1> <commit2>',
      'git cherry-pick <primero>^..<último>',
      'git cherry-pick -x <commit>',
      'git cherry-pick --continue | --skip | --abort',
    ],
    examples: [
      {
        code: 'git cherry-pick a1b2c3d',
        explanation: 'Aplica el commit `a1b2c3d` encima de la rama actual.',
      },
      {
        code: 'git cherry-pick a1b2c3d e4f5a6b',
        explanation: 'Aplica dos commits, en ese orden.',
      },
      {
        code: 'git cherry-pick a1b2c3d^..e4f5a6b',
        explanation:
          'Aplica un rango completo, desde `a1b2c3d` hasta `e4f5a6b` inclusive (sin el `^` el primero quedaría fuera).',
      },
      {
        code: 'git cherry-pick -x a1b2c3d',
        explanation:
          'Agrega "(cherry picked from commit ...)" al mensaje, útil para saber de dónde vino.',
      },
      {
        code: 'git cherry-pick --no-commit a1b2c3d',
        explanation:
          'Aplica los cambios a tus archivos y al staging area sin crear el commit, para que puedas ajustarlos antes.',
      },
      {
        code: 'git cherry-pick --abort',
        explanation: 'Cancela un cherry-pick que se detuvo por conflictos.',
      },
    ],
    tips: [
      '¿Hiciste commit en la rama equivocada? Cámbiate a la correcta con `git switch`, haz `git cherry-pick <hash>`, y luego vuelve y quítalo de la rama equivocada con `git reset` (si no lo has subido).',
      'Encuentra el hash que necesitas con `git log --oneline <otra-rama>`.',
    ],
    related: ['rebase', 'merge', 'revert', 'log'],
    keywords: ['copiar commit', 'aplicar commit', 'backport', 'mover commit', 'traer un commit', 'rama equivocada'],
  },

  // ---------------------------------------------------------------- remotes
  {
    id: 'remote',
    command: 'git remote',
    category: 'remotes',
    level: 1,
    summary: 'Administra las conexiones con otros repositorios, como GitHub.',
    description:
      'Un remoto es un enlace con nombre hacia otra copia del repositorio, normalmente en un servidor como GitHub. Cuando clonas, git crea uno llamado `origin` automáticamente. Cuando empiezas con `git init`, no hay ninguno hasta que agregues uno.\n\n' +
      '`git remote` te permite listar, agregar, renombrar y eliminar estos enlaces, y cambiar sus URLs. Los nombres son solo atajos: `git push origin main` significa "sube a la URL guardada como `origin`".\n\n' +
      'En flujos de trabajo con forks normalmente tienes dos: `origin` (tu fork) y `upstream` (el proyecto original).',
    syntax: [
      'git remote -v',
      'git remote add <nombre> <url>',
      'git remote set-url <nombre> <url>',
      'git remote rename <antiguo> <nuevo>',
      'git remote remove <nombre>',
      'git remote show <nombre>',
    ],
    examples: [
      {
        code: 'git remote -v',
        explanation: 'Lista tus remotos con sus URLs.',
      },
      {
        code: 'git remote add origin https://github.com/my-user/my-app.git',
        explanation:
          'Conecta un repositorio local (creado con `git init`) con un repositorio vacío en GitHub.',
      },
      {
        code: 'git remote add upstream https://github.com/vitejs/vite.git',
        explanation: 'Agrega el proyecto original de un fork, para poder descargar sus actualizaciones.',
      },
      {
        code: 'git remote set-url origin git@github.com:my-user/my-app.git',
        explanation:
          'Cambia la URL, por ejemplo para pasar de HTTPS a SSH o después de renombrar el repositorio.',
      },
      {
        code: 'git remote show origin',
        explanation: 'Información detallada: URLs, ramas remotas y qué ramas locales las siguen.',
      },
      {
        code: 'git remote prune origin',
        explanation: 'Elimina tus referencias locales a ramas que ya se borraron en el servidor.',
      },
    ],
    tips: [
      '`origin` es solo una convención; puedes ponerle cualquier nombre a un remoto.',
      'Después de agregar un remoto a un repositorio nuevo, el primer push suele ser `git push -u origin main`.',
    ],
    related: ['clone', 'fetch', 'push', 'pull'],
    keywords: ['github', 'servidor', 'origin', 'upstream', 'url', 'conectar repositorio', 'fork'],
  },
  {
    id: 'fetch',
    command: 'git fetch',
    category: 'remotes',
    level: 2,
    summary: 'Descarga commits nuevos de un remoto sin tocar tu trabajo.',
    description:
      '`git fetch` se conecta a un remoto y descarga los commits, ramas y tags que todavía no tienes. Actualiza tus **ramas de seguimiento remoto** (como `origin/main`), que son tu copia local, de solo lectura, de cómo estaba el servidor la última vez que hiciste fetch.\n\n' +
      'Nunca modifica tus propias ramas ni tus archivos, así que siempre es seguro. Después del fetch tú decides qué hacer: revisar lo nuevo y luego hacer merge o rebase.\n\n' +
      'De hecho, `git pull` es simplemente `git fetch` seguido de un merge (o un rebase). Hacer fetch primero te da la oportunidad de mirar antes de integrar.',
    syntax: [
      'git fetch',
      'git fetch <remoto>',
      'git fetch <remoto> <rama>',
      'git fetch --all',
      'git fetch --prune',
    ],
    examples: [
      {
        code: 'git fetch',
        explanation: 'Descarga las actualizaciones del remoto de la rama actual (normalmente `origin`).',
      },
      {
        code: 'git fetch upstream',
        explanation:
          'Descarga las actualizaciones del remoto llamado `upstream`, por ejemplo el proyecto original de tu fork.',
      },
      {
        code: 'git fetch --all --prune',
        explanation:
          'Actualiza desde todos los remotos y elimina las ramas `origin/...` que ya no existen en el servidor.',
      },
      {
        code: 'git log --oneline HEAD..origin/main',
        explanation: 'Después del fetch: los commits del remoto que todavía no tienes.',
      },
      {
        code: 'git merge origin/main',
        explanation:
          'Integra los cambios descargados en tu rama actual (lo que habría hecho `git pull`).',
      },
    ],
    tips: [
      '`git config --global fetch.prune true` hace que cada fetch limpie las ramas que se borraron en el servidor.',
      '`git status` solo sabe que vas "atrasado" después de un fetch; no se conecta al servidor por sí solo.',
    ],
    related: ['pull', 'remote', 'merge', 'rebase', 'push'],
    keywords: ['descargar', 'actualizar', 'sincronizar', 'revisar remoto', 'origin/main', 'traer cambios'],
  },
  {
    id: 'pull',
    command: 'git pull',
    category: 'remotes',
    level: 1,
    summary: 'Descarga los cambios del remoto y los integra en tu rama.',
    description:
      '`git pull` actualiza tu rama actual con los cambios de su rama remota. Son dos pasos en uno: `git fetch` (descargar) y luego integrar los commits descargados, ya sea con merge o con rebase.\n\n' +
      'Si no tienes commits locales, la integración es un simple fast-forward y nada puede salir mal. El caso interesante es cuando **ambos** lados tienen commits nuevos: las ramas **divergieron**. El git moderno no adivina qué quieres en ese caso: si no configuraste una preferencia, se detiene con el mensaje "You have divergent branches and need to specify how to reconcile them". Tus opciones:\n\n' +
      '- `git pull --no-rebase` (merge): crea un merge commit que une ambos historiales. Es lo que hacían en silencio las versiones antiguas de git.\n' +
      '- `git pull --rebase`: reaplica tus commits locales encima de los remotos. Historial lineal, sin merge commit.\n' +
      '- `git pull --ff-only`: solo actualiza si es un fast-forward; si no, falla y te deja decidir a ti.\n\n' +
      'Configura tu preferencia una sola vez con `git config --global pull.rebase false` (merge) o `true` (rebase), o con `git config --global pull.ff only`.\n\n' +
      'Si al integrar aparecen conflictos, resuélvelos como en un merge o en un rebase, según el modo.',
    syntax: [
      'git pull',
      'git pull <remoto> <rama>',
      'git pull --rebase',
      'git pull --no-rebase',
      'git pull --ff-only',
    ],
    examples: [
      {
        code: 'git pull',
        explanation: 'Actualiza la rama actual desde su upstream (por ejemplo `origin/main`).',
      },
      {
        code: 'git pull --rebase',
        explanation: 'Descarga y pone tus commits locales encima de los remotos, sin merge commit.',
      },
      {
        code: 'git pull --no-rebase',
        explanation: 'Descarga y hace merge, creando un merge commit si las ramas divergieron.',
      },
      {
        code: 'git pull --ff-only',
        explanation:
          'Solo actualiza si no tienes commits locales que requieran merge. Seguro para mantener `main` sincronizada.',
      },
      {
        code: 'git pull origin main',
        explanation:
          'Descarga `main` desde `origin` y la integra en tu rama **actual**, sea cual sea.',
      },
      {
        code: 'git config --global pull.rebase true',
        explanation:
          'Hace que `git pull` siempre use rebase de ahora en adelante (usa `false` para que siempre haga merge).',
      },
    ],
    tips: [
      'Haz commit o stash de tu trabajo antes del pull; git se niega a hacer pull si los cambios entrantes sobrescribirían cambios sin commit.',
      '"There is no tracking information for the current branch" significa que tu rama no tiene upstream: usa `git pull origin <rama>`, o vincúlala con `git branch -u origin/<rama>`.',
      '¿No sabes qué viene? Haz `git fetch` primero y revisa con `git log HEAD..origin/main`; después haz merge o rebase.',
    ],
    related: ['fetch', 'merge', 'rebase', 'push', 'config'],
    keywords: ['actualizar', 'bajar cambios', 'sincronizar', 'ramas divergentes', 'traer lo último', 'descargar cambios'],
  },
  {
    id: 'push',
    command: 'git push',
    category: 'remotes',
    level: 1,
    summary: 'Sube tus commits locales a un repositorio remoto.',
    description:
      '`git push` envía los commits de tu rama al remoto (normalmente GitHub), para que otros los vean y para que queden respaldados. Solo viajan los commits; los cambios sin commit se quedan en tu computador.\n\n' +
      'La primera vez que subes una rama nueva, usa `-u` (`--set-upstream`): `git push -u origin feature/login`. Crea la rama en el remoto y la vincula con tu rama local, así desde ese momento un simple `git push` o `git pull` sabe adónde ir.\n\n' +
      '**Push rechazado.** Si la rama remota tiene commits que tú no tienes, git rechaza el push ("Updates were rejected because the remote contains work that you do not have locally", o "non-fast-forward"). Es git protegiendo el trabajo de otra persona. La solución es hacer `git pull` (con merge o rebase), resolver los conflictos si los hay y volver a hacer push, no forzarlo.\n\n' +
      '**Force push.** Después de reescribir historial que ya habías subido (rebase, amend, reset), un push normal es rechazado y tienes que forzarlo:\n\n' +
      '- `--force` sobrescribe la rama remota con la tuya sin preguntar nada, aunque alguien haya subido commits nuevos mientras tanto (esos commits se pierden).\n' +
      '- `--force-with-lease` solo sobrescribe si la rama remota sigue donde la viste por última vez; si alguien subió algo entretanto, se niega. Prefiérelo siempre.\n\n' +
      'Para borrar una rama en el remoto: `git push origin --delete <rama>`.',
    syntax: [
      'git push',
      'git push -u <remoto> <rama>',
      'git push <remoto> <rama>',
      'git push --force-with-lease',
      'git push <remoto> --delete <rama>',
      'git push <remoto> <tag>',
    ],
    examples: [
      {
        code: 'git push -u origin feature/login',
        explanation: 'Primer push de una rama nueva: la crea en `origin` y la deja como upstream.',
      },
      {
        code: 'git push',
        explanation: 'Sube la rama actual a su upstream (una vez que tiene uno).',
      },
      {
        code: 'git push -u origin main',
        explanation: 'El típico primer push de un repositorio recién creado.',
      },
      {
        code: 'git push --force-with-lease',
        explanation:
          'Actualiza el remoto después de un rebase o un amend, pero solo si nadie más subió algo entretanto.',
      },
      {
        code: 'git push origin --delete feature/login',
        explanation: 'Borra la rama `feature/login` en el remoto.',
      },
      {
        code: 'git push origin v1.0.0',
        explanation: 'Sube un tag (los tags no se suben por defecto).',
      },
      {
        code: 'git push origin HEAD',
        explanation:
          'Sube la rama actual a una rama con el mismo nombre en `origin`, sin tener que escribir su nombre.',
      },
    ],
    tips: [
      '`git config --global push.autoSetupRemote true` (git 2.37+) hace que el primer `git push` de una rama nueva configure su upstream automáticamente, sin necesidad de `-u`.',
      'Revisa lo que vas a subir con `git log origin/main..HEAD`.',
      'En GitHub puedes proteger `main` para que nadie pueda hacerle force push.',
    ],
    warning:
      '`git push --force` reemplaza la rama remota con tu versión y puede borrar sin aviso commits que subieron tus compañeros. Usa `--force-with-lease` en su lugar, solo en tus propias ramas, y nunca en ramas compartidas como `main` salvo que todo el equipo esté de acuerdo.',
    related: ['pull', 'fetch', 'remote', 'branch', 'tag', 'rebase'],
    keywords: ['subir', 'enviar commits', 'publicar', 'github', 'rechazado', 'force push', 'borrar rama remota', 'upstream'],
  },

  // ------------------------------------------------------------------ stash
  {
    id: 'stash',
    command: 'git stash',
    category: 'stash',
    level: 2,
    summary: 'Aparta temporalmente los cambios sin commit para dejar limpio tu directorio de trabajo.',
    description:
      '`git stash` toma tus cambios sin commit (en staging y fuera de él), los guarda en una pila especial y deja tus archivos como en el último commit. Tu directorio de trabajo queda limpio, así puedes cambiar de rama, hacer pull o arreglar algo urgente; después recuperas los cambios con `git stash pop`.\n\n' +
      'Escenario clásico: vas a la mitad de una funcionalidad y necesitas arreglar un bug en `main` ahora mismo. `git stash`, `git switch main`, arreglas y haces commit, vuelves a tu rama, `git stash pop`.\n\n' +
      'Por defecto, los archivos nuevos (sin seguimiento) **no** se guardan; agrega `-u` para incluirlos. Cada stash se guarda como una entrada (`stash@{0}` es la más reciente) y puedes tener varias.\n\n' +
      'Si al aplicar un stash hay conflictos con tus archivos actuales, git deja marcadores de conflicto y, con `pop`, mantiene el stash en la lista para que no lo pierdas.',
    syntax: [
      'git stash',
      'git stash push -m "<mensaje>"',
      'git stash list',
      'git stash pop [stash@{<n>}]',
      'git stash apply [stash@{<n>}]',
      'git stash drop [stash@{<n>}]',
    ],
    examples: [
      {
        code: 'git stash',
        explanation: 'Guarda tus cambios sin commit y limpia el directorio de trabajo.',
      },
      {
        code: 'git stash -u',
        explanation: 'También guarda los archivos sin seguimiento.',
      },
      {
        code: 'git stash push -m "half-done navbar"',
        explanation: 'Lo guarda con una descripción, para reconocerlo más fácil después.',
      },
      {
        code: 'git stash list',
        explanation: 'Muestra todos los stashes guardados: `stash@{0}`, `stash@{1}`...',
      },
      {
        code: 'git stash pop',
        explanation: 'Vuelve a aplicar el stash más reciente y lo elimina de la lista.',
      },
      {
        code: 'git stash apply stash@{1}',
        explanation: 'Aplica un stash específico pero lo mantiene en la lista.',
      },
      {
        code: 'git stash show -p stash@{0}',
        explanation: 'Muestra los cambios guardados en un stash, como diff.',
      },
    ],
    tips: [
      '`git stash branch <nombre>` crea una rama nueva desde el commit donde hiciste el stash y lo aplica ahí: la salida más limpia cuando un stash da conflictos.',
      '`git stash push -- <archivo>` guarda solo ese archivo.',
      '`git stash drop stash@{1}` borra un stash; `git stash clear` los borra todos (sin vuelta atrás).',
      'Los stashes se olvidan fácilmente. Para algo más largo que una interrupción rápida, suele ser mejor un commit temporal "WIP" en una rama.',
    ],
    related: ['switch', 'pull', 'restore', 'clean'],
    keywords: ['guardar para después', 'apartar cambios', 'temporal', 'guardar cambios', 'wip', 'interrupción', 'dejar de lado'],
  },

  // ------------------------------------------------------------- inspection
  {
    id: 'blame',
    command: 'git blame',
    category: 'inspection',
    level: 2,
    summary: 'Muestra quién cambió por última vez cada línea de un archivo, y en qué commit.',
    description:
      '`git blame <archivo>` muestra el archivo con el commit, el autor y la fecha del último cambio junto a cada línea. Aunque "blame" significa "culpar", no se trata de buscar culpables: se trata de encontrar contexto. Una vez que tienes el hash del commit, `git show <hash>` te cuenta por qué la línea se escribió así.\n\n' +
      'Úsalo cuando encuentras código que se ve raro y quieres conocer su historia antes de tocarlo.',
    syntax: [
      'git blame <archivo>',
      'git blame -L <inicio>,<fin> <archivo>',
      'git blame <commit> -- <archivo>',
      'git blame -w -C <archivo>',
    ],
    examples: [
      {
        code: 'git blame src/cart.ts',
        explanation: 'Anota cada línea de `src/cart.ts`.',
      },
      {
        code: 'git blame -L 40,60 src/cart.ts',
        explanation: 'Solo las líneas 40 a 60.',
      },
      {
        code: 'git blame -w src/cart.ts',
        explanation:
          'Ignora los cambios que solo tocan espacios en blanco, para que un reformateo no oculte al verdadero autor de la línea.',
      },
      {
        code: 'git blame -C src/cart.ts',
        explanation: 'También detecta líneas que se movieron o copiaron desde otros archivos.',
      },
      {
        code: 'git blame v1.0.0 -- src/cart.ts',
        explanation: 'Blame del archivo tal como estaba en el tag `v1.0.0`.',
      },
    ],
    tips: [
      'Si un commit grande de formato estorba, anota su hash en un archivo como `.git-blame-ignore-revs` y usa `git blame --ignore-revs-file .git-blame-ignore-revs <archivo>` (GitHub también lee ese archivo).',
      'Muchos editores (VS Code con GitLens, los IDEs de JetBrains) muestran el blame directamente en el código, lo que suele ser más cómodo.',
      '`git log -L 40,60:src/cart.ts` muestra toda la evolución de esas líneas, no solo el último cambio.',
    ],
    related: ['log', 'show', 'bisect', 'diff'],
    keywords: ['quién cambió', 'autor de la línea', 'historia de una línea', 'anotar', 'por qué está este código', 'culpable'],
  },
  {
    id: 'bisect',
    command: 'git bisect',
    category: 'inspection',
    level: 3,
    summary: 'Encuentra el commit que introdujo un bug usando búsqueda binaria.',
    description:
      'Cuando algo funcionaba y ahora no, `git bisect` encuentra el commit exacto que lo rompió. Le indicas a git un commit donde las cosas están **mal** (normalmente el actual) y uno donde estaban **bien** (por ejemplo, un tag antiguo). Git se mueve a un commit a mitad de camino; tú lo pruebas y respondes `good` o `bad`. Cada respuesta corta el rango restante a la mitad, así que incluso con 1.000 commits bastan unos 10 pasos.\n\n' +
      'Cuando termina, git muestra el primer commit malo. Luego ejecuta `git bisect reset` para volver a donde empezaste.\n\n' +
      'Si tienes un script o test que detecta el bug (código de salida 0 = bien, cualquier otro = mal), `git bisect run` hace toda la búsqueda por ti.',
    syntax: [
      'git bisect start [<malo> <bueno>]',
      'git bisect bad [<commit>]',
      'git bisect good [<commit>]',
      'git bisect skip',
      'git bisect run <comando>',
      'git bisect reset',
    ],
    examples: [
      {
        code: 'git bisect start',
        explanation: 'Inicia una sesión de bisect.',
      },
      {
        code: 'git bisect bad',
        explanation: 'Marca el commit actual como roto.',
      },
      {
        code: 'git bisect good v1.4.0',
        explanation:
          'Marca el tag `v1.4.0` como una versión que funcionaba. Ahora git se mueve a un commit intermedio para que lo pruebes.',
      },
      {
        code: 'git bisect skip',
        explanation: 'Se salta un commit que no puedes probar (por ejemplo, uno que no compila).',
      },
      {
        code: 'git bisect run npm test',
        explanation:
          'Automatiza la búsqueda: git ejecuta `npm test` en cada paso y marca el commit como bueno o malo según el resultado.',
      },
      {
        code: 'git bisect reset',
        explanation: 'Termina la sesión y vuelve a tu rama original.',
      },
    ],
    tips: [
      'Puedes empezar en una sola línea: `git bisect start HEAD v1.4.0` (primero el commit malo y después el bueno).',
      'Durante un bisect estás en detached HEAD: no hagas commits ahí, solo prueba y responde.',
      '¿Marcaste algo mal por error? `git bisect log` muestra tus respuestas; puedes hacer `git bisect reset` y empezar de nuevo.',
    ],
    related: ['log', 'blame', 'show'],
    keywords: ['encontrar bug', 'regresión', 'qué commit lo rompió', 'búsqueda binaria', 'depurar', 'cuándo se rompió'],
  },

  // ------------------------------------------------------------------- tags
  {
    id: 'tag',
    command: 'git tag',
    category: 'tags',
    level: 2,
    summary: 'Marca un commit específico con un nombre, normalmente una versión.',
    description:
      'Un tag es un nombre fijo para un commit, como `v1.0.0`. A diferencia de una rama, nunca se mueve: siempre apunta al mismo commit, lo que lo hace perfecto para marcar versiones publicadas (releases).\n\n' +
      'Hay dos tipos:\n\n' +
      '- **Anotado** (`-a`): un objeto completo con su propio mensaje, autor y fecha. Recomendado para releases.\n' +
      '- **Ligero**: solo un nombre que apunta a un commit, como un marcador.\n\n' +
      'Los tags **no** se envían con un `git push` normal: tienes que subirlos explícitamente.',
    syntax: [
      'git tag',
      'git tag -a <nombre> -m "<mensaje>"',
      'git tag <nombre> [<commit>]',
      'git push <remoto> <tag>',
      'git tag -d <nombre>',
    ],
    examples: [
      {
        code: 'git tag',
        explanation: 'Lista todos los tags.',
      },
      {
        code: 'git tag -l "v1.*"',
        explanation: 'Lista los tags que coinciden con un patrón.',
      },
      {
        code: 'git tag -a v1.0.0 -m "First stable release"',
        explanation: 'Crea un tag anotado en el commit actual.',
      },
      {
        code: 'git tag v0.9.0 a1b2c3d',
        explanation: 'Crea un tag ligero en un commit más antiguo.',
      },
      {
        code: 'git push origin v1.0.0',
        explanation: 'Publica un tag en el remoto.',
      },
      {
        code: 'git push origin --tags',
        explanation: 'Publica todos tus tags locales.',
      },
      {
        code: 'git tag -d v1.0.0 && git push origin --delete v1.0.0',
        explanation: 'Borra un tag en local y en el remoto.',
      },
    ],
    tips: [
      'Sigue el versionado semántico: `vMAYOR.MENOR.PARCHE` (por ejemplo `v2.3.1`).',
      '`git switch --detach v1.0.0` te permite ver el código exactamente como estaba en esa versión.',
      'No muevas ni vuelvas a crear un tag que otros ya descargaron; publica una versión nueva en su lugar.',
    ],
    related: ['show', 'push', 'log', 'switch'],
    keywords: ['release', 'versión', 'marcar commit', 'etiqueta', 'semver', 'hito', 'publicar versión'],
  },
];
