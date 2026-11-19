import type { ExerciseText } from '../../../exercises/types';

// Texts for src/exercises/defs.ts. {placeholders} are the exercise variant params.
export const exercises: Record<string, ExerciseText> = {
  'first-commit': {
    title: 'Your first commit',
    summary: 'Turn a folder into a repository and save its first snapshot.',
    description:
      "You have a folder `{project}` with two files, but git doesn't know about it yet.\n\n" +
      'A **commit** is a snapshot of your files. Before committing you choose what goes in by putting files in the **staging area** with `git add`.\n\n' +
      '- `git init` creates the repository\n- `git status` tells you what git sees\n- `git add` prepares files and `git commit -m "..."` saves them',
    goals: {
      init: 'Initialize the repository',
      commit: 'Commit `README.md` and `{file}`',
      clean: 'Leave the working tree clean (nothing pending in `git status`)',
    },
    hints: [
      'Start with `git init`. Then run `git status` and read what it says about the files.',
      '`git add .` stages every file in the folder.',
      'Finish with `git commit -m "Initial commit"`.',
    ],
  },
  'stage-some': {
    title: 'Choose what to commit',
    summary: 'Stage only some changes and leave the rest out of the commit.',
    description:
      "You built the {feature} feature: a new file `src/{feature}.js` and a new section in `README.md`. While debugging you also added `console.log('DEBUG!!!')` to `src/core.js`, which must **not** be committed (but you want to keep it locally for now).\n\n" +
      'The staging area lets you build a commit piece by piece: only what you `git add` goes in.',
    goals: {
      committed: 'Commit `src/{feature}.js` and `README.md`',
      notDebug: 'The commit must not include the change in `src/core.js`',
      kept: 'Keep the debug line in your working copy of `src/core.js`',
      oneCommit: 'Use a single new commit',
    },
    hints: [
      'Look at `git status` and `git diff` to see each change.',
      '`git add` accepts several paths: `git add README.md src/{feature}.js`.',
      "Then `git commit -m \"Add {feature}\"`. `src/core.js` will still show as modified — that's expected.",
    ],
  },
  amend: {
    title: 'Fix the last commit',
    summary: 'Correct a typo in the message and add a forgotten file.',
    description:
      'Your last commit is called "Add {feature} featrue" (typo!) and you forgot to include `tests/{feature}.test.js`.\n\n' +
      "Since the commit hasn't been shared yet, you can **replace** it with `git commit --amend` instead of creating another commit.",
    goals: {
      message: 'The last commit message must be "Add {feature} feature"',
      included: 'The last commit must include `tests/{feature}.test.js`',
      replaced: 'Replace the commit instead of adding a new one',
    },
    hints: [
      'First stage the forgotten file with `git add`.',
      '`git commit --amend -m "new message"` rewrites the last commit with what is staged and the new message.',
      'Notice in the graph that the old commit becomes unreachable and a new one (different hash) takes its place.',
    ],
  },
  discard: {
    title: 'Discard and unstage',
    summary: 'Throw away a broken change and take a file out of the staging area.',
    description:
      'Two things went wrong:\n\n' +
      '- You broke `{broken}` and want it back exactly as in the last commit.\n' +
      '- You staged `config.json` by accident. You want to keep the change (port 3000) but **not** have it staged.\n\n' +
      '`git restore` handles both: by default it restores files in the working directory; with `--staged` it only unstages.',
    goals: {
      discarded: 'Restore `{broken}` to its last committed version',
      unstaged: 'Unstage `config.json` but keep the change in the file',
      noCommit: "Don't create commits",
    },
    hints: [
      '`git status` even tells you which commands to use.',
      '`git restore <file>` discards changes in the working directory (careful: they are lost).',
      '`git restore --staged <file>` takes it out of the staging area without touching its content.',
    ],
  },
  'find-commit': {
    title: 'Find the guilty commit',
    summary: 'Read the history to find which commit introduced a bug.',
    description:
      'Someone left a `{needle}` line in `src/core.js` and it reached production. Find the commit that introduced it and mark it with the tag `{tag}` so the team can review it.\n\n' +
      'Useful tools: `git log --oneline` (compact history), `git show <commit>` (what a commit changed) and `git log -S "text"` (commits that added or removed a text).',
    goals: {
      tagged: 'Create the tag `{tag}` on the commit that introduced `{needle}`',
    },
    hints: [
      'Inspect each commit with `git show <hash>` (click a commit in the graph to paste its hash).',
      '`git log -S "{needle}" --oneline` lists only the commits where that text appeared or disappeared.',
      'Then `git tag {tag} <hash>`.',
    ],
  },
  'create-branch': {
    title: 'Work on a branch',
    summary: 'Create a branch, switch to it and commit there.',
    description:
      'You are going to start the {feature} feature without touching `main`. A **branch** is just a movable pointer to a commit: when you commit on it, it moves forward and `main` stays where it was.\n\n' +
      'Watch the graph: the label with "HEAD →" marks the branch you are on.',
    goals: {
      exists: 'Create the branch `feature/{feature}`',
      onIt: 'Be on `feature/{feature}`',
      commit: 'Make at least one commit on that branch',
      mainSame: '`main` must not move',
    },
    hints: [
      '`git switch -c <name>` creates a branch and switches to it (the classic form is `git checkout -b <name>`).',
      'Create a file: `echo "export const {feature} = true;" > src/{feature}.js`, or use the "New file" button.',
      'Then `git add .` and `git commit -m "Start {feature}"`.',
    ],
  },
  'ff-merge': {
    title: 'Fast-forward merge',
    summary: 'Integrate a branch when main has not moved.',
    description:
      "The branch `feature/{feature}` has two finished commits, and `main` hasn't changed since the branch was created.\n\n" +
      "In that case `git merge` doesn't need to create anything: it just moves `main` forward to the same commit. That's a **fast-forward**. Afterwards the feature branch is no longer needed.",
    goals: {
      onMain: 'Be on `main`',
      merged: '`main` points to the last commit of the feature (fast-forward)',
      deleted: 'Delete the branch `feature/{feature}`',
    },
    hints: [
      'You merge INTO the branch you are on, so first `git switch main`.',
      '`git merge feature/{feature}` — watch the `main` label jump forward.',
      '`git branch -d <branch>` deletes a branch that is already merged.',
    ],
  },
  'merge-commit': {
    title: 'Merge with a merge commit',
    summary: 'Join two histories that have diverged.',
    description:
      "While you worked on `feature/{feature}`, someone fixed a typo directly on `main`. Now each branch has commits the other doesn't.\n\n" +
      'A fast-forward is no longer possible, so `git merge` creates a **merge commit** with two parents that joins both lines of history.',
    goals: {
      onMain: 'Be on `main`',
      mergeCommit: 'Create a merge commit on `main` that includes the feature',
      both: '`main` contains both the feature and the README fix',
    },
    hints: [
      'Switch to `main` first.',
      '`git merge feature/{feature}` — this time git creates a new commit.',
      'Look at `git log --oneline --graph` to see the two lines joining.',
    ],
  },
  'merge-conflict': {
    title: 'Your first conflict',
    summary: 'Both branches changed the same lines: resolve it by hand.',
    description:
      'On `main` someone added {a} to `TEAM.md`, and on `feature/team` someone added {b} in the same place. git cannot decide which line goes first, so the merge produces a **conflict**.\n\n' +
      'The file will contain markers:\n\n' +
      '- `<<<<<<< HEAD` starts your version (main)\n- `=======` separates both versions\n- `>>>>>>> feature/team` ends the other version\n\n' +
      'Edit the file keeping both names, delete the markers, mark it resolved with `git add` and finish with `git commit`.',
    goals: {
      merged: 'Merge `feature/team` into `main` (merge commit)',
      noMarkers: '`TEAM.md` has no conflict markers',
      both: 'The team includes {a} and {b}',
      finished: 'The merge is finished',
    },
    hints: [
      'Run `git merge feature/team` and read `git status`.',
      'Click `TEAM.md` in the Files panel (or run `nano TEAM.md`) and leave only the list: Ana, {a}, {b}.',
      '`git add TEAM.md` marks it resolved; `git commit` (without -m it uses the default merge message) finishes.',
    ],
  },
  'conflict-sides': {
    title: 'Choose a side per file',
    summary: 'Resolve conflicts with --ours and --theirs, without editing.',
    description:
      'Merging `redesign` into `main` conflicts in two files. You already know what you want:\n\n' +
      "- `config.json`: keep **main's** version (production port 80)\n- `styles.css`: keep the **redesign** version\n\n" +
      'When you want a whole file from one side, `git checkout --ours <file>` (your current branch) or `git checkout --theirs <file>` (the branch being merged) saves you from editing markers.',
    goals: {
      merged: 'Merge `redesign` into `main`',
      ours: "`config.json` keeps main's version",
      theirs: '`styles.css` takes the redesign version ({color})',
      finished: 'The merge is finished',
    },
    hints: [
      'Start with `git merge redesign`.',
      'During a merge, "ours" = the branch you are on (main) and "theirs" = the one being merged.',
      'After choosing: `git add config.json styles.css` and `git commit --no-edit`.',
    ],
  },
  'detached-rescue': {
    title: 'Rescue commits from a detached HEAD',
    summary: "Don't lose work you did without a branch.",
    description:
      'You checked out an old commit to try an idea and, without noticing, made two commits there. HEAD is **detached**: it points to a commit, not to a branch. If you switch to `main` now, nothing will point to those commits.\n\n' +
      'Save them in a branch called `{name}` and go back to `main`.',
    goals: {
      saved: 'Branch `{name}` points to the "Polish layout" commit',
      onMain: 'Go back to `main`',
    },
    hints: [
      '`git status` shows "HEAD detached at…".',
      'Creating a branch where you are saves the commits: `git switch -c {name}` (or `git branch {name}`).',
      'Then `git switch main`. If you switch first, git warns you about the commits left behind (and `git reflog` can still save you).',
    ],
  },
  'undo-commit': {
    title: 'Undo the last commit',
    summary: 'Go back one commit but keep the changes to keep working.',
    description:
      'You committed "WIP {feature} (broken)" too early. You want that commit out of the history, but its changes kept in your files so you can finish them.\n\n' +
      '`git reset` moves the branch backwards:\n\n' +
      '- `--soft`: changes stay staged\n- `--mixed` (default): changes stay in your files, unstaged\n- `--hard`: changes are discarded (dangerous)',
    goals: {
      moved: '`main` points to the previous commit',
      kept: 'The work from the undone commit is still in `src/{feature}.js`',
    },
    hints: [
      '`HEAD~1` means "the parent of HEAD".',
      '`git reset HEAD~1` (mixed) or `git reset --soft HEAD~1` both keep your changes.',
      'Avoid `--hard` here: it would delete the work.',
    ],
  },
  'revert-pushed': {
    title: 'Undo a commit that was already pushed',
    summary: 'Use revert to undo without rewriting shared history.',
    description:
      'The commit "Change price calculation" broke prices, and it is already on `origin` — your team may have it. Rewriting history (reset) would cause trouble for everyone.\n\n' +
      '`git revert <commit>` creates a **new** commit that does the opposite of the bad one. History stays intact and you can push normally.',
    goals: {
      undone: '`src/price.js` is back to the correct calculation (`n * 1.19`)',
      history: 'History is not rewritten (later commits are kept)',
      pushed: 'Push the fix to `origin`',
    },
    hints: [
      'Find the hash of the bad commit with `git log --oneline`.',
      '`git revert <hash> --no-edit` creates the inverse commit with an automatic message.',
      'Finish with `git push`.',
    ],
  },
  'reflog-reset': {
    title: 'Recover after a reset --hard',
    summary: 'Use the reflog to bring back "lost" commits.',
    description:
      'Oops: someone ran `git reset --hard HEAD~{n}` and the latest {feature} commits disappeared from `main`.\n\n' +
      'They are not deleted! git records every position HEAD has had in the **reflog**. Turn on "Show unreachable commits" in the graph to see them.',
    goals: {
      recovered: '`main` points again to the latest commit ("Add {feature} tests")',
      files: 'The test file is back in your working directory',
    },
    hints: [
      '`git reflog` lists where HEAD has been: `HEAD@{0}` is now, `HEAD@{1}` the previous position…',
      'Find the entry just before the reset.',
      '`git reset --hard HEAD@{1}` (or the hash) moves `main` back there.',
    ],
  },
  'recover-branch': {
    title: 'Recover a deleted branch',
    summary: 'Bring back a branch deleted with -D.',
    description:
      'You deleted `feature/{feature}` with `git branch -D`, but it had unmerged work ("Finish {feature}").\n\n' +
      'A branch is only a pointer: the commits still exist. Find the hash of its last commit in the reflog and create the branch on it again.',
    goals: {
      restored: '`feature/{feature}` exists again and points to "Finish {feature}"',
    },
    hints: [
      '`git reflog` also shows the commits you made while on that branch.',
      'Look for "commit: Finish {feature}" and copy its hash.',
      '`git branch feature/{feature} <hash>`.',
    ],
  },
  'cherry-pick-fix': {
    title: 'Bring just one commit',
    summary: 'Copy a specific fix from another branch with cherry-pick.',
    description:
      'On `develop` there is a typo fix ("Fix typo in header") mixed with experiments that are not ready. You need **only the fix** on `main`.\n\n' +
      '`git cherry-pick <commit>` copies the changes of that commit as a new commit on the current branch.',
    goals: {
      hasFix: '`main` has the fix (`Welcome`)',
      noExperiments: '`main` does not get the {feature} experiments',
      developSame: '`develop` stays as it is',
    },
    hints: [
      'See the commits of develop with `git log --oneline develop`.',
      'Make sure you are on `main`.',
      '`git cherry-pick <hash of the fix>`.',
    ],
  },
  'rebase-feature': {
    title: 'Update your branch with rebase',
    summary: 'Move your commits on top of the latest main for a linear history.',
    description:
      '`main` got two new commits after you created `feature/{feature}`. Instead of a merge commit you want your two commits to sit **on top** of the current `main`, as if you had started today.\n\n' +
      '`git rebase main` replays your commits one by one on top of `main`. They are **new** commits (new hashes) — turn on "Show unreachable commits" to see the originals.',
    goals: {
      onTop: 'The feature branch starts from the current `main`',
      linear: 'Its 2 commits are on top, without merge commits',
      mainSame: "`main` doesn't change",
    },
    hints: [
      'You must be on the branch you want to move (you already are).',
      '`git rebase main`.',
      'Compare `git log --oneline --graph --all` before and after.',
    ],
  },
  'rebase-conflict': {
    title: 'Conflict during a rebase',
    summary: 'Resolve a conflict while replaying commits, then continue.',
    description:
      '`feature/slow-network` raised `timeout` and `main` raised `retries`, on neighbouring lines of `src/config.js`. Rebasing will stop with a conflict.\n\n' +
      'The flow is: fix the file → `git add` → `git rebase --continue`. You can always escape with `git rebase --abort`.\n\n' +
      '**Watch out:** during a rebase "HEAD"/"ours" is `main` (the base) and "theirs" is your commit.',
    goals: {
      onTop: 'The branch sits on top of `main`',
      linear: 'It keeps a single commit, without merges',
      both: '`src/config.js` has `timeout: {timeout}` and `retries: {retries}`, without markers',
      finished: 'The rebase is finished and you are on the branch',
    },
    hints: [
      'Start with `git rebase main` and read the message.',
      'Edit `src/config.js`: keep both new values and remove the markers.',
      '`git add src/config.js` and then `git rebase --continue`.',
    ],
  },
  squash: {
    title: 'Squash your commits',
    summary: 'Turn several messy commits into one clean commit.',
    description:
      'Your branch has four commits ("WIP", "more work", "fix typo", "done!!"). Before opening a pull request you want a single commit called "Add {feature}".\n\n' +
      'Two classic ways:\n\n' +
      '- `git rebase -i main` and mark commits as `squash`/`fixup`\n- `git reset --soft main` (keeps all the changes staged) plus a new `git commit`',
    goals: {
      single: 'Exactly one commit on top of `main`',
      message: 'Its message is "Add {feature}"',
      content: 'The final content is the same as before',
      finished: 'No operation in progress',
    },
    hints: [
      'With reset: `git reset --soft main` leaves all the work staged.',
      'Then `git commit -m "Add {feature}"`.',
      'With rebase: `git rebase -i main`, keep the first one as reword and the rest as fixup.',
    ],
  },
  'rebase-interactive': {
    title: 'Clean up with interactive rebase',
    summary: 'Drop a commit and fix a message with rebase -i.',
    description:
      'Before sharing `feature/{feature}` you want to tidy it up:\n\n' +
      '- The commit "Add debug logs" must disappear.\n- The commit "Add {feature} veiw" has a typo: it should say "Add {feature} view".\n\n' +
      '`git rebase -i <base>` opens a todo list where each commit gets an action: `pick` (keep), `reword` (change message), `drop` (delete), `squash`/`fixup` (meld)…',
    goals: {
      dropped: '"Add debug logs" (and `debug.log`) is gone',
      reworded: 'The message now says "Add {feature} view"',
      count: '2 commits remain on top of `main`',
      finished: 'The rebase is finished and you are on the branch',
    },
    hints: [
      '`git rebase -i main` (or `HEAD~3`).',
      'In the window: choose "drop" for the debug commit and "reword" for the last one.',
      'When you continue, write the new message "Add {feature} view".',
    ],
  },
  'move-commits': {
    title: 'Committed on main by mistake',
    summary: 'Move unpushed commits to a new branch and clean up main.',
    description:
      'You made two commits for the {feature} form directly on `main`, but they belong on `feature/{feature}`. Nothing has been pushed (`origin/main` is still at the first commit).\n\n' +
      'Trick: a new branch created here "saves" the commits; then you move `main` back to `origin/main`.',
    goals: {
      branch: '`feature/{feature}` contains both commits',
      mainBack: '`main` is back at `origin/main`',
      onFeature: 'You end up on `feature/{feature}` with a clean working tree',
    },
    hints: [
      '`git branch feature/{feature}` creates the branch here without switching.',
      '`git reset --hard origin/main` moves `main` back (the commits are safe in the new branch).',
      'Finally `git switch feature/{feature}`.',
    ],
  },
  'first-push': {
    title: 'Publish a new branch',
    summary: 'Push a branch for the first time and set its upstream.',
    description:
      'Your branch `feature/{feature}` only exists on your computer. To share it, push it to the remote `origin`.\n\n' +
      "The first time, git doesn't know where to send it. `-u` (`--set-upstream`) links your branch to `origin/feature/{feature}` so afterwards a plain `git push` / `git pull` is enough.",
    goals: {
      pushed: '`origin` has `feature/{feature}` with your commits',
      upstream: 'The branch tracks `origin/feature/{feature}`',
    },
    hints: [
      'Try `git push` first and read the error: it tells you the command.',
      '`git push -u origin feature/{feature}`.',
      'The remote graph shows the new branch on origin.',
    ],
  },
  'pull-rebase': {
    title: 'Push rejected',
    summary: "Integrate a teammate's work before pushing.",
    description:
      "You made a commit on `main`, but {mate} already pushed \"Add CI pipeline\" to `origin/main`. If you try to push, git **rejects** it: the remote has work you don't have.\n\n" +
      'The usual fix: download it and put your commits on top with `git pull --rebase`, then `git push`. (A plain `git pull` will ask you to choose between merge and rebase.)',
    goals: {
      integrated: "You have {mate}'s commit (`.github/ci.yml`)",
      linear: 'History stays linear (no merge commit)',
      pushed: '`origin/main` has your commit',
    },
    hints: [
      'Try `git push` and read why it fails.',
      '`git pull --rebase` fetches and replays your commit on top.',
      'Then `git push`.',
    ],
  },
  'stash-hotfix': {
    title: 'Urgent fix with stash',
    summary: 'Save unfinished work, fix something on main and come back.',
    description:
      'You are halfway through `src/{feature}.js` (uncommitted) when someone reports a typo in production: `src/header.html` says "Welcom".\n\n' +
      '`git stash` saves your unfinished changes and cleans the working tree so you can switch branches. Later `git stash pop` brings them back.',
    goals: {
      fixed: 'There is a new commit on `main` that fixes it to "Welcome"',
      back: 'You are back on `feature/{feature}`',
      wip: 'Your unfinished work in `src/{feature}.js` is back',
      stashEmpty: 'The stash is empty',
    },
    hints: [
      '`git stash`, then `git switch main`.',
      'Fix the file (`echo "<h1>Welcome</h1>" > src/header.html`) and `git commit -am "Fix welcome typo"`.',
      '`git switch feature/{feature}` and `git stash pop`.',
    ],
  },
  'tag-release': {
    title: 'Tag a release',
    summary: 'Create an annotated tag on a past commit and publish it.',
    description:
      'Version {version} was the commit "Release {version}", but nobody tagged it. Tags mark important points in history, like releases.\n\n' +
      '- Lightweight tag: `git tag name`\n- Annotated tag (with message and author, recommended for releases): `git tag -a name -m "message"`\n\n' +
      'Tags are not sent by a plain `git push`: you have to push them explicitly.',
    goals: {
      tag: 'Annotated tag `v{version}` on the "Release {version}" commit',
      pushed: 'The tag exists on `origin`',
    },
    hints: [
      'Find the commit with `git log --oneline`.',
      '`git tag -a v{version} <hash> -m "Version {version}"`.',
      '`git push origin v{version}` (or `git push --tags`).',
    ],
  },
  'sync-before-pr': {
    title: 'Sync your branch before the PR',
    summary: 'Rebase onto the latest origin/main and push safely.',
    description:
      'Your branch `feature/{feature}` is already on `origin`, but {mate} merged two commits into `origin/main` in the meantime. Before opening the pull request you want your branch on top of the latest `main`.\n\n' +
      '- `git fetch` downloads the news (it only updates `origin/main`).\n' +
      '- `git rebase origin/main` moves your commits on top.\n' +
      '- The rebase rewrote commits you had already pushed, so a normal push is rejected: use `git push --force-with-lease`, which only overwrites if nobody else pushed to your branch.',
    goals: {
      based: 'Your branch starts from the latest `origin/main`',
      linear: 'Your 2 commits are on top, without merges',
      pushed: '`origin/feature/{feature}` is updated',
    },
    hints: [
      "`git fetch` first — your repository doesn't know the new commits yet.",
      '`git rebase origin/main`.',
      '`git push --force-with-lease`.',
    ],
  },
};
