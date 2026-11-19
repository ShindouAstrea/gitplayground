import type { GuideCommand } from '../../../content/types';

export const guideCommands: GuideCommand[] = [
  // ------------------------------------------------------------------ setup
  {
    id: 'config',
    command: 'git config',
    category: 'setup',
    level: 1,
    summary: 'Set your name, email and other preferences that git uses.',
    description:
      "Before your first commit, git needs to know who you are: every commit records an author name and email. `git config` reads and writes these settings, along with many other preferences (default editor, aliases, how `git pull` behaves...).\n\n" +
      'Settings live at three levels, and the most specific one wins:\n\n' +
      '- `--system`: every user on the machine\n' +
      '- `--global`: your user account (the usual choice), stored in `~/.gitconfig`\n' +
      "- `--local`: only the current repository (the default when you're inside one), stored in `.git/config`\n\n" +
      'You normally set your identity once with `--global` and forget about it. Use a local value when one project needs something different, for example your work email in a work repository.',
    syntax: [
      'git config --global <key> "<value>"',
      'git config <key>',
      'git config --list --show-origin',
      'git config --global --unset <key>',
      'git config --global --edit',
    ],
    examples: [
      {
        code: 'git config --global user.name "Ada Lovelace"',
        explanation: 'Sets the author name used in all your commits.',
      },
      {
        code: 'git config --global user.email "ada@example.com"',
        explanation:
          'Sets the author email. Use the same email as your GitHub/GitLab account so your commits are linked to your profile.',
      },
      {
        code: 'git config --global init.defaultBranch main',
        explanation:
          'New repositories created with `git init` will start on a branch called `main` instead of `master`.',
      },
      {
        code: 'git config --global pull.rebase false',
        explanation:
          'Tells `git pull` to merge when your branch and the remote have diverged (and stops git from asking every time).',
      },
      {
        code: 'git config --global core.editor "code --wait"',
        explanation: 'Uses VS Code to write commit messages and edit interactive rebases.',
      },
      {
        code: 'git config --list --show-origin',
        explanation:
          "Lists every setting in effect and the file it comes from. Handy when a value isn't what you expect.",
      },
      {
        code: 'git config --global alias.st status',
        explanation: 'Creates an alias, so `git st` runs `git status`.',
      },
    ],
    tips: [
      'Run `git config user.email` inside a repository to see which email will actually be used there (a local value overrides the global one).',
      'A nice alias for a compact history: `git config --global alias.lg "log --oneline --graph --all"`, then just type `git lg`.',
      "Your name and email are not a login: they're just text stamped on each commit. Authenticating with GitHub is handled separately (SSH keys or a credential manager).",
    ],
    related: ['init', 'commit', 'pull'],
    keywords: ['setup', 'configure', 'name', 'email', 'identity', 'alias', 'settings', 'preferences'],
  },
  {
    id: 'init',
    command: 'git init',
    category: 'setup',
    level: 1,
    summary: 'Create a new, empty git repository in the current folder.',
    description:
      '`git init` turns an ordinary folder into a git repository by creating a hidden `.git` directory inside it. That directory **is** the repository: it stores every commit, branch and setting. Your files stay exactly where they are; git just becomes able to track them.\n\n' +
      "Use it when you start a brand-new project, or when you have an existing project that isn't under version control yet. If the project already exists on GitHub or another server, use `git clone` instead.\n\n" +
      'After `git init` nothing is tracked yet: you still need to `git add` your files and make the first `git commit`.',
    syntax: ['git init', 'git init <directory>', 'git init -b <branch>'],
    examples: [
      {
        code: 'git init',
        explanation: 'Turns the current folder into a git repository.',
      },
      {
        code: 'git init my-project',
        explanation:
          'Creates the folder `my-project` (if it doesn\'t exist) and initializes a repository inside it.',
      },
      {
        code: 'git init -b main',
        explanation: 'Initializes the repository using `main` as the name of the first branch.',
      },
      {
        code: 'git init --bare server-repo.git',
        explanation:
          'Creates a "bare" repository: only the history, no working files. This is the kind of repository servers use as a shared remote.',
      },
    ],
    tips: [
      "Running `git init` in a folder that is already a repository is safe: it doesn't erase anything.",
      "Be careful not to run it in your home folder or a drive root by accident: git would treat everything below it as one huge repository. If that happens, just delete that stray `.git` folder.",
      'Create a `.gitignore` file early to keep things like `node_modules/`, build output or `.env` out of the repository.',
    ],
    related: ['clone', 'config', 'add', 'commit'],
    keywords: ['create repository', 'new repo', 'start project', 'initialize', 'version control', 'gitignore'],
  },
  {
    id: 'clone',
    command: 'git clone',
    category: 'setup',
    level: 1,
    summary: 'Download a complete copy of an existing repository.',
    description:
      '`git clone` copies a repository from somewhere else (usually GitHub, GitLab or a company server) to your computer. You get all the files **and** the whole history: every commit and every branch.\n\n' +
      'It also sets things up for you: the source is saved as a remote called `origin`, and the default branch (e.g. `main`) is checked out and linked to `origin/main`, so `git pull` and `git push` work right away.\n\n' +
      'Use it whenever you want to work on a project that already exists. You only clone once; after that you stay up to date with `git pull` or `git fetch`.',
    syntax: [
      'git clone <url>',
      'git clone <url> <directory>',
      'git clone --branch <branch> <url>',
      'git clone --depth 1 <url>',
    ],
    examples: [
      {
        code: 'git clone https://github.com/vitejs/vite.git',
        explanation: 'Clones the repository into a new folder named `vite`.',
      },
      {
        code: 'git clone git@github.com:my-user/my-app.git',
        explanation: 'Clones using SSH (requires an SSH key added to your account).',
      },
      {
        code: 'git clone https://github.com/my-user/my-app.git app',
        explanation: 'Clones into a folder called `app` instead of `my-app`.',
      },
      {
        code: 'git clone --branch develop https://github.com/my-user/my-app.git',
        explanation: 'Clones and checks out the `develop` branch instead of the default one.',
      },
      {
        code: 'git clone --depth 1 https://github.com/torvalds/linux.git',
        explanation:
          'Shallow clone: only the latest commit, without the history. Much faster for huge repositories when you just need the code.',
      },
    ],
    tips: [
      'HTTPS URLs are the easiest way to start; SSH URLs (`git@github.com:...`) save you from typing credentials once your key is set up.',
      "Clone into a normal folder, not inside another repository, then `cd` into the new directory before running other git commands.",
      'Only the default branch is created locally, but all remote branches are downloaded. `git switch <name>` creates a local branch from `origin/<name>` automatically.',
    ],
    related: ['init', 'remote', 'pull', 'fetch'],
    keywords: ['download', 'copy repository', 'get project', 'github', 'ssh', 'https'],
  },

  // ----------------------------------------------------------------- basics
  {
    id: 'status',
    command: 'git status',
    category: 'basics',
    level: 1,
    summary: 'Show what changed: modified, staged and untracked files.',
    description:
      "`git status` is your dashboard. It tells you which branch you're on, how it compares to its remote branch, and the state of every changed file. Run it constantly: before adding, before committing, and whenever you're unsure what's going on.\n\n" +
      'Files are grouped into three sections:\n\n' +
      '- **Changes to be committed**: staged files, which will go into the next commit\n' +
      "- **Changes not staged for commit**: tracked files you modified but haven't added yet\n" +
      "- **Untracked files**: new files git isn't tracking yet\n\n" +
      "During a merge, rebase or cherry-pick, `git status` also tells you what's in progress, which files have conflicts, and which command to run next.",
    syntax: ['git status', 'git status -s', 'git status -sb', 'git status --ignored'],
    examples: [
      {
        code: 'git status',
        explanation: 'Full, explained output, with hints about what you can do next.',
      },
      {
        code: 'git status -s',
        explanation:
          'Short format, one line per file: `M` = modified, `A` = added, `??` = untracked. The left column is the staging area and the right column is your working directory.',
      },
      {
        code: 'git status -sb',
        explanation: 'Short format plus the branch line, e.g. `## main...origin/main [ahead 2]`.',
      },
      {
        code: 'git status --ignored',
        explanation: 'Also lists the files being ignored because of `.gitignore`.',
      },
    ],
    tips: [
      'Read the hints: `git status` often prints the exact command to undo or continue, such as `use "git restore --staged <file>..." to unstage`.',
      "\"Your branch is ahead of 'origin/main' by 2 commits\" means you have local commits you haven't pushed yet. This ahead/behind info is only as fresh as your last `git fetch`.",
    ],
    related: ['add', 'diff', 'commit', 'restore'],
    keywords: ['what changed', 'state', 'modified files', 'untracked', 'staged', 'current branch', 'check'],
  },
  {
    id: 'add',
    command: 'git add',
    category: 'basics',
    level: 1,
    summary: 'Put changes into the staging area, ready for the next commit.',
    description:
      "Git doesn't automatically commit everything you changed. First you choose what goes into the next commit by adding it to the **staging area** (also called the index). `git add` does exactly that: it takes a snapshot of the file as it is right now and stages it.\n\n" +
      'This lets you build clean commits: if you fixed a bug and also tweaked some styles, you can add and commit them separately.\n\n' +
      'Important: `git add` stages the content **at that moment**. If you edit the file again afterwards, you need to add it again to include the new changes.\n\n' +
      '`git add` is also how you start tracking a new file, and how you mark a conflict as resolved during a merge or rebase.',
    syntax: ['git add <file>...', 'git add <directory>', 'git add .', 'git add -A', 'git add -p'],
    examples: [
      {
        code: 'git add index.html',
        explanation: 'Stages a single file.',
      },
      {
        code: 'git add src/components/',
        explanation: 'Stages everything that changed inside that folder.',
      },
      {
        code: 'git add .',
        explanation:
          'Stages all changes (new, modified and deleted files) in the current directory and its subfolders.',
      },
      {
        code: 'git add -A',
        explanation: "Stages all changes in the whole repository, no matter which folder you're in.",
      },
      {
        code: 'git add -p',
        explanation:
          'Interactive mode: shows each change ("hunk") and asks whether to stage it (`y`/`n`, `s` to split it smaller). Great for splitting your work into several commits.',
      },
      {
        code: 'git add "*.css"',
        explanation:
          'Stages all CSS files. The quotes let git expand the pattern itself, so it also matches files in subfolders.',
      },
    ],
    tips: [
      'Run `git status` or `git diff --staged` before committing to double-check what you staged.',
      'To unstage something without losing your edits, use `git restore --staged <file>`.',
      'Files listed in `.gitignore` are skipped by `git add .`, which is what you want for things like `node_modules/` or `.env`.',
    ],
    related: ['status', 'commit', 'restore', 'diff', 'rm'],
    keywords: ['stage', 'staging area', 'index', 'prepare commit', 'track file', 'include changes'],
  },
  {
    id: 'commit',
    command: 'git commit',
    category: 'basics',
    level: 1,
    summary: 'Save a snapshot of the staged changes in the history.',
    description:
      'A commit is a saved snapshot of your project, with a message explaining what changed and why. `git commit` takes whatever is in the staging area and records it as a new commit on the current branch. Each commit has a unique id (a hash like `a1b2c3d`), an author, a date and a link to its parent commit; together they form the history.\n\n' +
      "Only staged changes are included. Anything you didn't `git add` stays in your working directory, untouched, for a later commit.\n\n" +
      'Good habits:\n\n' +
      '- Make small commits that do one thing\n' +
      '- Write a short summary line (around 50 characters) in the imperative: "Add login form", "Fix crash on empty cart"\n' +
      '- If you need more detail, leave a blank line after the summary and explain the why',
    syntax: [
      'git commit -m "<message>"',
      'git commit',
      'git commit -a -m "<message>"',
      'git commit -m "<title>" -m "<body>"',
      'git commit --amend',
    ],
    examples: [
      {
        code: 'git commit -m "Add login form"',
        explanation: 'Creates a commit with the staged changes and a one-line message.',
      },
      {
        code: 'git commit',
        explanation:
          'Opens your editor so you can write a longer message (title, blank line, body). Saving and closing the editor creates the commit.',
      },
      {
        code: 'git commit -am "Fix typo in README"',
        explanation:
          'Stages all modified **tracked** files and commits them in one step. New (untracked) files are not included.',
      },
      {
        code: 'git commit -m "Fix cart total" -m "Discounts were applied twice when a coupon was used."',
        explanation:
          'Each `-m` becomes a separate paragraph: the first one is the title, the second one the body.',
      },
      {
        code: 'git commit --allow-empty -m "Trigger CI"',
        explanation: 'Creates a commit with no changes, sometimes used to re-run a CI pipeline.',
      },
    ],
    tips: [
      "If the editor that opens is Vim and you're stuck: press `Esc`, type `:wq` and press Enter to save and exit (or `:q!` to quit without committing).",
      "Forgot a file or made a typo in the message? If you haven't pushed yet, `git commit --amend` fixes the last commit.",
      'Commit often. Commits are cheap, and small commits are much easier to review, revert or cherry-pick later.',
    ],
    related: ['add', 'status', 'commit-amend', 'log', 'diff'],
    keywords: ['save', 'snapshot', 'record changes', 'message', 'checkpoint', 'version'],
  },
  {
    id: 'diff',
    command: 'git diff',
    category: 'basics',
    level: 1,
    summary: 'Show the exact lines that changed.',
    description:
      '`git diff` shows changes line by line: lines starting with `-` were removed and lines starting with `+` were added. Use it to review your work before staging or committing.\n\n' +
      'What you see depends on what you compare:\n\n' +
      "- `git diff`: working directory vs staging area (changes you haven't added yet)\n" +
      '- `git diff --staged`: staging area vs last commit (what will go into the next commit)\n' +
      '- `git diff HEAD`: everything that changed since the last commit, staged or not\n' +
      '- `git diff <a> <b>`: any two commits or branches\n\n' +
      'If `git diff` shows nothing but you know you changed something, those changes are probably already staged: try `git diff --staged`.',
    syntax: [
      'git diff',
      'git diff --staged',
      'git diff <commit> <commit>',
      'git diff <branch>...<branch>',
      'git diff <commit> -- <file>',
    ],
    examples: [
      {
        code: 'git diff',
        explanation: 'Unstaged changes in all files.',
      },
      {
        code: 'git diff --staged',
        explanation: 'What you staged and will commit (`--cached` means the same).',
      },
      {
        code: 'git diff HEAD~1 HEAD',
        explanation: 'The changes introduced by the last commit.',
      },
      {
        code: 'git diff main feature/login',
        explanation: 'Differences between the latest commits of two branches.',
      },
      {
        code: 'git diff main...feature/login',
        explanation:
          'Only what changed on `feature/login` since it branched off `main`: what a pull request would show.',
      },
      {
        code: 'git diff --stat',
        explanation: 'A summary of which files changed and how many lines, without the details.',
      },
      {
        code: 'git diff HEAD -- src/app.ts',
        explanation:
          'Changes to a single file since the last commit. The `--` separates commits from file paths.',
      },
    ],
    tips: [
      'Press `q` to exit when the diff is long; use the arrow keys or the space bar to scroll.',
      '`git diff --word-diff` highlights changed words instead of whole lines, which is handy for text and long lines.',
      "New untracked files don't show up in `git diff` until you `git add` them.",
    ],
    related: ['status', 'add', 'show', 'log'],
    keywords: ['changes', 'compare', 'differences', 'what changed', 'lines', 'review'],
  },
  {
    id: 'log',
    command: 'git log',
    category: 'basics',
    level: 1,
    summary: 'Browse the commit history.',
    description:
      "`git log` lists commits starting from the most recent one, showing each commit's hash, author, date and message. It's how you find out what happened, when and by whom, and where you get the commit ids that other commands (`show`, `revert`, `reset`, `cherry-pick`...) need.\n\n" +
      'By default it shows the history of the current branch. You can filter by author, date, message, file or content, and use `--oneline --graph` to see branches and merges drawn as a diagram.',
    syntax: [
      'git log',
      'git log --oneline --graph --all',
      'git log -n <number>',
      'git log <branch>..<branch>',
      'git log -- <file>',
      'git log -S "<text>"',
    ],
    examples: [
      {
        code: 'git log --oneline',
        explanation: 'One commit per line: short hash and message.',
      },
      {
        code: 'git log --oneline --graph --all',
        explanation:
          'Draws all branches and their merges as a text graph. The most useful view to understand the shape of the history.',
      },
      {
        code: 'git log -3',
        explanation: 'Only the last 3 commits.',
      },
      {
        code: 'git log main..feature/login',
        explanation: 'Commits that are on `feature/login` but not yet on `main`.',
      },
      {
        code: 'git log -p -- src/app.ts',
        explanation: 'The history of one file, including the diff of each commit.',
      },
      {
        code: 'git log --author="Ada" --since="2 weeks ago"',
        explanation: 'Commits by Ada in the last two weeks.',
      },
      {
        code: 'git log -S "calculateTotal"',
        explanation:
          'Commits that added or removed the text `calculateTotal`: great for finding when a function appeared or disappeared.',
      },
    ],
    tips: [
      'Press `q` to leave the log, space to page down, and `/` to search inside it.',
      "`git log origin/main..HEAD` shows the commits you're about to push.",
      'Commits you "lost" with a reset or a rebase don\'t appear here anymore; look for them in `git reflog`.',
    ],
    related: ['show', 'diff', 'reflog', 'blame'],
    keywords: ['history', 'commits', 'past changes', 'who changed', 'timeline', 'graph'],
  },
  {
    id: 'show',
    command: 'git show',
    category: 'basics',
    level: 1,
    summary: "Display a commit's details and the changes it introduced.",
    description:
      '`git show` displays one object in detail. For a commit, that means its metadata (author, date, message) followed by the full diff of what it changed. Without arguments it shows the latest commit (`HEAD`).\n\n' +
      "It can also print a file exactly as it was in any commit or branch, which is useful to look at an old version without switching to it.",
    syntax: [
      'git show',
      'git show <commit>',
      'git show --stat <commit>',
      'git show <commit>:<file>',
      'git show <tag>',
    ],
    examples: [
      {
        code: 'git show',
        explanation: 'The last commit and its changes.',
      },
      {
        code: 'git show a1b2c3d',
        explanation: 'A specific commit, identified by its (short) hash.',
      },
      {
        code: 'git show HEAD~2',
        explanation: 'The commit two steps before the current one.',
      },
      {
        code: 'git show --stat HEAD',
        explanation: 'Only the list of files changed in the last commit, with line counts.',
      },
      {
        code: 'git show main:package.json',
        explanation: 'The contents of `package.json` as it is on `main`, without switching branches.',
      },
      {
        code: 'git show v1.0.0',
        explanation: 'Information about the tag and the commit it points to.',
      },
    ],
    tips: [
      '`HEAD~1` (or `HEAD~`) is the parent of the current commit, `HEAD~2` the grandparent, and so on.',
      'Save an old version of a file to disk: `git show HEAD~3:config.json > old-config.json`.',
    ],
    related: ['log', 'diff', 'tag', 'blame'],
    keywords: ['inspect commit', 'details', 'view changes', 'old version', 'file at commit'],
  },
  {
    id: 'rm',
    command: 'git rm',
    category: 'basics',
    level: 1,
    summary: 'Delete a file and stage the deletion, or stop tracking it.',
    description:
      '`git rm` removes a file from your working directory **and** stages that removal, so the next commit records the file as deleted. It\'s the same as deleting the file yourself and then running `git add` on it.\n\n' +
      'With `--cached` it does something different and very useful: it stops tracking the file (it disappears from the repository in the next commit) but **keeps it on your disk**. That\'s the fix when you accidentally committed something that should have been ignored, like `.env` or `node_modules/`.',
    syntax: [
      'git rm <file>',
      'git rm -r <directory>',
      'git rm --cached <file>',
      'git rm -r --cached <directory>',
    ],
    examples: [
      {
        code: 'git rm old-script.js',
        explanation: 'Deletes the file and stages the deletion.',
      },
      {
        code: 'git rm -r docs/drafts',
        explanation: 'Deletes a whole folder (`-r` = recursive).',
      },
      {
        code: 'git rm --cached .env',
        explanation:
          "Stops tracking `.env` but leaves your local copy. Add it to `.gitignore` afterwards so it doesn't sneak back in.",
      },
      {
        code: 'git rm -r --cached node_modules',
        explanation:
          'Removes an accidentally committed `node_modules` folder from the repository while keeping it locally.',
      },
    ],
    tips: [
      'Git refuses to remove a file that has uncommitted changes, to protect your work. `-f` forces it, but think twice.',
      'If you already deleted a file by hand, `git add <file>` (or `git add -A`) stages the deletion too.',
      "`--cached` only removes the file from future commits: it's still inside the old ones. If it contained a password or API key, consider it leaked and change it.",
    ],
    related: ['mv', 'add', 'status', 'restore'],
    keywords: ['delete file', 'remove', 'untrack', 'stop tracking', 'gitignore', 'unversion'],
  },
  {
    id: 'mv',
    command: 'git mv',
    category: 'basics',
    level: 1,
    summary: 'Rename or move a file and stage the change.',
    description:
      '`git mv` renames or moves a tracked file and stages the change in one step. It\'s a shortcut for moving the file yourself, then running `git rm` on the old path and `git add` on the new one.\n\n' +
      "Git doesn't actually store renames: it detects them by comparing contents. So `git mv` and a manual move end up the same; `git mv` just saves you steps. Where it really helps is changing only the capitalization of a name (`readme.md` to `README.md`) on Windows or macOS, whose file systems ignore case.",
    syntax: ['git mv <source> <destination>', 'git mv <file>... <directory>'],
    examples: [
      {
        code: 'git mv app.js main.js',
        explanation: 'Renames `app.js` to `main.js` and stages the rename.',
      },
      {
        code: 'git mv utils.ts src/lib/',
        explanation: 'Moves the file into the `src/lib/` folder.',
      },
      {
        code: 'git mv readme.md README.md',
        explanation:
          'Changes only the capitalization, which can confuse git on case-insensitive systems if you do it by hand.',
      },
    ],
    tips: [
      "`git log --follow -- <file>` shows a file's history across renames.",
      'Avoid renaming and heavily editing a file in the same commit: git may no longer recognize it as a rename.',
    ],
    related: ['rm', 'add', 'status'],
    keywords: ['rename', 'move file', 'relocate', 'change name', 'capitalization'],
  },

  // -------------------------------------------------------------- branching
  {
    id: 'branch',
    command: 'git branch',
    category: 'branching',
    level: 1,
    summary: 'List, create, rename and delete branches.',
    description:
      'A branch is a movable label that points to a commit. When you commit, the current branch moves forward to the new commit. Branches let you work on a feature or a fix in isolation, without touching `main`, and later bring that work back with a merge or a rebase.\n\n' +
      "`git branch` manages those labels. Without arguments it lists your local branches (the current one is marked with `*`). Note that `git branch <name>` creates a branch but does **not** switch to it; to create one and move to it at once, use `git switch -c <name>`.\n\n" +
      "Branches are very cheap in git (creating one just writes a commit id to a small file), so use them freely.",
    syntax: [
      'git branch',
      'git branch <name>',
      'git branch -m <old> <new>',
      'git branch -d <branch>',
      'git branch -a',
      'git branch -u <remote>/<branch>',
    ],
    examples: [
      {
        code: 'git branch',
        explanation: "Lists local branches; `*` marks the one you're on.",
      },
      {
        code: 'git branch -a',
        explanation: 'Also lists remote-tracking branches, such as `remotes/origin/main`.',
      },
      {
        code: 'git branch -vv',
        explanation:
          "Shows each branch's last commit and its upstream (remote branch), with ahead/behind counts.",
      },
      {
        code: 'git branch feature/search',
        explanation: 'Creates the branch at the current commit, but you stay where you are.',
      },
      {
        code: 'git branch -m master main',
        explanation:
          'Renames `master` to `main`. With a single name, it renames the current branch.',
      },
      {
        code: 'git branch -d feature/search',
        explanation:
          'Deletes a branch that has already been merged. Git refuses if it contains unmerged work.',
      },
      {
        code: 'git branch -D experiment',
        explanation: "Force-deletes a branch even if its commits aren't merged anywhere.",
      },
    ],
    tips: [
      '`git branch --merged` lists the branches already merged into the current one: safe candidates for cleanup.',
      "Deleting a local branch doesn't delete it on the server; use `git push origin --delete <branch>` for that.",
      'Use descriptive names with prefixes, like `feature/login`, `fix/cart-total` or `docs/readme`.',
    ],
    warning:
      "`git branch -D` deletes a branch even if its commits exist nowhere else. You can usually recover them for a while with `git reflog`, but don't count on it.",
    related: ['switch', 'checkout', 'merge', 'push'],
    keywords: ['create branch', 'delete branch', 'rename branch', 'list branches', 'feature branch', 'cleanup'],
  },
  {
    id: 'switch',
    command: 'git switch',
    category: 'branching',
    level: 1,
    summary: 'Move to another branch, or create one and move to it.',
    description:
      '`git switch` changes the branch you\'re working on. It updates the files in your folder to match that branch and moves `HEAD` (git\'s "you are here" marker) to it, so new commits will go to that branch.\n\n' +
      'It was added in git 2.23 to take over the branch-related half of the old, overloaded `git checkout`. It\'s clearer and safer, so it\'s the recommended way to change branches today.\n\n' +
      'If you have uncommitted changes that the switch would overwrite, git stops and tells you. Commit them, stash them (`git stash`) or discard them first. Changes that don\'t conflict simply come along to the new branch.',
    syntax: [
      'git switch <branch>',
      'git switch -c <new-branch>',
      'git switch -c <new-branch> <start-point>',
      'git switch -',
      'git switch --detach <commit>',
    ],
    examples: [
      {
        code: 'git switch main',
        explanation: 'Goes to the `main` branch.',
      },
      {
        code: 'git switch -c feature/login',
        explanation: 'Creates `feature/login` from the current commit and switches to it.',
      },
      {
        code: 'git switch -c hotfix/header origin/main',
        explanation: 'Creates a new branch starting from `origin/main` instead of from where you are.',
      },
      {
        code: 'git switch -',
        explanation: 'Goes back to the previous branch, like `cd -` in the terminal.',
      },
      {
        code: 'git switch feature/payments',
        explanation:
          'If the branch only exists on the remote (`origin/feature/payments`), git creates a local branch that tracks it.',
      },
      {
        code: 'git switch --detach v1.2.0',
        explanation:
          'Moves to the commit of a tag without being on any branch ("detached HEAD"), to look around or test an old version.',
      },
    ],
    tips: [
      'Equivalents with the old command: `git switch <b>` = `git checkout <b>`, and `git switch -c <b>` = `git checkout -b <b>`.',
      'If you made commits in detached HEAD and want to keep them, create a branch right there: `git switch -c <name>`.',
      'Started working on the wrong branch? `git switch -c <name>` takes your uncommitted changes along to a new branch.',
    ],
    related: ['branch', 'checkout', 'stash', 'restore'],
    keywords: ['change branch', 'go to branch', 'create branch', 'move to branch', 'detached head', 'jump'],
  },
  {
    id: 'checkout',
    command: 'git checkout',
    category: 'branching',
    level: 2,
    summary: 'The classic all-in-one command: switch branches or restore files.',
    description:
      "`git checkout` is the original command for both changing branches and restoring files. Because it did too many unrelated things (and a small typo could discard your work), git 2.23 split it into `git switch` (branches) and `git restore` (files). `checkout` still works and you'll see it everywhere in tutorials, scripts and answers online, so it's worth recognizing.\n\n" +
      'Equivalents:\n\n' +
      '- `git checkout <branch>` = `git switch <branch>`\n' +
      '- `git checkout -b <new>` = `git switch -c <new>`\n' +
      '- `git checkout <commit>` = `git switch --detach <commit>`\n' +
      '- `git checkout -- <file>` = `git restore <file>` (discards changes!)\n' +
      '- `git checkout <commit> -- <file>` = `git restore --source <commit> --staged --worktree <file>`\n\n' +
      'The `--` means "what follows are file paths", which avoids ambiguity when a file and a branch have the same name.',
    syntax: [
      'git checkout <branch>',
      'git checkout -b <new-branch> [<start-point>]',
      'git checkout <commit>',
      'git checkout -- <file>',
      'git checkout <commit> -- <file>',
    ],
    examples: [
      {
        code: 'git checkout main',
        explanation: 'Switches to `main` (same as `git switch main`).',
      },
      {
        code: 'git checkout -b fix/navbar',
        explanation: 'Creates `fix/navbar` and switches to it (same as `git switch -c fix/navbar`).',
      },
      {
        code: 'git checkout a1b2c3d',
        explanation: 'Moves to an old commit in "detached HEAD" state, to inspect it.',
      },
      {
        code: 'git checkout -- src/app.ts',
        explanation:
          'Throws away the unstaged changes in `src/app.ts` (same as `git restore src/app.ts`).',
      },
      {
        code: 'git checkout main -- package.json',
        explanation: 'Replaces your `package.json` with the version from `main`, and stages it.',
      },
    ],
    tips: [
      'In your own work, prefer `switch` and `restore`: their names say what they do and they\'re harder to misuse.',
      '"Detached HEAD" just means you\'re on a commit instead of a branch. It\'s harmless; create a branch if you want to keep commits you make there.',
    ],
    warning:
      "`git checkout -- <file>` and `git checkout <commit> -- <file>` overwrite your local changes to those files without asking, and git can't bring them back.",
    related: ['switch', 'restore', 'branch'],
    keywords: ['change branch', 'discard changes', 'old version', 'detached head', 'legacy command', 'restore file'],
  },
  {
    id: 'merge',
    command: 'git merge',
    category: 'branching',
    level: 2,
    summary: 'Join the history of another branch into the current one.',
    description:
      '`git merge <branch>` brings the commits of `<branch>` into the branch you\'re on. The typical flow: you finish a feature on `feature/login`, switch to `main` and merge it in.\n\n' +
      'Git chooses one of two ways automatically:\n\n' +
      "- **Fast-forward**: if your current branch hasn't moved since the other branch was created, git simply moves the label forward to the other branch's latest commit. No new commit is created and the history stays a straight line.\n" +
      '- **Merge commit** (three-way merge): if both branches have new commits, git combines them and creates a special commit with two parents that ties both histories together.\n\n' +
      'Use `--no-ff` to always create a merge commit, even when a fast-forward is possible; some teams like it because it shows where a feature started and ended. `--ff-only` is the opposite: merge only if it can be a fast-forward, and fail otherwise.\n\n' +
      '**Conflicts** happen when both branches changed the same lines (or one deleted a file the other edited). Git pauses the merge and marks the clashing areas in the files with `<<<<<<<`, `=======` and `>>>>>>>`. The upper part (`HEAD`, "ours") is your current branch; the lower part ("theirs") is the branch you\'re merging in. To resolve:\n\n' +
      '- Run `git status` to see the conflicted files ("both modified")\n' +
      '- Edit each one, keep the right code and delete the markers\n' +
      '- Run `git add <file>` to mark it as resolved\n' +
      '- Run `git commit` (or `git merge --continue`) to finish the merge\n\n' +
      'If you get lost, `git merge --abort` cancels the merge and puts everything back as it was before you started.',
    syntax: [
      'git merge <branch>',
      'git merge --no-ff <branch>',
      'git merge --ff-only <branch>',
      'git merge --squash <branch>',
      'git merge --continue',
      'git merge --abort',
    ],
    examples: [
      {
        code: 'git merge feature/login',
        explanation: 'Merges `feature/login` into the current branch (for example, `main`).',
      },
      {
        code: 'git merge --no-ff feature/login',
        explanation:
          'Always creates a merge commit, keeping the feature visible as a group in the history.',
      },
      {
        code: 'git merge --ff-only origin/main',
        explanation:
          'Updates your branch to `origin/main` only if it is a clean fast-forward; fails instead of creating a merge commit.',
      },
      {
        code: 'git merge --squash feature/experiment',
        explanation:
          'Puts all the changes of the branch into the staging area without committing; then `git commit` creates one single, regular commit.',
      },
      {
        code: 'git restore --theirs src/config.ts',
        explanation:
          "During a conflict, keeps the incoming branch's version of the whole file (`--ours` keeps yours). Then `git add` it.",
      },
      {
        code: 'git merge --continue',
        explanation: 'After resolving and adding every conflicted file, finishes the merge.',
      },
      {
        code: 'git merge --abort',
        explanation: 'Cancels a merge with conflicts and restores the state from before the merge.',
      },
    ],
    tips: [
      'Before merging, make sure your working directory is clean (`git status`) and the branch you merge into is up to date (`git pull`).',
      'Editors like VS Code show buttons such as "Accept Current" / "Accept Incoming" on conflict markers, which makes resolving much easier.',
      "Merging never rewrites existing commits, so it's always safe on shared branches.",
      '`git log --oneline --graph` shows clearly whether a merge was a fast-forward or created a merge commit.',
    ],
    related: ['branch', 'switch', 'rebase', 'pull', 'revert'],
    keywords: ['combine branches', 'join', 'integrate', 'conflict', 'fast-forward', 'merge commit', 'resolve conflicts'],
  },

  // ------------------------------------------------------------------- undo
  {
    id: 'restore',
    command: 'git restore',
    category: 'undo',
    level: 1,
    summary: 'Discard changes in files, or unstage them.',
    description:
      '`git restore` (git 2.23+) puts files back to a previous state. It\'s the modern, focused replacement for the file-related uses of `git checkout` and `git reset <file>`.\n\n' +
      'Its two main uses:\n\n' +
      '- `git restore <file>`: discards your unstaged changes, returning the file to its staged version (normally, the last commit)\n' +
      '- `git restore --staged <file>`: unstages the file (undoes a `git add`) but keeps your edits in it\n\n' +
      'With `--source <commit>` you can bring back a file as it was in any commit, for example to recover something you deleted or broke several commits ago.',
    syntax: [
      'git restore <file>...',
      'git restore .',
      'git restore --staged <file>...',
      'git restore --staged --worktree <file>',
      'git restore --source <commit> <file>',
    ],
    examples: [
      {
        code: 'git restore src/app.ts',
        explanation: 'Discards the unstaged changes in `src/app.ts`.',
      },
      {
        code: 'git restore .',
        explanation:
          'Discards all unstaged changes in the current directory and below. Untracked files are left alone (see `git clean`).',
      },
      {
        code: 'git restore --staged src/app.ts',
        explanation: 'Removes the file from the staging area; your edits stay in the file.',
      },
      {
        code: 'git restore --staged --worktree src/app.ts',
        explanation:
          'Unstages **and** discards: the file goes back to exactly how it was in the last commit.',
      },
      {
        code: 'git restore --source HEAD~3 config.json',
        explanation:
          'Brings back `config.json` as it was three commits ago (only in your working directory; review it and commit if you want to keep it).',
      },
      {
        code: 'git restore deleted-page.html',
        explanation: 'Recovers a committed file that you deleted by accident.',
      },
    ],
    tips: [
      "`git status` shows these commands next to each section, so you don't need to memorize them.",
      'Old equivalents: `git checkout -- <file>` = `git restore <file>`, and `git reset <file>` = `git restore --staged <file>`.',
    ],
    warning:
      "`git restore <file>` (without `--staged`) permanently throws away the uncommitted changes in that file. They were never committed, so git can't bring them back.",
    related: ['reset', 'checkout', 'clean', 'add', 'status'],
    keywords: ['discard changes', 'undo changes', 'unstage', 'revert file', 'recover file', 'throw away edits'],
  },
  {
    id: 'reset',
    command: 'git reset',
    category: 'undo',
    level: 2,
    summary: 'Move the current branch to another commit, optionally discarding changes.',
    description:
      '`git reset <commit>` moves the current branch (and `HEAD`) to a different commit, usually an earlier one, so the later commits disappear from the branch. What happens to the changes from those commits depends on the mode:\n\n' +
      '- `--soft`: only moves the branch. The changes from the undone commits stay **staged**, ready to be committed again. Perfect for squashing your last few commits into one.\n' +
      '- `--mixed` (the default): moves the branch and clears the staging area. The changes stay in your files, but **unstaged**. Use it to redo your commits differently.\n' +
      '- `--hard`: moves the branch and makes both the staging area and your files match that commit. The changes from the undone commits **and** any uncommitted work are **thrown away**.\n\n' +
      'A way to remember it: `--soft` touches 1 thing (the branch), `--mixed` 2 (branch + staging area), `--hard` 3 (branch + staging area + your files).\n\n' +
      "Reset rewrites history, so use it on commits you haven't pushed. To undo something that's already shared, use `git revert`.\n\n" +
      "With a file path (`git reset <file>`) it doesn't move any branch: it just unstages that file, like `git restore --staged`.",
    syntax: [
      'git reset --soft <commit>',
      'git reset [--mixed] <commit>',
      'git reset --hard <commit>',
      'git reset <file>',
    ],
    examples: [
      {
        code: 'git reset --soft HEAD~1',
        explanation:
          'Undoes the last commit but keeps its changes staged. Typical for "I committed too early".',
      },
      {
        code: 'git reset HEAD~1',
        explanation: 'Undoes the last commit; its changes stay in your files, unstaged.',
      },
      {
        code: 'git reset --soft HEAD~3 && git commit -m "Add search feature"',
        explanation: 'Squashes the last 3 commits into a single one.',
      },
      {
        code: 'git reset --hard HEAD',
        explanation:
          'Discards all uncommitted changes in tracked files, going back to the last commit.',
      },
      {
        code: 'git reset --hard origin/main',
        explanation:
          'Makes your local branch identical to the remote one, discarding your local commits and changes. Run `git fetch` first.',
      },
      {
        code: 'git reset --hard ORIG_HEAD',
        explanation:
          'Undoes a merge, rebase or reset you just did (`ORIG_HEAD` is where `HEAD` was before that operation).',
      },
      {
        code: 'git reset src/app.ts',
        explanation: 'Unstages `src/app.ts` (same as `git restore --staged src/app.ts`).',
      },
    ],
    tips: [
      '`HEAD~1` means "one commit before HEAD". You can also use any hash from `git log`.',
      'Made a mistake with reset? `git reflog` shows where your branch was before, and `git reset --hard <that-hash>` takes you back.',
      'Before a risky `--hard`, create a backup branch (`git branch backup`) or run `git stash`, just in case.',
    ],
    warning:
      "`git reset --hard` permanently deletes uncommitted changes (they were never saved, so not even the reflog can recover them). Also, resetting commits you already pushed rewrites shared history: your next push will be rejected, and forcing it causes problems for your teammates. For pushed commits, use `git revert`.",
    related: ['restore', 'revert', 'reflog', 'commit-amend', 'stash'],
    keywords: ['undo commit', 'go back', 'uncommit', 'discard', 'remove last commit', 'roll back', 'reset hard'],
  },
  {
    id: 'revert',
    command: 'git revert',
    category: 'undo',
    level: 2,
    summary: 'Create a new commit that undoes an earlier commit.',
    description:
      "`git revert <commit>` doesn't delete anything: it creates a **new** commit that applies the opposite of the changes in `<commit>`. If the original added a line, the revert removes it, and vice versa. The history keeps both the mistake and its correction.\n\n" +
      "Because it only adds commits, it's the safe way to undo changes that are already pushed or on a shared branch like `main`: nobody's history gets rewritten, and your teammates just pull the new commit.\n\n" +
      'If later commits touched the same lines, the revert can conflict. Resolve it like a merge conflict, `git add` the files and run `git revert --continue` (or `git revert --abort` to give up).\n\n' +
      'To revert a merge commit you need `-m 1`, which tells git which parent is the "main line" to go back to (usually 1, the branch you merged into).',
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
          'Creates a commit that undoes `a1b2c3d`, opening the editor with a message like `Revert "Add banner"`.',
      },
      {
        code: 'git revert HEAD --no-edit',
        explanation: 'Undoes the last commit with the default message, without opening the editor.',
      },
      {
        code: 'git revert HEAD~3..HEAD',
        explanation:
          'Reverts the last three commits, creating one revert commit for each (newest first).',
      },
      {
        code: 'git revert --no-commit HEAD~3..HEAD',
        explanation:
          'Applies the three reverts to your files and staging area without committing, so you can make a single commit that undoes all of them.',
      },
      {
        code: 'git revert -m 1 9f8e7d6',
        explanation:
          'Reverts a merge commit, going back to the state of its first parent (the branch the feature was merged into).',
      },
      {
        code: 'git revert --abort',
        explanation: 'Cancels a revert that stopped because of conflicts.',
      },
    ],
    tips: [
      'Rule of thumb: commit not pushed yet, `reset` or `--amend` are fine; already pushed, use `revert`.',
      'You can revert a revert to bring the original change back.',
      "After reverting a merge, merging that same branch again won't bring back the reverted changes (git thinks they're already merged). Revert the revert instead.",
    ],
    related: ['reset', 'commit', 'merge', 'cherry-pick', 'log'],
    keywords: ['undo commit', 'undo pushed commit', 'safe undo', 'rollback', 'cancel changes', 'reverse commit'],
  },
  {
    id: 'commit-amend',
    command: 'git commit --amend',
    category: 'undo',
    level: 2,
    summary: 'Fix the last commit: change its message or add forgotten changes.',
    description:
      '`git commit --amend` replaces the last commit with a new one that combines it with whatever is currently staged. Use it for the classic "oops" moments right after committing: a typo in the message, a forgotten file, a leftover `console.log`.\n\n' +
      'If nothing is staged, it only lets you edit the message. If you staged changes, they are added into the commit.\n\n' +
      "It looks like you edited the commit, but technically it's a **new** commit with a different hash, and the old one is dropped from the branch. That's why amending is only safe for commits you haven't pushed yet.",
    syntax: [
      'git commit --amend',
      'git commit --amend -m "<new message>"',
      'git commit --amend --no-edit',
      'git commit --amend --reset-author --no-edit',
    ],
    examples: [
      {
        code: 'git commit --amend -m "Fix login redirect"',
        explanation: "Replaces the last commit's message.",
      },
      {
        code: 'git add forgotten.css && git commit --amend --no-edit',
        explanation: 'Adds a forgotten file to the last commit, keeping the same message.',
      },
      {
        code: 'git commit --amend',
        explanation:
          'Opens the editor with the current message so you can rewrite it; anything staged is included too.',
      },
      {
        code: 'git commit --amend --reset-author --no-edit',
        explanation:
          'Updates the author to your current `user.name` and `user.email` (useful if you committed with the wrong email).',
      },
    ],
    tips: [
      'To fix an older commit (not the last one), use `git commit --fixup <commit>` followed by `git rebase -i --autosquash`, or edit it directly in `git rebase -i`.',
      'Regret an amend? The previous version of the commit is still listed in `git reflog`.',
    ],
    warning:
      'Amending rewrites the last commit. If you already pushed it, your next push will be rejected and you would need `git push --force-with-lease`, which disrupts anyone who already pulled the old commit. Avoid amending pushed commits on shared branches.',
    related: ['commit', 'reset', 'rebase-interactive', 'push', 'reflog'],
    keywords: ['fix last commit', 'change commit message', 'forgot file', 'edit commit', 'typo', 'amend'],
  },
  {
    id: 'clean',
    command: 'git clean',
    category: 'undo',
    level: 2,
    summary: 'Delete untracked files from your working directory.',
    description:
      "`git clean` removes files that git isn't tracking: build output, temporary files, things you created and don't want anymore. Commands like `git restore` and `git reset --hard` only deal with tracked files; `clean` handles the untracked ones.\n\n" +
      'Because it deletes files that were never committed, git makes it hard to run by accident: it refuses to do anything unless you pass `-f` (force), `-n` (dry run) or `-i` (interactive).\n\n' +
      'Always do a dry run with `-n` first to see what would be deleted.',
    syntax: ['git clean -n', 'git clean -f', 'git clean -fd', 'git clean -fdx', 'git clean -i'],
    examples: [
      {
        code: 'git clean -n',
        explanation:
          'Dry run: lists the untracked files that would be deleted, without deleting anything.',
      },
      {
        code: 'git clean -nd',
        explanation: 'Dry run that also includes untracked folders.',
      },
      {
        code: 'git clean -fd',
        explanation: 'Deletes untracked files and folders.',
      },
      {
        code: 'git clean -fdx',
        explanation:
          'Also deletes files ignored by `.gitignore` (like `node_modules/`, `dist/` or `.env`): a full return to a pristine checkout.',
      },
      {
        code: 'git clean -i',
        explanation: 'Opens an interactive menu to choose what to delete.',
      },
    ],
    tips: [
      '`git reset --hard` followed by `git clean -fd` brings your folder back to exactly the last commit, tracked and untracked files included.',
      'Want to set untracked files aside instead of deleting them? Use `git stash -u`.',
    ],
    warning:
      "`git clean -f` permanently deletes files that git never saved: they don't go to the recycle bin and can't be recovered. With `-x` it also deletes ignored files, such as a `.env` with your secrets. Always run `git clean -n` first.",
    related: ['restore', 'reset', 'stash', 'status'],
    keywords: ['delete untracked', 'remove new files', 'clean up', 'junk files', 'pristine', 'ignored files'],
  },
  {
    id: 'reflog',
    command: 'git reflog',
    category: 'undo',
    level: 2,
    summary: 'A log of everywhere HEAD has been: your safety net for recovering lost work.',
    description:
      'Every time `HEAD` moves (commit, switch, reset, rebase, merge, amend...), git writes an entry in the **reflog**. `git reflog` shows that list, most recent first, with entries like `HEAD@{2}: reset: moving to HEAD~1`.\n\n' +
      'That makes it the tool for recovering "lost" commits. After a bad `reset --hard`, a botched rebase, an amend you regret or a deleted branch, the old commits still exist, and the reflog tells you their hashes. Find the right entry, then create a branch there or reset back to it.\n\n' +
      "The reflog is local (it isn't pushed or cloned) and its entries expire eventually (by default after 90 days, or 30 for commits no branch points to). Uncommitted changes never enter it, so it can't recover work you never committed.",
    syntax: [
      'git reflog',
      'git reflog show <branch>',
      'git reset --hard HEAD@{<n>}',
      'git branch <name> <hash>',
    ],
    examples: [
      {
        code: 'git reflog',
        explanation:
          'Lists the recent positions of HEAD, with their hashes and the action that caused each one.',
      },
      {
        code: 'git reflog show feature/login',
        explanation: 'The history of positions of a single branch.',
      },
      {
        code: 'git reset --hard HEAD@{1}',
        explanation:
          'Goes back to where HEAD was one move ago, for example to undo a reset or a rebase you just did.',
      },
      {
        code: 'git branch rescue a1b2c3d',
        explanation: 'Creates a branch on a lost commit you found in the reflog, so it\'s safe again.',
      },
      {
        code: 'git reflog --date=relative',
        explanation:
          'Shows when each move happened ("2 hours ago"), which helps you find "how things were before lunch".',
      },
    ],
    tips: [
      'Before trying to fix a disaster, stop and run `git reflog`: the old state is almost always there.',
      '`HEAD@{1}` is "where HEAD was before the last move". `ORIG_HEAD` is similar, but it\'s only set by operations like reset, merge and rebase.',
    ],
    related: ['reset', 'log', 'branch', 'rebase', 'commit-amend'],
    keywords: ['recover', 'lost commits', 'undo reset', 'restore deleted branch', 'rescue', 'head history', 'oops'],
  },

  // -------------------------------------------------------------- rewriting
  {
    id: 'rebase',
    command: 'git rebase',
    category: 'rewriting',
    level: 3,
    summary: 'Replay your commits on top of another branch to get a linear history.',
    description:
      "`git rebase <base>` takes the commits of your current branch that aren't in `<base>` and replays them, one by one, on top of the latest commit of `<base>`. The result looks as if you had started your work from the current `<base>`: a straight history with no merge commits.\n\n" +
      'Typical use: you\'re on `feature/login` and `main` has moved on. Instead of merging `main` into your branch, you run `git rebase main` and your commits end up neatly on top of the new `main`.\n\n' +
      'The replayed commits are **new** commits (new hashes), even if their content looks the same. That\'s why rebasing rewrites history.\n\n' +
      'If a commit conflicts, the rebase pauses on it:\n\n' +
      '- Fix the files, then `git add <file>`\n' +
      '- `git rebase --continue` moves on to the next commit\n' +
      '- `git rebase --skip` drops the current commit entirely\n' +
      '- `git rebase --abort` cancels everything and returns to how things were\n\n' +
      '**Careful with "ours" and "theirs":** during a rebase they are swapped compared to a merge. "Ours" (`HEAD`, the upper part of the conflict markers) is the branch you are rebasing **onto** (e.g. `main`), and "theirs" is **your** commit being replayed.\n\n' +
      '**Golden rule:** never rebase commits that other people already have (pushed to a shared branch). Rebase your local commits or your personal branch freely; for shared history, use merge.\n\n' +
      '`--onto` transplants commits to a different base: `git rebase --onto <new-base> <old-base> <branch>` takes the commits of `<branch>` that come after `<old-base>` and replays them on top of `<new-base>`.',
    syntax: [
      'git rebase <base>',
      'git rebase <base> <branch>',
      'git rebase --continue | --skip | --abort',
      'git rebase --onto <new-base> <old-base> [<branch>]',
      'git rebase -i <base>',
    ],
    examples: [
      {
        code: 'git rebase main',
        explanation: "Replays the current branch's commits on top of `main`.",
      },
      {
        code: 'git fetch && git rebase origin/main',
        explanation:
          'Updates your feature branch with the latest `main` from the server, without a merge commit.',
      },
      {
        code: 'git rebase --continue',
        explanation: 'After resolving a conflict and running `git add`, continues with the next commit.',
      },
      {
        code: 'git rebase --abort',
        explanation: 'Cancels the rebase and restores the branch to its original state.',
      },
      {
        code: 'git rebase --onto main feature/base feature/child',
        explanation:
          "Moves only `feature/child`'s own commits (those after `feature/base`) onto `main`, e.g. when the base branch was abandoned or squash-merged.",
      },
      {
        code: 'git pull --rebase',
        explanation:
          'Fetches and replays your local commits on top of the remote ones instead of merging.',
      },
      {
        code: 'git push --force-with-lease',
        explanation:
          'After rebasing a branch you had already pushed (only if it\'s yours!), updates the remote safely.',
      },
    ],
    tips: [
      'Rebase vs merge: rebase gives a clean, linear history but rewrites commits; merge keeps the real history and is always safe. Many teams rebase feature branches locally and then merge them into `main`.',
      '`git config --global rebase.autoStash true` stashes your uncommitted changes before a rebase and restores them afterwards.',
      'If a finished rebase went wrong, `git reset --hard ORIG_HEAD` (right away) or `git reflog` gets you back.',
      '`git config --global rerere.enabled true` makes git remember how you resolved a conflict and reapply it automatically next time.',
    ],
    warning:
      "Rebase rewrites history. Never rebase commits that are already on a shared branch (like `main`, or a branch a teammate works on): their copies won't match yours, and you'll need a force push that can wipe out their work. Rebasing your own unpublished commits is fine.",
    related: ['merge', 'rebase-interactive', 'cherry-pick', 'pull', 'push', 'reflog'],
    keywords: ['linear history', 'update branch', 'replay commits', 'move commits', 'rebase onto', 'conflicts', 'rewrite history'],
  },
  {
    id: 'rebase-interactive',
    command: 'git rebase -i',
    category: 'rewriting',
    level: 3,
    summary: 'Edit, reorder, squash or drop commits before sharing them.',
    description:
      '`git rebase -i <base>` opens a list (the "todo list") in your editor with every commit after `<base>`, oldest at the top. Each line starts with an action. By changing those words, reordering lines or deleting them, you rewrite the history exactly as you want; then you save and close the editor to apply it.\n\n' +
      'The actions:\n\n' +
      '- `pick`: keep the commit as it is\n' +
      '- `reword`: keep it, but edit its message\n' +
      '- `edit`: stop at this commit so you can change it (amend it, split it...), then `git rebase --continue`\n' +
      '- `squash`: merge it into the previous commit and combine both messages\n' +
      '- `fixup`: merge it into the previous commit and discard its message\n' +
      '- `drop`: remove the commit (deleting its line does the same)\n\n' +
      "It's the go-to tool for polishing a branch before opening a pull request: turning \"wip\", \"fix typo\" and \"oops\" commits into a few clean, meaningful ones.\n\n" +
      'Conflicts and recovery work exactly like in a normal rebase: `--continue`, `--skip` and `--abort`.',
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
        explanation: 'Opens the last 4 commits for editing.',
      },
      {
        code: 'git rebase -i main',
        explanation: "Lets you edit every commit of your branch that isn't on `main`.",
      },
      {
        code: 'git rebase -i --root',
        explanation: 'Includes every commit, all the way down to the very first one.',
      },
      {
        code: 'git commit --fixup a1b2c3d',
        explanation:
          'Creates a commit marked as a fix for `a1b2c3d` (its message starts with `fixup!`).',
      },
      {
        code: 'git rebase -i --autosquash main',
        explanation:
          'Automatically moves the `fixup!` commits right below their target and marks them as `fixup`; you just save and close.',
      },
      {
        code: 'git rebase --continue',
        explanation: 'Continues after stopping at an `edit` commit or after resolving a conflict.',
      },
    ],
    tips: [
      'To squash several commits into one, change `pick` to `squash` (or `s`) on every line except the first.',
      'Every action has a one-letter shortcut: `p`, `r`, `e`, `s`, `f`, `d`.',
      'Reordering lines reorders the commits, but commits that depend on each other may conflict when swapped.',
      'If you delete every line and save, the rebase is cancelled and nothing changes.',
    ],
    warning:
      "Interactive rebase rewrites every commit from the first one you change onwards. Only do it on commits you haven't pushed, or on your own branch (then push with `--force-with-lease`). Never on shared branches like `main`.",
    related: ['rebase', 'commit-amend', 'reset', 'cherry-pick', 'push'],
    keywords: ['squash commits', 'combine commits', 'edit commit', 'reorder commits', 'delete commit', 'clean history', 'reword', 'fixup'],
  },
  {
    id: 'cherry-pick',
    command: 'git cherry-pick',
    category: 'rewriting',
    level: 2,
    summary: 'Copy a specific commit from another branch onto the current one.',
    description:
      "`git cherry-pick <commit>` takes the changes introduced by one commit and applies them as a **new** commit on your current branch. It's like copy-pasting a commit: the original stays where it was, and you get a copy with a new hash.\n\n" +
      "Use it when you need one particular change and not the whole branch: bringing a bug fix from `main` into a release branch, rescuing a commit you made on the wrong branch, or grabbing a single useful commit from a teammate's branch.\n\n" +
      "If the change doesn't apply cleanly, git stops with a conflict. Resolve it, `git add` the files and run `git cherry-pick --continue`; or use `--skip` to leave that commit out, or `--abort` to cancel everything.\n\n" +
      "Don't use cherry-pick as your regular way of moving work between branches: duplicated commits can cause confusing conflicts later. If you need everything, merge or rebase.",
    syntax: [
      'git cherry-pick <commit>',
      'git cherry-pick <commit1> <commit2>',
      'git cherry-pick <first>^..<last>',
      'git cherry-pick -x <commit>',
      'git cherry-pick --continue | --skip | --abort',
    ],
    examples: [
      {
        code: 'git cherry-pick a1b2c3d',
        explanation: 'Applies commit `a1b2c3d` on top of the current branch.',
      },
      {
        code: 'git cherry-pick a1b2c3d e4f5a6b',
        explanation: 'Applies two commits, in that order.',
      },
      {
        code: 'git cherry-pick a1b2c3d^..e4f5a6b',
        explanation:
          'Applies a whole range, from `a1b2c3d` to `e4f5a6b` inclusive (without the `^` the first one would be left out).',
      },
      {
        code: 'git cherry-pick -x a1b2c3d',
        explanation:
          'Adds "(cherry picked from commit ...)" to the message, useful to keep track of where it came from.',
      },
      {
        code: 'git cherry-pick --no-commit a1b2c3d',
        explanation:
          'Applies the changes to your files and staging area without creating the commit, so you can adjust them first.',
      },
      {
        code: 'git cherry-pick --abort',
        explanation: 'Cancels a cherry-pick that stopped with conflicts.',
      },
    ],
    tips: [
      "Committed on the wrong branch? `git switch` to the right one, `git cherry-pick <hash>`, then go back and remove it from the wrong branch with `git reset` (if you haven't pushed it).",
      'Find the hash you need with `git log --oneline <other-branch>`.',
    ],
    related: ['rebase', 'merge', 'revert', 'log'],
    keywords: ['copy commit', 'apply commit', 'backport', 'move commit', 'pick commit', 'wrong branch'],
  },

  // ---------------------------------------------------------------- remotes
  {
    id: 'remote',
    command: 'git remote',
    category: 'remotes',
    level: 1,
    summary: 'Manage the connections to other repositories, like GitHub.',
    description:
      'A remote is a named link to another copy of the repository, usually on a server like GitHub. When you clone, git creates one called `origin` automatically. When you start with `git init`, there are none until you add one.\n\n' +
      '`git remote` lets you list, add, rename and remove these links, and change their URLs. The names are just shortcuts: `git push origin main` means "push to the URL saved as `origin`".\n\n' +
      'In fork-based workflows you usually have two: `origin` (your fork) and `upstream` (the original project).',
    syntax: [
      'git remote -v',
      'git remote add <name> <url>',
      'git remote set-url <name> <url>',
      'git remote rename <old> <new>',
      'git remote remove <name>',
      'git remote show <name>',
    ],
    examples: [
      {
        code: 'git remote -v',
        explanation: 'Lists your remotes with their URLs.',
      },
      {
        code: 'git remote add origin https://github.com/my-user/my-app.git',
        explanation:
          'Connects a local repository (created with `git init`) to an empty repository on GitHub.',
      },
      {
        code: 'git remote add upstream https://github.com/vitejs/vite.git',
        explanation: 'Adds the original project of a fork, so you can fetch its updates.',
      },
      {
        code: 'git remote set-url origin git@github.com:my-user/my-app.git',
        explanation:
          'Changes the URL, for example to switch from HTTPS to SSH or after renaming the repository.',
      },
      {
        code: 'git remote show origin',
        explanation: 'Detailed info: URLs, remote branches and which local branches track them.',
      },
      {
        code: 'git remote prune origin',
        explanation:
          'Removes your local references to branches that were already deleted on the server.',
      },
    ],
    tips: [
      '`origin` is just a convention; you can give remotes any name.',
      'After adding a remote to a new repository, the first push is usually `git push -u origin main`.',
    ],
    related: ['clone', 'fetch', 'push', 'pull'],
    keywords: ['github', 'server', 'origin', 'upstream', 'url', 'connect repository', 'fork'],
  },
  {
    id: 'fetch',
    command: 'git fetch',
    category: 'remotes',
    level: 2,
    summary: 'Download new commits from a remote without touching your work.',
    description:
      "`git fetch` contacts a remote and downloads any commits, branches and tags you don't have yet. It updates your **remote-tracking branches** (like `origin/main`), which are your local, read-only snapshot of what the server looked like the last time you fetched.\n\n" +
      "It never changes your own branches or your files, so it's always safe. After fetching, you decide what to do: look at what's new, then merge or rebase.\n\n" +
      'In fact, `git pull` is just `git fetch` followed by a merge (or a rebase). Fetching first gives you the chance to look before you integrate.',
    syntax: [
      'git fetch',
      'git fetch <remote>',
      'git fetch <remote> <branch>',
      'git fetch --all',
      'git fetch --prune',
    ],
    examples: [
      {
        code: 'git fetch',
        explanation: "Downloads updates from the current branch's remote (usually `origin`).",
      },
      {
        code: 'git fetch upstream',
        explanation:
          'Downloads updates from the remote called `upstream`, e.g. the original project of your fork.',
      },
      {
        code: 'git fetch --all --prune',
        explanation:
          'Updates from every remote and removes `origin/...` branches that no longer exist on the server.',
      },
      {
        code: 'git log --oneline HEAD..origin/main',
        explanation: "After fetching: the commits on the remote that you don't have yet.",
      },
      {
        code: 'git merge origin/main',
        explanation:
          'Integrates the fetched changes into your current branch (what `git pull` would have done).',
      },
    ],
    tips: [
      '`git config --global fetch.prune true` makes every fetch clean up branches deleted on the server.',
      '`git status` only knows you\'re "behind" after a fetch; it doesn\'t contact the server by itself.',
    ],
    related: ['pull', 'remote', 'merge', 'rebase', 'push'],
    keywords: ['download', 'update', 'sync', 'check remote', 'origin/main', 'get changes'],
  },
  {
    id: 'pull',
    command: 'git pull',
    category: 'remotes',
    level: 1,
    summary: 'Download changes from the remote and integrate them into your branch.',
    description:
      '`git pull` updates your current branch with the changes from its remote branch. It\'s two steps in one: `git fetch` (download) followed by integrating the downloaded commits, either by merge or by rebase.\n\n' +
      "If you have no local commits, the integration is a simple fast-forward and nothing can go wrong. The interesting case is when **both** sides have new commits: the branches have **diverged**. Modern git won't guess what you want there: if you haven't configured a preference, it stops with \"You have divergent branches and need to specify how to reconcile them\". Your options:\n\n" +
      '- `git pull --no-rebase` (merge): creates a merge commit joining both histories. This is what old versions of git did silently.\n' +
      '- `git pull --rebase`: replays your local commits on top of the remote ones. Linear history, no merge commit.\n' +
      "- `git pull --ff-only`: only updates if it's a fast-forward; otherwise it fails and lets you decide.\n\n" +
      'Set your preference once with `git config --global pull.rebase false` (merge) or `true` (rebase), or with `git config --global pull.ff only`.\n\n' +
      'If integrating causes conflicts, resolve them as you would in a merge or a rebase, depending on the mode.',
    syntax: [
      'git pull',
      'git pull <remote> <branch>',
      'git pull --rebase',
      'git pull --no-rebase',
      'git pull --ff-only',
    ],
    examples: [
      {
        code: 'git pull',
        explanation: 'Updates the current branch from its upstream (e.g. `origin/main`).',
      },
      {
        code: 'git pull --rebase',
        explanation:
          'Fetches and puts your local commits on top of the remote ones, with no merge commit.',
      },
      {
        code: 'git pull --no-rebase',
        explanation: 'Fetches and merges, creating a merge commit if the branches diverged.',
      },
      {
        code: 'git pull --ff-only',
        explanation:
          'Updates only if you have no local commits that would need merging. Safe for keeping `main` in sync.',
      },
      {
        code: 'git pull origin main',
        explanation:
          'Fetches `main` from `origin` and integrates it into your **current** branch, whichever it is.',
      },
      {
        code: 'git config --global pull.rebase true',
        explanation: 'Makes `git pull` always rebase from now on (use `false` to always merge).',
      },
    ],
    tips: [
      'Commit or stash your work before pulling; git refuses to pull if the incoming changes would overwrite uncommitted edits.',
      '"There is no tracking information for the current branch" means your branch has no upstream: use `git pull origin <branch>`, or link it with `git branch -u origin/<branch>`.',
      "Not sure what's coming? Run `git fetch` first and look with `git log HEAD..origin/main`, then merge or rebase.",
    ],
    related: ['fetch', 'merge', 'rebase', 'push', 'config'],
    keywords: ['update', 'download changes', 'sync', 'divergent branches', 'get latest', 'bring changes'],
  },
  {
    id: 'push',
    command: 'git push',
    category: 'remotes',
    level: 1,
    summary: 'Upload your local commits to a remote repository.',
    description:
      "`git push` sends the commits of your branch to the remote (usually GitHub), so others can see them and so they're backed up. Only commits travel; uncommitted changes stay on your machine.\n\n" +
      'The first time you push a new branch, use `-u` (`--set-upstream`): `git push -u origin feature/login`. It creates the branch on the remote and links your local branch to it, so from then on a plain `git push` or `git pull` knows where to go.\n\n' +
      '**Rejected pushes.** If the remote branch has commits you don\'t have, git rejects the push ("Updates were rejected because the remote contains work that you do not have locally", or "non-fast-forward"). That\'s git protecting someone else\'s work. The fix is to `git pull` (merge or rebase), resolve any conflicts and push again, not to force it.\n\n' +
      '**Force pushing.** After rewriting history you had already pushed (rebase, amend, reset), a normal push is rejected and you have to force it:\n\n' +
      '- `--force` overwrites the remote branch with yours, no questions asked, even if someone pushed new commits in the meantime (those commits get lost).\n' +
      "- `--force-with-lease` only overwrites if the remote branch is still where you last saw it; if someone pushed in the meantime, it refuses. Always prefer it.\n\n" +
      'To delete a branch on the remote: `git push origin --delete <branch>`.',
    syntax: [
      'git push',
      'git push -u <remote> <branch>',
      'git push <remote> <branch>',
      'git push --force-with-lease',
      'git push <remote> --delete <branch>',
      'git push <remote> <tag>',
    ],
    examples: [
      {
        code: 'git push -u origin feature/login',
        explanation:
          'First push of a new branch: creates it on `origin` and sets it as the upstream.',
      },
      {
        code: 'git push',
        explanation: 'Pushes the current branch to its upstream (once it has one).',
      },
      {
        code: 'git push -u origin main',
        explanation: 'The typical first push of a brand-new repository.',
      },
      {
        code: 'git push --force-with-lease',
        explanation:
          'Updates the remote after a rebase or amend, but only if nobody else pushed in the meantime.',
      },
      {
        code: 'git push origin --delete feature/login',
        explanation: 'Deletes the `feature/login` branch on the remote.',
      },
      {
        code: 'git push origin v1.0.0',
        explanation: "Pushes a tag (tags aren't pushed by default).",
      },
      {
        code: 'git push origin HEAD',
        explanation:
          'Pushes the current branch to a branch with the same name on `origin`, without typing its name.',
      },
    ],
    tips: [
      '`git config --global push.autoSetupRemote true` (git 2.37+) makes the first `git push` of a new branch set its upstream automatically, no `-u` needed.',
      "Check what you're about to push with `git log origin/main..HEAD`.",
      'On GitHub you can protect `main` so nobody can force-push to it.',
    ],
    warning:
      '`git push --force` replaces the remote branch with your version and can silently erase commits your teammates pushed. Use `--force-with-lease` instead, only on your own branches, and never on shared branches like `main` unless the whole team agrees.',
    related: ['pull', 'fetch', 'remote', 'branch', 'tag', 'rebase'],
    keywords: ['upload', 'send commits', 'publish', 'github', 'rejected', 'force push', 'delete remote branch', 'upstream'],
  },

  // ------------------------------------------------------------------ stash
  {
    id: 'stash',
    command: 'git stash',
    category: 'stash',
    level: 2,
    summary: 'Temporarily set aside uncommitted changes to get a clean working directory.',
    description:
      '`git stash` takes your uncommitted changes (staged and unstaged), saves them in a special stack and resets your files to the last commit. Your working directory becomes clean, so you can switch branches, pull, or fix something urgent; later you bring the changes back with `git stash pop`.\n\n' +
      'Classic scenario: you\'re halfway through a feature and need to fix a bug on `main` right now. `git stash`, `git switch main`, fix and commit, switch back to your branch, `git stash pop`.\n\n' +
      'By default, untracked (new) files are **not** stashed; add `-u` to include them. Each stash is saved as an entry (`stash@{0}` is the most recent) and you can keep several.\n\n' +
      'If applying a stash conflicts with your current files, git leaves conflict markers and, with `pop`, keeps the stash in the list so you don\'t lose it.',
    syntax: [
      'git stash',
      'git stash push -m "<message>"',
      'git stash list',
      'git stash pop [stash@{<n>}]',
      'git stash apply [stash@{<n>}]',
      'git stash drop [stash@{<n>}]',
    ],
    examples: [
      {
        code: 'git stash',
        explanation: 'Saves your uncommitted changes and cleans the working directory.',
      },
      {
        code: 'git stash -u',
        explanation: 'Also stashes untracked files.',
      },
      {
        code: 'git stash push -m "half-done navbar"',
        explanation: 'Saves with a description, so it\'s easier to recognize later.',
      },
      {
        code: 'git stash list',
        explanation: 'Shows all saved stashes: `stash@{0}`, `stash@{1}`...',
      },
      {
        code: 'git stash pop',
        explanation: 'Re-applies the most recent stash and removes it from the list.',
      },
      {
        code: 'git stash apply stash@{1}',
        explanation: 'Applies a specific stash but keeps it in the list.',
      },
      {
        code: 'git stash show -p stash@{0}',
        explanation: 'Shows the changes saved in a stash, as a diff.',
      },
    ],
    tips: [
      '`git stash branch <name>` creates a new branch from the commit where you stashed and applies the stash there: the cleanest way out when a stash conflicts.',
      '`git stash push -- <file>` stashes only that file.',
      '`git stash drop stash@{1}` deletes one stash; `git stash clear` deletes all of them (no undo).',
      'Stashes are easy to forget. For anything longer than a quick interruption, a temporary "WIP" commit on a branch is often better.',
    ],
    related: ['switch', 'pull', 'restore', 'clean'],
    keywords: ['save for later', 'set aside', 'temporary', 'shelve', 'wip', 'interruption', 'park changes'],
  },

  // ------------------------------------------------------------- inspection
  {
    id: 'blame',
    command: 'git blame',
    category: 'inspection',
    level: 2,
    summary: 'Show who last changed each line of a file, and in which commit.',
    description:
      "`git blame <file>` prints the file with the commit, author and date of the last change next to each line. Despite the name, it's not about blaming people: it's about finding context. Once you have the commit hash, `git show <hash>` tells you why the line was written that way.\n\n" +
      'Use it when you find code that looks strange and want to know its story before touching it.',
    syntax: [
      'git blame <file>',
      'git blame -L <start>,<end> <file>',
      'git blame <commit> -- <file>',
      'git blame -w -C <file>',
    ],
    examples: [
      {
        code: 'git blame src/cart.ts',
        explanation: 'Annotates every line of `src/cart.ts`.',
      },
      {
        code: 'git blame -L 40,60 src/cart.ts',
        explanation: 'Only lines 40 to 60.',
      },
      {
        code: 'git blame -w src/cart.ts',
        explanation:
          "Ignores whitespace-only changes, so a reformat doesn't hide the line's real author.",
      },
      {
        code: 'git blame -C src/cart.ts',
        explanation: 'Also detects lines that were moved or copied from other files.',
      },
      {
        code: 'git blame v1.0.0 -- src/cart.ts',
        explanation: 'Blame as the file was at the `v1.0.0` tag.',
      },
    ],
    tips: [
      'If a big formatting commit gets in the way, list its hash in a file such as `.git-blame-ignore-revs` and use `git blame --ignore-revs-file .git-blame-ignore-revs <file>` (GitHub reads that file too).',
      'Many editors (VS Code with GitLens, JetBrains IDEs) show blame inline, which is often more comfortable.',
      '`git log -L 40,60:src/cart.ts` shows the full evolution of those lines, not just the last change.',
    ],
    related: ['log', 'show', 'bisect', 'diff'],
    keywords: ['who changed', 'line author', 'line history', 'annotate', 'why is this code here'],
  },
  {
    id: 'bisect',
    command: 'git bisect',
    category: 'inspection',
    level: 3,
    summary: 'Find the commit that introduced a bug using a binary search.',
    description:
      'When something used to work and now doesn\'t, `git bisect` finds the exact commit that broke it. You tell git one commit where things are **bad** (usually the current one) and one where they were **good** (for example, an old tag). Git checks out a commit halfway between them; you test it and answer `good` or `bad`. Each answer cuts the remaining range in half, so even 1,000 commits take only about 10 steps.\n\n' +
      'When it finishes, git prints the first bad commit. Then run `git bisect reset` to go back to where you started.\n\n' +
      'If you have a script or test that detects the bug (exit code 0 = good, anything else = bad), `git bisect run` does the whole search for you.',
    syntax: [
      'git bisect start [<bad> <good>]',
      'git bisect bad [<commit>]',
      'git bisect good [<commit>]',
      'git bisect skip',
      'git bisect run <command>',
      'git bisect reset',
    ],
    examples: [
      {
        code: 'git bisect start',
        explanation: 'Starts a bisect session.',
      },
      {
        code: 'git bisect bad',
        explanation: 'Marks the current commit as broken.',
      },
      {
        code: 'git bisect good v1.4.0',
        explanation:
          'Marks the `v1.4.0` tag as a version that worked. Git now checks out a commit in the middle for you to test.',
      },
      {
        code: 'git bisect skip',
        explanation: "Skips a commit you can't test (for example, one that doesn't build).",
      },
      {
        code: 'git bisect run npm test',
        explanation:
          'Automates the search: git runs `npm test` at each step and marks the commit good or bad based on the result.',
      },
      {
        code: 'git bisect reset',
        explanation: 'Ends the session and returns to your original branch.',
      },
    ],
    tips: [
      'You can start in a single line: `git bisect start HEAD v1.4.0` (first the bad commit, then the good one).',
      "During a bisect you're in detached HEAD: don't commit there, just test and answer.",
      'Marked something wrong by mistake? `git bisect log` shows your answers; you can `git bisect reset` and start again.',
    ],
    related: ['log', 'blame', 'show'],
    keywords: ['find bug', 'regression', 'which commit broke', 'binary search', 'debug', 'when did it break'],
  },

  // ------------------------------------------------------------------- tags
  {
    id: 'tag',
    command: 'git tag',
    category: 'tags',
    level: 2,
    summary: 'Mark a specific commit with a name, typically a release version.',
    description:
      'A tag is a fixed name for a commit, like `v1.0.0`. Unlike a branch, it never moves: it always points to the same commit, which makes tags perfect for marking releases.\n\n' +
      'There are two kinds:\n\n' +
      '- **Annotated** (`-a`): a full object with its own message, author and date. Recommended for releases.\n' +
      '- **Lightweight**: just a name pointing to a commit, like a bookmark.\n\n' +
      'Tags are **not** sent with a normal `git push`: you have to push them explicitly.',
    syntax: [
      'git tag',
      'git tag -a <name> -m "<message>"',
      'git tag <name> [<commit>]',
      'git push <remote> <tag>',
      'git tag -d <name>',
    ],
    examples: [
      {
        code: 'git tag',
        explanation: 'Lists all tags.',
      },
      {
        code: 'git tag -l "v1.*"',
        explanation: 'Lists the tags matching a pattern.',
      },
      {
        code: 'git tag -a v1.0.0 -m "First stable release"',
        explanation: 'Creates an annotated tag on the current commit.',
      },
      {
        code: 'git tag v0.9.0 a1b2c3d',
        explanation: 'Creates a lightweight tag on an older commit.',
      },
      {
        code: 'git push origin v1.0.0',
        explanation: 'Publishes one tag on the remote.',
      },
      {
        code: 'git push origin --tags',
        explanation: 'Publishes all your local tags.',
      },
      {
        code: 'git tag -d v1.0.0 && git push origin --delete v1.0.0',
        explanation: 'Deletes a tag locally and on the remote.',
      },
    ],
    tips: [
      'Follow semantic versioning: `vMAJOR.MINOR.PATCH` (e.g. `v2.3.1`).',
      '`git switch --detach v1.0.0` lets you look at the code exactly as it was in that release.',
      "Don't move or recreate a tag others have already fetched; publish a new version instead.",
    ],
    related: ['show', 'push', 'log', 'switch'],
    keywords: ['release', 'version', 'mark commit', 'label', 'semver', 'milestone'],
  },
];
