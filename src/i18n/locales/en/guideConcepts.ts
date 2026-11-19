import type { GuideConcept } from '../../../content/types';

export const guideConcepts: GuideConcept[] = [
  {
    id: 'repository',
    title: "Repository",
    body:
      "A **repository** (or \"repo\") is a project folder whose history git keeps track of. It's your files plus a hidden `.git` folder where git stores every commit, every branch and the repository's configuration.\n\nThink of it as your project with a time machine attached: the folder shows the present, and `.git` holds all the past versions you saved.\n\n- `git init` turns the current folder into a new repository (it creates `.git`).\n- `git clone <url>` downloads an existing repository, including its whole history.\n- If you delete the `.git` folder, the project becomes a normal folder again, with no history. Don't do it by accident!\n\nGit is **distributed**: every clone is a complete repository with the full history. A server like GitHub just hosts one more copy, which everyone agrees to use for sharing work (a \"remote\").",
    related: ['init', 'clone', 'status', 'remote', 'config'],
    keywords: ['repository', 'repo', '.git folder', 'project', 'init', 'clone'],
  },
  {
    id: 'three-areas',
    title: "The three areas: working directory, staging area and repository",
    body:
      "Git juggles three versions of your files. Once you understand them, most commands make sense:\n\n- **Working directory** (or working tree): the actual files you see and edit in your folder.\n- **Staging area** (also called the **index**): a draft of your next commit. You decide what goes into it with `git add`.\n- **Repository**: the saved commits, inside `.git`. `git commit` takes what's in the staging area and stores it as a new commit.\n\nAnalogy: you're packing a box to ship. The working directory is your room with everything lying around, the staging area is the open box with the items you've picked, and committing is sealing the box and labeling it. Before sealing, you can put things in (`git add`) and take them out (`git restore --staged`) as often as you like.\n\nWhy the extra step? It lets you commit only part of your changes: if you fixed two unrelated things, you can commit each one separately with its own message.\n\nThe inspection commands follow the same areas: `git diff` compares working directory vs staging area, `git diff --staged` compares staging area vs last commit, and `git status` summarizes both.",
    related: ['add', 'commit', 'status', 'diff', 'restore', 'reset'],
    keywords: ['staging area', 'index', 'working directory', 'working tree', 'stage', 'three areas', 'git add'],
  },
  {
    id: 'commit',
    title: "Commit",
    body:
      "A **commit** is a snapshot of your whole project at a moment in time, saved in the repository. Think of it as a save point in a video game: you can always go back to it.\n\nEach commit stores:\n\n- the full state of the files (unchanged files are stored efficiently, so this isn't wasteful)\n- a message explaining the change\n- the author and the date\n- a link to its **parent**, the commit that came before it (a merge commit has two parents)\n\nEvery commit is identified by a **hash** such as `a1b2c3d4e5f6...`, usually shortened to its first 7 characters (`a1b2c3d`). The hash is calculated from the content, so if you change anything (even just the message with `--amend`) you get a **new** commit with a different hash. That's what \"rewriting history\" means.\n\nGood habits: small commits that do one thing, with messages that say what and why, written as an order (\"Fix login redirect after logout\").",
    related: ['commit', 'add', 'log', 'show', 'commit-amend'],
    keywords: ['commit', 'snapshot', 'hash', 'SHA', 'save point', 'parent', 'commit message'],
  },
  {
    id: 'branch',
    title: "Branch",
    body:
      "A **branch** is just a movable label that points to a commit. When you make a new commit, the label of the branch you're on automatically moves forward to it.\n\nSince a branch is only a pointer (a tiny file containing a hash), creating one is instant and free. That's why git workflows use lots of them: one per feature or fix (`feature/login`, `fix/header`), merged into `main` when ready.\n\nAnalogy: commits are stops along a road and a branch is a bookmark saying \"this line of work is here\". Two branches can point to the same commit; as each one gets new commits, their paths diverge.\n\n- `git branch` lists branches; `git branch feature/login` creates one.\n- `git switch feature/login` moves you to it (`git switch -c feature/login` creates it and switches in one step; the old way is `git checkout -b`).\n- Deleting a branch deletes the label, not the commits (for a while, `git reflog` can still find them).\n\n`main` (or `master` in older repositories) isn't special to git: it's just the usual name for the main line of work.",
    related: ['branch', 'switch', 'checkout', 'merge', 'log'],
    keywords: ['branch', 'pointer', 'feature branch', 'main', 'master', 'create branch'],
  },
  {
    id: 'head',
    title: "HEAD",
    body:
      "**HEAD** means \"where you are right now\". Normally it points to the current branch (e.g. `main`), and that branch points to a commit. When you commit, the branch moves forward and HEAD goes along with it.\n\nThink of HEAD as the \"You are here\" marker on a map. `git switch` moves the marker to another branch, and the files in your folder change to match.\n\nMany commands use HEAD as a starting point:\n\n- `HEAD~1` (or `HEAD~`) is the commit before HEAD; `HEAD~3` is three commits back.\n- `HEAD^2` is the second parent of a merge commit.\n- `git show HEAD` shows the latest commit.\n- `git reset --soft HEAD~1` moves the current branch one commit back.\n\nThe file `.git/HEAD` literally contains something like `ref: refs/heads/main`. Every time HEAD moves, git writes it down in the reflog (`git reflog`).",
    related: ['log', 'show', 'reset', 'switch', 'reflog'],
    keywords: ['HEAD', 'current branch', 'HEAD~1', 'you are here', 'pointer', 'tilde'],
  },
  {
    id: 'detached-head',
    title: "Detached HEAD",
    body:
      "Normally HEAD points to a branch. In **detached HEAD** state it points directly to a commit instead. You get there by checking out a specific commit, a tag or a remote-tracking branch (`git checkout a1b2c3d`, `git switch --detach v1.0`), and git also does it temporarily during `git bisect` or when a rebase stops.\n\nIt's not an error: it's perfect for looking at an old version, running it or trying something out. The catch: if you make commits there, no branch points to them. When you switch away they're left \"floating\", and once they fall out of the reflog git eventually deletes them.\n\nAnalogy: you've walked off the marked trails. You can explore freely, but if you build something out there and leave without putting up a sign (a branch), you won't easily find it again.\n\n- Just looking around? Go back with `git switch main` (or `git switch -` to return to the previous branch).\n- Made commits you want to keep? Create a branch right there: `git switch -c experiment`.\n- Already left without creating it? Find the commit in `git reflog` and run `git branch experiment <hash>`.\n\n`git switch` refuses to detach HEAD unless you add `--detach`, which makes it harder to end up there by accident; `git checkout` does it without asking.",
    related: ['checkout', 'switch', 'branch', 'reflog', 'bisect', 'tag'],
    keywords: ['detached HEAD', 'detached', 'checkout commit', 'HEAD detached at', 'no branch', 'lost commits'],
  },
  {
    id: 'merge-vs-rebase',
    title: "Merge vs rebase",
    body:
      "Both bring the changes of one branch into another. They differ in what the resulting history looks like.\n\n**Merge** (`git merge main` while on `feature/login`) joins the two histories. If both branches have new commits, git creates a **merge commit** with two parents. Nothing that already exists is changed, so it's always safe, but the history gets extra merge commits and looks like a braid.\n\n**Fast-forward:** if the branch you're merging into has no new commits of its own since the split, there's nothing to join, so git just moves its label forward to the other branch's tip. No merge commit is created. (`git merge --no-ff` forces a merge commit anyway; `git merge --ff-only` refuses anything that isn't a fast-forward.)\n\n**Rebase** (`git rebase main` while on `feature/login`) takes your commits and **replays** them one by one on top of `main`, as if you had started your work from the latest `main`. The result is a straight line, but your commits are recreated with new hashes: the history is rewritten.\n\n- Merge: real history, safe on shared branches, but noisier.\n- Rebase: clean linear history, ideal for updating your own branch before a PR, but it rewrites commits.\n\n**The golden rule of rebase:** never rebase commits that other people already have (for example, commits pushed to a shared branch like `main`). Their copies still have the old commits, and everyone ends up with duplicated, conflicting histories. Rebase only your local or personal branches.",
    related: ['merge', 'rebase', 'rebase-interactive', 'pull', 'push', 'log'],
    keywords: ['merge vs rebase', 'fast-forward', 'merge commit', 'linear history', 'golden rule', 'rewrite history', 'no-ff'],
  },
  {
    id: 'remote',
    title: "Remotes, origin and remote-tracking branches",
    body:
      "A **remote** is another copy of the repository you sync with, usually on a server like GitHub. When you clone, git automatically names the remote you cloned from **origin**. `git remote -v` lists your remotes and their URLs.\n\nYour repository keeps **remote-tracking branches** such as `origin/main`: read-only bookmarks that remember where the branches on the remote were **the last time you talked to it**. They don't update by themselves; only `git fetch` (or `git pull`, which fetches first) refreshes them.\n\nA local branch can have an **upstream**: the remote branch it's linked to (e.g. `main` tracks `origin/main`). That link lets you type just `git push` or `git pull`, and is what makes `git status` say \"Your branch is ahead of 'origin/main' by 2 commits\". You set it the first time you push a branch with `git push -u origin feature/login`.\n\n- `git fetch` downloads new commits and updates `origin/*`. Your branches and files are **not** touched, so it's always safe.\n- `git pull` is `fetch` + integrate (merge or rebase) into your current branch, so it does change your branch.\n- `git push` uploads your commits and moves the branch on the remote.\n\nAnalogy: `origin/main` is a photo of the remote taken the last time you looked. `fetch` takes a new photo; `pull` takes the photo and also updates your own copy to match it.",
    related: ['remote', 'fetch', 'pull', 'push', 'clone', 'branch'],
    keywords: ['remote', 'origin', 'upstream', 'origin/main', 'remote-tracking branch', 'fetch vs pull', 'ahead behind'],
  },
  {
    id: 'conflicts',
    title: "Conflicts",
    body:
      "A **conflict** happens when git has to combine two changes (in a merge, rebase, cherry-pick, revert or `git stash pop`) and both sides changed the **same lines** of a file, or one side edited a file that the other deleted. Git doesn't guess: it stops and asks you to decide.\n\nConflicts are normal, not a sign that you broke something. Git combines everything it can on its own and only marks the parts it couldn't. Inside the file you'll see:\n\n- `<<<<<<< HEAD`: start of the version from the current side\n- `=======`: separator between the two versions\n- `>>>>>>> feature/login`: end of the incoming version\n\nTo resolve it: edit the file into the version you want (one side, the other, or a combination), delete all the markers, run `git add` on the file to mark it as resolved, and continue the operation (`git merge --continue` or `git commit`, `git rebase --continue`, `git cherry-pick --continue`).\n\n- `git status` always tells you which files are still conflicted and which operation is in progress.\n- **ours** / **theirs**: in a merge, ours = your current branch and theirs = the one being merged in. During a rebase they're swapped (ours = the branch you're rebasing onto).\n- Lost? `git merge --abort` or `git rebase --abort` takes you back to before it started.\n\nTo get fewer conflicts: bring `main` into your branch often, keep branches short-lived, and avoid reformatting whole files that others are also editing.",
    related: ['merge', 'rebase', 'status', 'add', 'checkout', 'restore', 'diff'],
    keywords: ['conflict', 'merge conflict', 'conflict markers', 'resolve conflict', 'ours', 'theirs', 'both modified'],
  },
];
