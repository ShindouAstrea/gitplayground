import type { GuideRecipe } from '../../../content/types';

export const guideRecipes: GuideRecipe[] = [
  {
    id: 'undo-last-commit-keep-changes',
    title: "Undo the last commit but keep my changes",
    problem:
      "You just made a commit and realized it was too early: it's missing something, includes the wrong files, or should be split in two. You want to take the commit back without losing any of the work in it.",
    category: 'undo',
    level: 1,
    steps: [
      {
        text: "Look at the latest commits so you know exactly what you're about to undo.",
        code: 'git log --oneline -3',
      },
      {
        text: "Move the branch back one commit with `--soft`. The commit disappears from the history, but its changes stay in the staging area, ready to be committed again.",
        code: 'git reset --soft HEAD~1',
      },
      {
        text: "Check the result: the files from the undone commit now show up under \"Changes to be committed\".",
        code: 'git status',
      },
      {
        text: "Fix whatever you needed (edit files, `git add` more, or `git restore --staged` what doesn't belong) and commit again.",
        code: 'git commit -m "Add login form validation"',
      },
    ],
    notes: [
      "`HEAD~1` means \"the commit before HEAD\". `HEAD~3` would undo the last three commits in one go.",
      "`git reset HEAD~1` (same as `--mixed`, the default) also keeps your changes, but unstages them: they stay in the working directory as regular modifications.",
      "`git reset --hard HEAD~1` **throws the changes away**. Only use it if you really want to lose that work (even then, `git reflog` can usually bring the commit back).",
      "If you already pushed the commit, don't reset: other people may have it. Use `git revert` instead (see \"Undo a commit I already pushed\").",
      "If you only want to fix the message or add a forgotten file, `git commit --amend` is simpler.",
    ],
    related: ['reset', 'commit-amend', 'reflog', 'revert', 'log', 'status'],
    keywords: ['undo commit', 'uncommit', 'reset soft', 'last commit', 'take back commit', 'HEAD~1'],
  },
  {
    id: 'change-last-commit-message',
    title: "Change the message of my last commit",
    problem:
      "You made a typo in the last commit message, or it doesn't describe the change well, and you haven't pushed it yet.",
    category: 'rewriting',
    level: 1,
    steps: [
      {
        text: "Make sure nothing is staged that you don't want in that commit: `--amend` also includes whatever is currently in the staging area.",
        code: 'git status',
      },
      {
        text: "Rewrite the message. `--amend` replaces the last commit with a new one that has the same changes and the new message.",
        code: 'git commit --amend -m "Fix login redirect after logout"',
      },
      {
        text: "Check the result.",
        code: 'git log --oneline -3',
      },
    ],
    notes: [
      "Without `-m`, `git commit --amend` opens your editor with the old message so you can edit it.",
      "Amending creates a new commit with a different hash. If you had already pushed, you'd need `git push --force-with-lease`, and that's only okay on a branch nobody else uses.",
      "To change the message of an older commit, run `git rebase -i HEAD~3` (adjust the number) and change `pick` to `reword` on that commit's line.",
    ],
    related: ['commit-amend', 'commit', 'rebase-interactive', 'push', 'log'],
    keywords: ['commit message', 'typo', 'reword', 'amend', 'edit message', 'rename commit'],
  },
  {
    id: 'add-file-to-last-commit',
    title: "Add a forgotten file to my last commit",
    problem:
      "You committed and then noticed you forgot a file (or a small fix). You'd rather have it inside that same commit than make a new \"oops\" commit.",
    category: 'rewriting',
    level: 1,
    steps: [
      {
        text: "Stage the forgotten file (or the extra fix).",
        code: 'git add src/app.js',
      },
      {
        text: "Amend the last commit. `--no-edit` keeps the existing message.",
        code: 'git commit --amend --no-edit',
      },
      {
        text: "Verify that the commit now includes the file.",
        code: 'git show --stat HEAD',
      },
    ],
    notes: [
      "Same rule as always with `--amend`: only amend commits you haven't pushed, or that live on a branch only you use (then push with `git push --force-with-lease`).",
      "Included a new file by mistake? `git rm --cached <file>` followed by `git commit --amend --no-edit` takes it out of the commit and keeps it on your disk.",
      "Leave out `--no-edit` if you also want to change the message at the same time.",
    ],
    related: ['commit-amend', 'add', 'show', 'rm', 'push'],
    keywords: ['forgot file', 'amend', 'add to commit', 'missing file', 'fix last commit', 'no-edit'],
  },
  {
    id: 'discard-local-changes',
    title: "Throw away my local changes",
    problem:
      "You edited some files and want them back exactly as they were in the last commit, either for a single file or for the whole project.",
    category: 'undo',
    level: 1,
    steps: [
      {
        text: "See what has changed before you throw anything away.",
        code: 'git status',
      },
      {
        text: "Discard the unstaged changes in one file. It goes back to the version in the staging area (which is the last commit, if you didn't stage anything).",
        code: 'git restore src/app.js',
      },
      {
        text: "If the file was also staged, restore both the staging area and the working directory from the last commit.",
        code: 'git restore --staged --worktree src/app.js',
      },
      {
        text: "To discard every change (staged or not) in all tracked files, run it on `.` from the project root.",
        code: 'git restore --staged --worktree .',
      },
      {
        text: "Untracked files (new files git has never seen) are not touched by `restore`. First preview what would be deleted…",
        code: 'git clean -n',
      },
      {
        text: "…and then delete them for real. `-d` also removes untracked folders.",
        code: 'git clean -fd',
      },
    ],
    notes: [
      "**This can't be undone.** Discarded changes were never committed, so not even `git reflog` can recover them. If in doubt, use `git stash` instead: it saves the changes so you can bring them back later.",
      "Older equivalents you'll see in tutorials: `git checkout -- src/app.js` for one file, and `git reset --hard` to reset all tracked files (staged and unstaged) to the last commit.",
      "`git clean -fdx` also deletes ignored files (like `node_modules` or build output). Use with care.",
    ],
    related: ['restore', 'clean', 'stash', 'status', 'checkout', 'reset'],
    keywords: ['discard changes', 'undo edits', 'reset file', 'throw away changes', 'untracked files', 'clean working directory'],
  },
  {
    id: 'unstage-file',
    title: "Unstage a file (undo git add)",
    problem:
      "You ran `git add` on a file you don't want in the next commit. You want to take it out of the staging area without losing your edits.",
    category: 'undo',
    level: 1,
    steps: [
      {
        text: "Check what is staged (\"Changes to be committed\").",
        code: 'git status',
      },
      {
        text: "Remove the file from the staging area. Your edits stay in the working directory, untouched.",
        code: 'git restore --staged src/app.js',
      },
      {
        text: "Or unstage everything at once.",
        code: 'git restore --staged .',
      },
      {
        text: "Confirm: the file now appears under \"Changes not staged for commit\" (or under \"Untracked files\" if it's new).",
        code: 'git status',
      },
    ],
    notes: [
      "Older equivalent: `git reset HEAD src/app.js` (or just `git reset` to unstage everything). You'll find it in many older answers online.",
      "`git rm --cached <file>` is different: it stages the file's **removal** from the repository (git stops tracking it) while keeping it on disk. Use it for files that should have been in `.gitignore`.",
      "In a brand-new repository with no commits yet, `git restore --staged` fails because there is no HEAD; use `git rm --cached <file>` instead.",
    ],
    related: ['restore', 'reset', 'add', 'status', 'rm'],
    keywords: ['unstage', 'undo add', 'remove from staging', 'staging area', 'index', 'git add mistake'],
  },
  {
    id: 'resolve-merge-conflict',
    title: "Resolve a merge conflict",
    problem:
      "You ran `git merge` and git stopped with \"CONFLICT (content): Merge conflict in src/app.js\". Both branches changed the same lines, so git needs you to decide what the final version should be.",
    category: 'branching',
    level: 2,
    steps: [
      {
        text: "This is the merge that stopped: you're on `main`, merging `feature/login` into it.",
        code: 'git merge feature/login',
      },
      {
        text: "List the conflicted files: they appear under \"Unmerged paths\" marked as \"both modified\".",
        code: 'git status',
      },
      {
        text: "Open each conflicted file in your editor and look for the conflict markers. For example, `src/app.js` might contain these lines:\n\n- `<<<<<<< HEAD`\n- `const timeout = 30;`\n- `=======`\n- `const timeout = 60;`\n- `>>>>>>> feature/login`\n\nBetween `<<<<<<<` and `=======` is the version of your current branch (HEAD, here `main`). Between `=======` and `>>>>>>>` is the version from the branch you are merging in (`feature/login`).",
      },
      {
        text: "Edit the file into its final form: keep one side, the other, or a mix of both, and **delete the three marker lines**. In the example, if 60 is right, only `const timeout = 60;` remains.",
      },
      {
        text: "Mark the file as resolved by staging it. Repeat the edit + `git add` for every conflicted file.",
        code: 'git add src/app.js',
      },
      {
        text: "When `git status` shows no more unmerged paths, finish the merge. Git creates the merge commit with a pre-filled message (save and close the editor).",
        code: 'git merge --continue',
      },
    ],
    notes: [
      "`git commit` works too for finishing the merge; `git merge --continue` just checks that a merge is in progress first.",
      "Want one whole side of a file without editing it by hand? `git checkout --ours src/app.js` keeps your current branch's version and `git checkout --theirs src/app.js` keeps the incoming branch's version. Then `git add` it. Modern equivalent: `git restore --ours` / `git restore --theirs`.",
      "In a merge, **ours** = the branch you are on (HEAD) and **theirs** = the branch you named in `git merge`. During a rebase it's the other way around (see \"Resolve a conflict during a rebase\").",
      "Before staging, `git diff --check` warns you about leftover conflict markers you forgot to delete.",
      "Editors like VS Code show buttons (Accept Current / Accept Incoming / Accept Both) above the markers. They only edit the text for you: you still need `git add` and to finish the merge.",
      "Want to also see the original common version? `git config --global merge.conflictStyle zdiff3` adds a `|||||||` section with the base version between the two sides.",
      "Got lost? `git merge --abort` puts everything back the way it was before the merge.",
    ],
    related: ['merge', 'status', 'add', 'diff', 'commit', 'checkout', 'restore'],
    keywords: ['merge conflict', 'conflict markers', 'resolve conflict', 'both modified', 'unmerged paths', 'ours theirs', 'CONFLICT'],
  },
  {
    id: 'resolve-rebase-conflict',
    title: "Resolve a conflict during a rebase",
    problem:
      "You're rebasing `feature/login` onto `main` and git stopped with \"CONFLICT\" and \"Could not apply a1b2c3d... Add login form\". A rebase replays your commits one at a time, so it can stop on each commit that clashes.",
    category: 'rewriting',
    level: 2,
    steps: [
      {
        text: "This is the rebase that stopped: you're on `feature/login`, replaying its commits on top of `main`.",
        code: 'git rebase main',
      },
      {
        text: "See where you are: `git status` says which commit is being applied and which files are conflicted.",
        code: 'git status',
      },
      {
        text: "Open the conflicted file. **Careful: the sides are swapped compared to a merge.** During a rebase, HEAD is the new base being built (`main` plus your commits already replayed), not your branch. In `src/app.js` you might see:\n\n- `<<<<<<< HEAD`\n- `const timeout = 60;` (what is already on `main`)\n- `=======`\n- `const timeout = 30;` (from your commit being replayed)\n- `>>>>>>> a1b2c3d (Add login form)`",
      },
      {
        text: "Edit the file into its final version, delete all the marker lines, and stage it to mark it as resolved.",
        code: 'git add src/app.js',
      },
      {
        text: "Continue the rebase. Git applies the remaining commits and may stop again on another conflict: repeat the previous steps each time.",
        code: 'git rebase --continue',
      },
      {
        text: "When it finishes, check the history: your commits now sit on top of `main`.",
        code: 'git log --oneline --graph -5',
      },
    ],
    notes: [
      "**ours/theirs are swapped in a rebase:** `git checkout --ours src/app.js` takes the version from the branch you're rebasing onto (`main`), and `git checkout --theirs src/app.js` takes **your** commit's version. It feels backwards because a rebase starts from `main` and replays your commits onto it.",
      "You don't need `git commit` here: `git add` + `git rebase --continue` creates the commit for you. It may open your editor to adjust the message; save and close it to keep going.",
      "If after resolving the commit ends up empty (e.g. you kept `main`'s version entirely), git tells you so; run `git rebase --skip` to drop that commit.",
      "`git rebase --abort` returns your branch to exactly how it was before the rebase started.",
      "If the branch was already pushed, you'll need `git push --force-with-lease` after the rebase.",
      "Resolving the same conflicts over and over? `git config --global rerere.enabled true` makes git remember your resolutions and reuse them.",
    ],
    related: ['rebase', 'status', 'add', 'checkout', 'log', 'push', 'rebase-interactive'],
    keywords: ['rebase conflict', 'continue rebase', 'could not apply', 'ours theirs swapped', 'rebase --continue', 'rebase --skip'],
  },
  {
    id: 'abort-merge-or-rebase',
    title: "Cancel a merge or rebase that went wrong",
    problem:
      "You're in the middle of a merge, rebase or cherry-pick full of conflicts and you just want to get out and go back to how things were before you started.",
    category: 'undo',
    level: 1,
    steps: [
      {
        text: "Find out what's in progress. `git status` says \"You have unmerged paths\" (merge), \"You are currently rebasing\" (rebase) or \"You are currently cherry-picking\" (cherry-pick).",
        code: 'git status',
      },
      {
        text: "Cancel a merge: the branch and the files go back to their state before `git merge`.",
        code: 'git merge --abort',
      },
      {
        text: "Cancel a rebase: the branch goes back to where it was before `git rebase`, as if nothing had happened.",
        code: 'git rebase --abort',
      },
      {
        text: "Cancel a cherry-pick the same way.",
        code: 'git cherry-pick --abort',
      },
    ],
    notes: [
      "Only run the command that matches what's in progress; the others just print an error such as \"There is no merge to abort\".",
      "`--abort` discards the conflict resolutions you made so far in that operation. Uncommitted changes you had **before** starting a merge may not be restored perfectly, which is why it's best to commit or stash before merging.",
      "Merge already finished (the merge commit exists)? `--abort` no longer applies. If it's not pushed, `git reset --hard ORIG_HEAD` undoes it; if it is pushed, use `git revert -m 1 <merge-hash>`.",
      "Rebase already finished and you regret it? `git reset --hard ORIG_HEAD` right afterwards, or find the old position in `git reflog` and `git reset --hard <hash>`.",
    ],
    related: ['merge', 'rebase', 'cherry-pick', 'status', 'reset', 'reflog', 'revert'],
    keywords: ['abort merge', 'cancel rebase', 'undo merge', 'get out', 'merge --abort', 'rebase --abort', 'panic'],
  },
  {
    id: 'update-branch-with-main',
    title: "Update my branch with the latest changes from main",
    problem:
      "You're working on `feature/login` and `main` has moved forward (teammates merged their work). You want those new commits in your branch. There are two ways to do it: rebase (option A) or merge (option B).",
    category: 'branching',
    level: 2,
    steps: [
      {
        text: "Get the latest commits from the remote. This updates `origin/main` without touching your files or branches.",
        code: 'git fetch origin',
      },
      {
        text: "Go to your feature branch, with a clean working directory (commit or stash anything pending first).",
        code: 'git switch feature/login',
      },
      {
        text: "**Option A, rebase:** replay your commits on top of the latest `main`. The history stays a straight line, as if you had started your branch today.",
        code: 'git rebase origin/main',
      },
      {
        text: "Option A, continued: if you had already pushed `feature/login`, the rebase rewrote its commits, so update the remote with a safe force push.",
        code: 'git push --force-with-lease',
      },
      {
        text: "**Option B, merge:** bring `main` into your branch with a merge commit. Nothing is rewritten.",
        code: 'git merge origin/main',
      },
      {
        text: "Option B, continued: push as usual, no force needed.",
        code: 'git push',
      },
    ],
    notes: [
      "**Choose rebase** when the branch is only yours (nobody else commits to it): you get a clean, linear history and a PR that's easier to review. It's the usual choice before opening a PR.",
      "**Choose merge** when other people share the branch, or you don't want to rewrite commits that are already pushed: it's always safe, at the cost of extra \"Merge remote-tracking branch 'origin/main'\" commits.",
      "Either way, conflicts can happen. Resolve them as described in \"Resolve a conflict during a rebase\" or \"Resolve a merge conflict\".",
      "Why `origin/main` and not `main`? Your local `main` is only as fresh as the last time you pulled it, while `git fetch` just updated `origin/main`. You don't even need to switch to `main`.",
      "The longer route also works: `git switch main`, `git pull`, `git switch feature/login`, then `git rebase main` (or `git merge main`).",
      "Shortcut: `git pull --rebase origin main` does the fetch and the rebase in one command.",
    ],
    related: ['fetch', 'rebase', 'merge', 'pull', 'push', 'switch'],
    keywords: ['update branch', 'sync with main', 'rebase onto main', 'merge main into branch', 'behind main', 'outdated branch'],
  },
  {
    id: 'squash-commits',
    title: "Squash several commits into one",
    problem:
      "Your branch `feature/login` has a messy series of commits (\"wip\", \"fix typo\", \"fix again\") and you want to combine them into one clean commit before sharing it.",
    category: 'rewriting',
    level: 3,
    steps: [
      {
        text: "Look at the latest commits and count how many belong together. In this example, the last 3.",
        code: 'git log --oneline -5',
      },
      {
        text: "Start an interactive rebase over those 3 commits.",
        code: 'git rebase -i HEAD~3',
      },
      {
        text: "Your editor opens with one line per commit, **oldest first**. Leave `pick` on the first line and change `pick` to `squash` (or just `s`) on the others:\n\n- `pick a1b2c3d Add login form`\n- `squash d4e5f6a wip`\n- `squash 789abcd fix typo`\n\nSave and close the editor.",
      },
      {
        text: "Git opens the editor again with all the messages combined. Write the final message (e.g. `Add login form`), save and close.",
      },
      {
        text: "Check the result: one commit instead of three.",
        code: 'git log --oneline -3',
      },
      {
        text: "If the branch was already pushed, overwrite it safely.",
        code: 'git push --force-with-lease',
      },
    ],
    notes: [
      "Use `fixup` (or `f`) instead of `squash` to fold a commit into the previous one and **discard its message** without asking.",
      "Alternative without the editor: `git reset --soft HEAD~3` followed by `git commit -m \"Add login form\"` turns the last 3 commits into one.",
      "Tip for next time: commit fixes with `git commit --fixup a1b2c3d`, and later `git rebase -i --autosquash main` lines up the squashes for you.",
      "Squash **before** sharing. Rewriting commits that others already pulled forces them to repair their copies.",
      "GitHub and similar platforms also offer \"Squash and merge\" for pull requests, which squashes the whole branch into a single commit on `main`.",
      "Stuck in Vim? Press `i` to edit, `Esc` when done, then type `:wq` and Enter to save and quit. You can switch to another editor, e.g. `git config --global core.editor \"code --wait\"`.",
      "If something goes wrong mid-rebase, `git rebase --abort` takes you back to where you started.",
    ],
    related: ['rebase-interactive', 'reset', 'commit', 'log', 'push', 'commit-amend'],
    keywords: ['squash', 'combine commits', 'join commits', 'clean history', 'fixup', 'interactive rebase'],
  },
  {
    id: 'move-commits-to-new-branch',
    title: "Move commits I made on main to a new branch",
    problem:
      "You forgot to create a branch and made a couple of commits directly on `main` (not pushed yet). They should be on `feature/login`, and `main` should go back to matching `origin/main`.",
    category: 'branching',
    level: 2,
    steps: [
      {
        text: "With a clean working directory (commit or stash anything pending), list the commits that are on your `main` but not on `origin/main`.",
        code: 'git log --oneline origin/main..main',
      },
      {
        text: "Create the new branch right here, **without switching to it**. It points at your latest commit, so the work is now safe on `feature/login`.",
        code: 'git branch feature/login',
      },
      {
        text: "Move `main` back to where the remote is. `--hard` is safe here because the commits are already saved in the new branch.",
        code: 'git reset --hard origin/main',
      },
      {
        text: "Switch to the new branch and keep working.",
        code: 'git switch feature/login',
      },
      {
        text: "Verify: `main` and `origin/main` point at the same commit, and your commits are only on `feature/login`.",
        code: 'git log --oneline --graph --all -6',
      },
    ],
    notes: [
      "No remote? Use `git reset --hard HEAD~2` in step 3 instead (2 = the number of commits to move).",
      "If you only have **uncommitted** changes (no commits yet), it's even simpler: `git switch -c feature/login` takes them with you to the new branch.",
      "Need them on an **existing** branch instead? `git switch feature/login`, `git cherry-pick <hash>` for each commit, then go back to `main` and reset it as in step 3.",
      "If you already pushed those commits to `main`, don't reset it: use `git revert` on `main` and talk to your team.",
    ],
    related: ['branch', 'reset', 'switch', 'cherry-pick', 'log', 'stash'],
    keywords: ['committed on wrong branch', 'committed to main', 'move commits', 'new branch', 'wrong branch', 'forgot to create branch'],
  },
  {
    id: 'bring-commit-from-another-branch',
    title: "Bring one specific commit from another branch",
    problem:
      "A commit on another branch (say, a bug fix on `feature/login`) is needed on your current branch too, but you don't want to merge the whole branch.",
    category: 'branching',
    level: 2,
    steps: [
      {
        text: "Find the hash of the commit you want.",
        code: 'git log --oneline feature/login',
      },
      {
        text: "Switch to the branch that should receive it.",
        code: 'git switch main',
      },
      {
        text: "Copy the commit onto your current branch. Git creates a new commit with the same changes and message (but a different hash).",
        code: 'git cherry-pick a1b2c3d',
      },
      {
        text: "If there's a conflict, resolve the file as in a merge (edit it, delete the markers) and stage it.",
        code: 'git add src/app.js',
      },
      {
        text: "Then let the cherry-pick finish.",
        code: 'git cherry-pick --continue',
      },
      {
        text: "Verify that the new commit is there.",
        code: 'git log --oneline -3',
      },
    ],
    notes: [
      "Several commits: `git cherry-pick a1b2c3d d4e5f6a`. A range `git cherry-pick a1b2c3d..789abcd` takes the commits **after** `a1b2c3d` up to and including `789abcd`.",
      "`git cherry-pick -x a1b2c3d` adds \"(cherry picked from commit …)\" to the message, handy for tracking backports.",
      "`git cherry-pick -n a1b2c3d` (`--no-commit`) applies the changes without committing, so you can adjust them first.",
      "Cherry-pick **copies**, it doesn't move: the original commit stays on its branch.",
      "`git cherry-pick --abort` cancels and leaves your branch as it was.",
    ],
    related: ['cherry-pick', 'log', 'switch', 'add', 'merge'],
    keywords: ['cherry-pick', 'copy commit', 'single commit', 'pick commit', 'backport', 'commit from another branch'],
  },
  {
    id: 'undo-pushed-commit',
    title: "Undo a commit I already pushed",
    problem:
      "A commit that's already on the remote (and maybe in your teammates' copies) broke something. You need to undo it without causing trouble for everyone else.",
    category: 'undo',
    level: 2,
    steps: [
      {
        text: "Find the hash of the bad commit.",
        code: 'git log --oneline -5',
      },
      {
        text: "Create a new commit that does the exact opposite of the bad one. Git opens the editor with a message like \"Revert \"Add login form\"\"; save and close (or add `--no-edit` to skip it).",
        code: 'git revert a1b2c3d',
      },
      {
        text: "Check what the revert commit undoes.",
        code: 'git show --stat HEAD',
      },
      {
        text: "Push it like any normal commit. No force needed, because nothing was rewritten.",
        code: 'git push',
      },
    ],
    notes: [
      "**Why not reset?** `git reset` removes the commit from your branch's history, so your branch no longer matches the remote and you'd have to force push. Anyone who already pulled the old history ends up with diverged copies and confusing merges, and the \"deleted\" commit can even come back. Revert only **adds** a commit, so everyone simply pulls it.",
      "To revert a merge commit, tell git which parent is the main line: `git revert -m 1 <merge-hash>`.",
      "Undo several recent commits in one go: `git revert --no-commit HEAD~3..HEAD`, then `git commit -m \"Revert login changes\"`.",
      "Revert conflicts are resolved like any other: edit, `git add`, then `git revert --continue`.",
      "Changed your mind? Reverting the revert commit brings the changes back.",
      "Exception: on a branch that only you use and nobody pulled, `git reset` + `git push --force-with-lease` is acceptable.",
    ],
    related: ['revert', 'reset', 'push', 'log', 'show'],
    keywords: ['undo pushed commit', 'revert', 'undo after push', 'rollback', 'public history', 'cancel commit'],
  },
  {
    id: 'recover-deleted-branch-or-commit',
    title: "Recover a deleted branch or lost commits",
    problem:
      "You deleted a branch with `git branch -D`, or ran `git reset --hard` and lost commits. They're not really gone: git keeps a log (the reflog) of every place HEAD has been.",
    category: 'undo',
    level: 3,
    steps: [
      {
        text: "Open the reflog: every position HEAD has been in, most recent first, with lines like `a1b2c3d HEAD@{2}: commit: Add login form`.",
        code: 'git reflog',
      },
      {
        text: "Find the last commit of the lost work (look for its message, or for the line just before the reset or the switch away). Inspect it to be sure.",
        code: 'git show a1b2c3d',
      },
      {
        text: "Recreate the branch pointing at that commit.",
        code: 'git branch feature/login a1b2c3d',
      },
      {
        text: "Switch to it.",
        code: 'git switch feature/login',
      },
      {
        text: "Check that all your commits are back.",
        code: 'git log --oneline -5',
      },
    ],
    notes: [
      "When you delete a branch, git prints its last commit: `Deleted branch feature/login (was a1b2c3d)`. That hash is all you need for step 3.",
      "Lost commits with `git reset --hard` on your current branch? Instead of a new branch, move it back: `git reset --hard HEAD@{1}` (HEAD's previous position) or use the hash from the reflog.",
      "In PowerShell, quote references with braces: `git reset --hard 'HEAD@{1}'`.",
      "The reflog is **local** (only on your machine) and old entries expire (by default after 30 to 90 days), so recover soon.",
      "Changes that were never committed (discarded with `git restore` or `reset --hard`) aren't in the reflog; it can't help with those.",
    ],
    related: ['reflog', 'branch', 'reset', 'switch', 'show', 'log'],
    keywords: ['recover branch', 'deleted branch', 'lost commits', 'reflog', 'undo reset', 'restore commit', 'undelete'],
  },
  {
    id: 'push-rejected',
    title: "My push was rejected (fetch first / non-fast-forward)",
    problem:
      "`git push` failed with \"! [rejected] main -> main (fetch first)\" or \"(non-fast-forward)\" and \"Updates were rejected because the remote contains work that you do not have locally\". Someone else pushed commits you don't have yet.",
    category: 'remotes',
    level: 1,
    steps: [
      {
        text: "Download the new commits from the remote, without changing your branch yet.",
        code: 'git fetch origin',
      },
      {
        text: "See the situation: `git status` will say something like \"Your branch and 'origin/main' have diverged, and have 1 and 2 different commits each\".",
        code: 'git status',
      },
      {
        text: "Put your local commits on top of the remote ones with a rebase (or use `git merge origin/main` if you prefer a merge commit). Resolve conflicts if any appear.",
        code: 'git rebase origin/main',
      },
      {
        text: "Push again. Now your branch contains everything the remote has, so the remote accepts it.",
        code: 'git push',
      },
    ],
    notes: [
      "Steps 1–3 in one command: `git pull --rebase` (see also \"git pull says I have divergent branches\").",
      "**Don't just force it.** Adding `--force` would overwrite the remote branch and delete your teammates' commits. Force pushing is only for your own branches after a rebase, and even then prefer `--force-with-lease`.",
      "\"non-fast-forward\" means the remote branch can't simply move forward to your commit, because it has commits that aren't in your history.",
      "If `--force-with-lease` is rejected with \"stale info\", someone pushed to that branch since your last fetch: fetch, look at what they did, and integrate it before trying again.",
    ],
    related: ['push', 'fetch', 'pull', 'rebase', 'merge', 'status'],
    keywords: ['push rejected', 'fetch first', 'non-fast-forward', 'failed to push', 'updates were rejected', 'behind remote'],
  },
  {
    id: 'pull-divergent-branches',
    title: "git pull says I have divergent branches",
    problem:
      "`git pull` stops with \"hint: You have divergent branches and need to specify how to reconcile them\" and \"fatal: Need to specify how to reconcile divergent branches\". You have local commits and the remote has new ones, and recent versions of git make you choose explicitly how to combine them.",
    category: 'remotes',
    level: 2,
    steps: [
      {
        text: "Pick a strategy for this pull. **Rebase** (recommended in most cases): your local commits are replayed on top of the remote ones and the history stays a straight line.",
        code: 'git pull --rebase',
      },
      {
        text: "**Or merge:** creates a merge commit that joins both histories (the classic behavior).",
        code: 'git pull --no-rebase',
      },
      {
        text: "**Or fast-forward only:** refuses to combine anything, so it only succeeds if you have no local commits. Good for `main` when you never commit directly on it.",
        code: 'git pull --ff-only',
      },
      {
        text: "To stop seeing the message, set a default once for all your repositories. This one makes `git pull` always rebase:",
        code: 'git config --global pull.rebase true',
      },
    ],
    notes: [
      "Other possible defaults: `git config --global pull.rebase false` (always merge) or `git config --global pull.ff only` (only fast-forward; you decide by hand when the histories diverge).",
      "**Why does git ask?** \"Divergent\" means each side has commits the other lacks. Older git silently created a merge commit, filling histories with \"Merge branch 'main' of …\" commits, so now it makes you choose.",
      "With rebase, conflicts are resolved like in a rebase (`git add` + `git rebase --continue`); with merge, like in a merge (`git add` + `git commit`).",
      "`git config --global rebase.autoStash true` makes `git pull --rebase` stash and re-apply your uncommitted changes automatically.",
      "Not sure? Run `git fetch` and then `git log --oneline --graph main origin/main` to look at both sides before pulling.",
    ],
    related: ['pull', 'config', 'fetch', 'rebase', 'merge'],
    keywords: ['divergent branches', 'reconcile', 'pull.rebase', 'need to specify how to reconcile', 'pull rebase', 'ff-only'],
  },
  {
    id: 'stash-switch-branch',
    title: "Save unfinished work to switch branches",
    problem:
      "You're halfway through something on `feature/login` and need to switch to `main` urgently (a bug, a review), but your changes aren't ready to commit, and git refuses to switch (\"Your local changes would be overwritten\") or you don't want to carry them along.",
    category: 'stash',
    level: 1,
    steps: [
      {
        text: "Save your changes in the stash; the working directory goes back to clean. `-u` also saves untracked (new) files and `-m` adds a label.",
        code: 'git stash push -u -m "login form half done"',
      },
      {
        text: "Switch to the other branch freely.",
        code: 'git switch main',
      },
      {
        text: "Do what you needed there (fix, commit, push) and come back.",
        code: 'git switch feature/login',
      },
      {
        text: "See your saved stashes (the most recent is `stash@{0}`).",
        code: 'git stash list',
      },
      {
        text: "Re-apply the latest stash and remove it from the list.",
        code: 'git stash pop',
      },
    ],
    notes: [
      "`git stash apply` re-applies but **keeps** the stash in the list (handy to apply it on several branches). Remove it later with `git stash drop`.",
      "Pick a specific stash with `git stash pop 1` (same as `stash@{1}`; in PowerShell, write `'stash@{1}'` with quotes).",
      "If `pop` causes a conflict, resolve it as usual and `git add` the file. In that case the stash is **not** removed, so run `git stash drop` when you're done.",
      "Without `-u`, new untracked files stay in your working directory and travel with you to the other branch.",
      "`git stash show -p` shows what's inside the latest stash.",
      "Alternative: a temporary commit (`git commit -m \"WIP\"`) that you later undo with `git reset --soft HEAD~1` (see \"Undo the last commit but keep my changes\").",
    ],
    related: ['stash', 'switch', 'status', 'commit', 'reset'],
    keywords: ['stash', 'save work', 'switch branch', 'uncommitted changes', 'wip', 'would be overwritten', 'temporarily save'],
  },
  {
    id: 'rename-branch',
    title: "Rename a branch (locally and on the remote)",
    problem:
      "Your branch is called `feature/loign` (typo) or the name no longer fits. You want to rename it to `feature/login`, also on the remote if you already pushed it.",
    category: 'branching',
    level: 2,
    steps: [
      {
        text: "Rename the branch you're on. From another branch, give both names: `git branch -m feature/loign feature/login`.",
        code: 'git branch -m feature/login',
      },
      {
        text: "If it was already pushed: push the new name and set it as the upstream.",
        code: 'git push -u origin feature/login',
      },
      {
        text: "Delete the old name from the remote.",
        code: 'git push origin --delete feature/loign',
      },
      {
        text: "Verify: the branch now tracks `origin/feature/login`.",
        code: 'git branch -vv',
      },
    ],
    notes: [
      "`-m` refuses if a branch with the new name already exists; `-M` forces the rename and overwrites it.",
      "Teammates with the old branch: `git fetch --prune` removes their stale `origin/feature/loign`, and they can rename their local copy the same way.",
      "If there's an open pull request from the old branch, deleting it on the remote usually closes the PR. On GitHub, rename the branch from the web interface instead (branch list → rename); that keeps the PR.",
      "Renaming `master` to `main` works the same way; also change the default branch in the hosting platform's settings.",
    ],
    related: ['branch', 'push', 'remote', 'fetch'],
    keywords: ['rename branch', 'branch name', 'typo in branch', 'branch -m', 'change branch name', 'rename remote branch'],
  },
  {
    id: 'delete-branch',
    title: "Delete a branch (locally and on the remote)",
    problem:
      "`feature/login` was already merged and you want to clean it up, both on your machine and on the remote.",
    category: 'branching',
    level: 1,
    steps: [
      {
        text: "Leave the branch first: you can't delete the branch you're on.",
        code: 'git switch main',
      },
      {
        text: "Delete the local branch. `-d` only works if it's merged, which protects you from losing work.",
        code: 'git branch -d feature/login',
      },
      {
        text: "Delete it on the remote.",
        code: 'git push origin --delete feature/login',
      },
      {
        text: "Clean up remote-tracking branches whose remote branch no longer exists (e.g. ones deleted on GitHub after merging a PR).",
        code: 'git fetch --prune',
      },
    ],
    notes: [
      "If `-d` says \"The branch 'feature/login' is not fully merged\", git is warning you that you'd lose commits. If you're sure, force it with `git branch -D feature/login`.",
      "After a \"Squash and merge\" or \"Rebase and merge\" on GitHub, git often thinks the branch isn't merged (the commits on `main` are different ones). Then `-D` is fine.",
      "Deleted the wrong one? The output says `(was a1b2c3d)`, and `git branch feature/login a1b2c3d` brings it back (see \"Recover a deleted branch or lost commits\").",
      "`git config --global fetch.prune true` makes every fetch prune automatically.",
      "Old syntax for deleting on the remote, still valid: `git push origin :feature/login`.",
    ],
    related: ['branch', 'push', 'fetch', 'switch', 'reflog'],
    keywords: ['delete branch', 'remove branch', 'clean up branches', 'branch -d', 'delete remote branch', 'prune'],
  },
  {
    id: 'sync-feature-branch-before-pr',
    title: "Update my feature branch before opening a pull request",
    problem:
      "You're about to open (or update) a pull request from `feature/login`, but `main` has moved on. You want your branch on top of the latest `main`, with any conflicts resolved by you and a clean history.",
    category: 'remotes',
    level: 2,
    steps: [
      {
        text: "Go to your feature branch.",
        code: 'git switch feature/login',
      },
      {
        text: "Make sure everything is committed (or stashed): the rebase needs a clean working directory.",
        code: 'git status',
      },
      {
        text: "Fetch the latest state of the remote.",
        code: 'git fetch origin',
      },
      {
        text: "Rebase your branch onto the up-to-date `origin/main`. Resolve conflicts if they appear (see \"Resolve a conflict during a rebase\").",
        code: 'git rebase origin/main',
      },
      {
        text: "Optional: tidy up your commits (squash the \"wip\" and \"fix typo\" ones). The editor shows only your branch's commits.",
        code: 'git rebase -i origin/main',
      },
      {
        text: "Run the app and the tests to make sure everything still works on top of the new `main`.",
      },
      {
        text: "Push. The rebase rewrote your commits, so a normal push would be rejected; `--force-with-lease` overwrites the remote branch only if nobody else pushed to it since your last fetch.",
        code: 'git push --force-with-lease',
      },
    ],
    notes: [
      "First push of the branch? Use `git push -u origin feature/login`; no force needed.",
      "**Lease vs plain force:** `--force` overwrites blindly. `--force-with-lease` first checks that the remote branch is still where you last saw it, so you don't wipe out a teammate's commits by accident.",
      "Only do this on branches that are yours. If others push to the same branch, merge `origin/main` instead (see \"Update my branch with the latest changes from main\").",
      "The pull request updates automatically after the push.",
      "To bail out in the middle of the rebase: `git rebase --abort`.",
    ],
    related: ['fetch', 'rebase', 'rebase-interactive', 'push', 'switch', 'status'],
    keywords: ['pull request', 'PR', 'sync branch', 'force-with-lease', 'rebase before PR', 'update PR', 'up to date with main'],
  },
  {
    id: 'find-bug-commit',
    title: "Find which commit introduced a bug",
    problem:
      "Something that used to work is broken now, and there are dozens of commits in between. Instead of checking them one by one, `git bisect` does a binary search for you.",
    category: 'inspection',
    level: 3,
    steps: [
      {
        text: "Start a bisect session.",
        code: 'git bisect start',
      },
      {
        text: "Mark the current commit as bad (the bug is here).",
        code: 'git bisect bad',
      },
      {
        text: "Mark a commit you know was good, e.g. a tag or an old hash.",
        code: 'git bisect good v1.2.0',
      },
      {
        text: "Git checks out a commit halfway between them. Test it (run the app, the tests…) and give your verdict: `git bisect good` if it works, `git bisect bad` if the bug is there. Repeat until git prints \"a1b2c3d is the first bad commit\".",
        code: 'git bisect good',
      },
      {
        text: "Look at the culprit.",
        code: 'git show a1b2c3d',
      },
      {
        text: "End the session and go back to the branch you started from.",
        code: 'git bisect reset',
      },
    ],
    notes: [
      "Each answer cuts the range in half: with about 1000 commits, around 10 tests are enough.",
      "Can't test a commit (e.g. it doesn't build)? `git bisect skip` moves to a nearby one.",
      "Automate it: `git bisect run npm test` runs the command at each step. Exit code 0 means good, 125 means skip, anything else means bad.",
      "During bisect you're in detached HEAD; that's normal. `git bisect reset` brings you back to your branch.",
      "Shortcut: `git bisect start HEAD v1.2.0` marks bad and good in one command. If \"good/bad\" doesn't fit what you're looking for, you can use `old`/`new` instead.",
    ],
    related: ['bisect', 'log', 'show', 'tag', 'blame', 'checkout'],
    keywords: ['bisect', 'find bug', 'regression', 'which commit broke', 'binary search', 'culprit commit'],
  },
  {
    id: 'see-what-changed',
    title: "See what changed (diff, log and show)",
    problem:
      "You want to review changes: what you modified but haven't staged, what's about to be committed, what a specific commit did, or how two branches differ.",
    category: 'inspection',
    level: 1,
    steps: [
      {
        text: "Changes in your working directory that are **not staged** yet.",
        code: 'git diff',
      },
      {
        text: "Changes that **are staged**, i.e. what will go into the next commit.",
        code: 'git diff --staged',
      },
      {
        text: "Every change since the last commit, staged or not.",
        code: 'git diff HEAD',
      },
      {
        text: "Compact history: one line per commit, with the graph of all branches.",
        code: 'git log --oneline --graph --all',
      },
      {
        text: "What a specific commit did: its message, author and diff.",
        code: 'git show a1b2c3d',
      },
      {
        text: "The history of a single file, with the diff of each commit.",
        code: 'git log -p -- src/app.js',
      },
      {
        text: "The commits on `feature/login` that aren't on `main` yet.",
        code: 'git log --oneline main..feature/login',
      },
      {
        text: "Everything `feature/login` changed since it split off from `main` (roughly what its pull request will show).",
        code: 'git diff main...feature/login',
      },
    ],
    notes: [
      "`--staged` and `--cached` are synonyms.",
      "`git diff --stat` (or `git show --stat a1b2c3d`) gives just a summary of files and lines changed.",
      "**Two dots vs three dots** in `git diff`: `main..feature/login` compares the two branch tips directly (changes made on `main` show up too, reversed); `main...feature/login` shows only what changed on `feature/login` since it split off, usually what you want for a review.",
      "In `git log`, `main..feature/login` means \"commits reachable from feature/login but not from main\".",
      "Long output opens in a pager: scroll with the arrow keys or Space, quit with `q`.",
      "Handy log filters: `--author=\"Ana\"`, `--since=\"2 weeks ago\"`, `--grep=\"login\"`.",
      "`git diff --word-diff` highlights changed words instead of whole lines, nice for text files like `README.md`.",
      "To see who last changed each line of a file: `git blame src/app.js`.",
    ],
    related: ['diff', 'log', 'show', 'status', 'blame'],
    keywords: ['diff', 'what changed', 'compare', 'history', 'staged changes', 'compare branches', 'log'],
  },
];
