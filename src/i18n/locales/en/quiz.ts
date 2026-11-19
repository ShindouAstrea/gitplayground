import type { QuizText } from '../../../content/types';

export const quizTexts: Record<string, QuizText> = {
  // ---------------------------------------------------------------- Level 1
  'config-user-name': {
    prompt: "Set your git user name to `Ada Lovelace` for every repository on this computer.",
    explanation:
      "`--global` saves the setting in your user config (`~/.gitconfig`), so it applies to all your repositories; without it, it only affects the current one. The quotes are needed because the name contains a space. Set `user.email` the same way, since every commit records both.",
  },
  'init-repo': {
    prompt: "Turn the current folder into a new, empty git repository.",
    explanation:
      "`git init` creates the hidden `.git` folder, where git keeps all the history and configuration. It's safe in a folder that already has files: nothing is tracked until you `add` and `commit`. Avoid running it inside a folder that already belongs to another repository.",
  },
  'clone-into-folder': {
    prompt: "Download the repository `https://github.com/acme/shop.git` into a new folder called `shop-dev`.",
    explanation:
      "`git clone <url> <folder>` copies the whole history and sets up a remote called `origin` that points to that URL. Without the last argument, the folder would be named after the repository (`shop`).",
  },
  'stage-all': {
    prompt: "Stage every change in the repository (new, modified and deleted files) for the next commit.",
    explanation:
      "`git add -A` (`--all`) stages all changes in the whole working tree. `git add .` does the same but only for the current folder and its subfolders, so it's equivalent when you're at the root of the repo. Run `git status` first so you don't stage files you didn't mean to.",
  },
  'commit-with-message': {
    prompt: "Commit the staged changes with the message `Add login form`, without opening an editor.",
    explanation:
      "`-m` passes the message directly; without it, git opens your configured editor. Only staged changes go into the commit, so run `git add` first (or add `-a` to include every modified tracked file).",
  },
  'create-and-switch-branch': {
    prompt: "Create a branch called `hotfix` and switch to it in one command.",
    explanation:
      "`git switch -c` (\"create\") is the modern form; `git checkout -b` does the same and also works on older git versions. The new branch starts from the commit you're on. `git branch hotfix` alone would create it without switching to it.",
  },
  'delete-merged-branch': {
    prompt: "Delete the local branch `feature/login`, which has already been merged.",
    explanation:
      "`-d` only deletes the branch if it's fully merged, so you can't lose work by accident. You can't delete the branch you're currently on, so switch away first. This doesn't touch the branch on the remote.",
  },
  'unstage-file': {
    prompt: "You staged `app.js` by mistake. Unstage it, but keep your changes in the file.",
    explanation:
      "`git restore --staged` takes the file out of the staging area and leaves your edits in the working directory. Older tutorials use `git reset HEAD <file>`, which does the same. Careful: without `--staged`, `git restore` would throw your edits away instead.",
  },
  'discard-file-changes': {
    prompt: "You edited `style.css` (without staging it) and want to throw those edits away, going back to the last committed version.",
    explanation:
      "`git restore <file>` overwrites the file with the version in the staging area, which is the last commit if you haven't staged anything. There's no undo: uncommitted edits aren't in git's history. The older equivalent is `git checkout -- <file>`; the `--` avoids confusion with a branch of the same name.",
  },
  'add-remote': {
    prompt: "Connect your local repository to `https://github.com/acme/shop.git` under the name `origin`.",
    explanation:
      "`git remote add <name> <url>` saves a short name for that URL so you can `push` and `fetch` with it; `origin` is just the usual name for the main remote. Check it with `git remote -v`. If `origin` already exists, change its URL with `git remote set-url` instead.",
  },
  'push-set-upstream': {
    prompt: "Push your new local branch `feature` to `origin` for the first time and set it as its upstream, so that later a plain `git push` is enough.",
    explanation:
      "`-u` (`--set-upstream`) links your local branch to `origin/feature`. From then on, `git push`, `git pull` and `git status` know which remote branch to use. You only need it once per branch.",
  },
  'stash-pop': {
    prompt: "Reapply your most recent stash and remove it from the stash list.",
    explanation:
      "`pop` is `apply` + `drop`. If applying causes a conflict, the stash is **not** dropped, so you can resolve it and then delete it with `git stash drop`. Use `git stash apply` if you want to keep the stash.",
  },
  'diff-staged': {
    prompt: "Show the changes you've already staged, i.e. what will go into the next commit.",
    explanation:
      "A plain `git diff` only shows changes that are **not** staged yet, which surprises many people right after `git add`. `--staged` and `--cached` are synonyms. To see everything compared to the last commit, use `git diff HEAD`.",
  },
  'show-commit': {
    prompt: "Show the author, message and changes of commit `a1b2c3d`.",
    explanation:
      "`git show <commit>` prints the commit's metadata followed by its diff; without an argument it shows `HEAD`. You can also view a single file as it was in that commit with `git show a1b2c3d:path/to/file`.",
  },
  'tag-lightweight': {
    prompt: "Put a lightweight tag named `v1.0` on the current commit.",
    explanation:
      "A lightweight tag is just a name pointing to a commit, with no author or message; for releases, annotated tags (`git tag -a`) are preferred. Tags aren't pushed by default: send them with `git push origin v1.0`.",
  },

  // ---------------------------------------------------------------- Level 2
  'config-default-branch': {
    prompt: "Make every repository you create with `git init` start on a branch called `main` (for all repositories on this computer).",
    explanation:
      "`init.defaultBranch` sets the name of the first branch that `git init` creates. It only affects new repositories; to rename the branch in an existing one, use `git branch -m main`.",
  },
  'stop-tracking-file': {
    prompt: "You committed `secrets.env` by mistake. Stop tracking it in git, but keep the file on your disk.",
    explanation:
      "`--cached` removes the file from the index only: the next commit deletes it from the repository, but your local copy stays. Add it to `.gitignore` so it doesn't get staged again. It's still in older commits, so if it held real secrets, rotate them.",
  },
  'switch-previous-branch': {
    prompt: "Go back to the branch you were on right before the current one.",
    explanation:
      "`-` is shorthand for `@{-1}`, the previously checked-out branch, just like `cd -` in the shell. Running it again takes you back, so it's handy for jumping between two branches.",
  },
  'force-delete-branch': {
    prompt: "Delete the local branch `experiment`, even though it has commits that were never merged.",
    explanation:
      "`-D` is short for `--delete --force`: it skips the \"is it merged?\" check, so those commits are left without a branch. If you regret it, `git reflog` can usually still find the last commit for a while.",
  },
  'rename-current-branch': {
    prompt: "Rename the branch you're currently on to `main`.",
    explanation:
      "With one argument, `git branch -m` renames the current branch; with two (`-m old new`) it renames any branch. `-M` forces it even if `main` already exists. The remote keeps the old name until you push the new one and delete the old one there.",
  },
  'merge-no-ff': {
    prompt: "Merge `feature` into the current branch, always creating a merge commit, even if a fast-forward would be possible.",
    explanation:
      "If your branch hasn't moved since `feature` was created, git just fast-forwards the pointer and no merge commit is made. `--no-ff` forces a merge commit, leaving a visible record in the history that `feature` was a separate line of work.",
  },
  'merge-abort': {
    prompt: "A merge stopped with conflicts and you'd rather not deal with them now. Cancel the merge and go back to how things were before it started.",
    explanation:
      "`git merge --abort` returns your branch and files to their state before the merge. If you'd rather resolve: fix the files, `git add` them and finish with `git merge --continue` (or `git commit`). Commit or stash your own changes before merging, because aborting can't always restore uncommitted work.",
  },
  'undo-commit-keep-staged': {
    prompt: "Undo your last commit, but keep its changes **staged**, ready to be committed again.",
    explanation:
      "`--soft` only moves the branch pointer back one commit; the staging area and your files stay untouched, so everything from that commit is still staged. `HEAD~1` means \"the parent of `HEAD`\". Don't do this with commits already pushed to a shared branch; use `git revert` there.",
  },
  'undo-commit-keep-unstaged': {
    prompt: "Undo your last commit and keep its changes in your files, but **not staged**.",
    explanation:
      "`--mixed` is the default mode of `git reset`: it moves the branch back and resets the staging area, but leaves your working files alone. Compare with `--soft` (changes stay staged) and `--hard` (changes are thrown away).",
  },
  'undo-commit-discard': {
    prompt: "Completely throw away your last commit **and** all its changes, as if it never happened.",
    explanation:
      "`--hard` moves the branch back and overwrites both the staging area and your files. Any uncommitted changes are lost for good, although the discarded commit can still be recovered for a while with `git reflog`. Never do this with commits others have already pulled.",
  },
  'revert-commit': {
    prompt: "Commit `a1b2c3d` is already on a shared branch and introduced a bug. Undo its changes with a new commit, without rewriting history.",
    explanation:
      "`git revert` creates a new commit that applies the inverse of the given one, so history stays intact and it's safe on shared branches. `git revert HEAD` undoes the most recent commit. To revert a merge commit you need `-m 1` to say which parent to keep.",
  },
  'amend-no-edit': {
    prompt: "You forgot a file in your last commit. You've just staged it: add it to that commit **without changing its message**.",
    explanation:
      "`--amend` replaces the last commit with a new one that also includes what's staged; `--no-edit` reuses the existing message instead of opening the editor. Since the commit gets a new hash, don't amend commits you've already pushed unless you're ready to force-push.",
  },
  'cherry-pick': {
    prompt: "Copy the changes of commit `f00ba12` (from another branch) onto your current branch as a new commit.",
    explanation:
      "`git cherry-pick` replays a single commit on top of `HEAD`, creating a new commit with a different hash. Add `-x` to record the original hash in the message. On conflicts, resolve them, `git add` the files and run `git cherry-pick --continue` (or `--abort`).",
  },
  'pull-rebase': {
    prompt: "Update your current branch from its upstream, putting your local commits **on top** of the incoming ones instead of creating a merge commit.",
    explanation:
      "`git pull --rebase` runs a `fetch` and then rebases your unpushed commits onto the updated remote branch, keeping history linear. To make it the default, run `git config --global pull.rebase true`. If conflicts appear, resolve them and use `git rebase --continue`.",
  },
  'delete-remote-branch': {
    prompt: "Delete the branch `old-feature` on the remote `origin`.",
    explanation:
      "Deleting a branch locally with `git branch -d` doesn't delete it on the remote; you have to push the deletion. The old syntax `git push origin :old-feature` (pushing \"nothing\" into it) does the same. Teammates can clean up their stale `origin/old-feature` with `git fetch --prune`.",
  },
  'stash-with-message': {
    prompt: "Save your uncommitted changes to the stash with the description `wip login form`.",
    explanation:
      "A message makes `git stash list` much easier to read than the default `WIP on main: ...`. `git stash save` is the older, deprecated form. Untracked files are **not** stashed unless you add `-u`.",
  },
  'stash-include-untracked': {
    prompt: "Stash all your changes, **including** new files that git isn't tracking yet.",
    explanation:
      "Without `-u`, `git stash` only saves tracked files, so new files stay in your working directory. `-a` (`--all`) goes further and also stashes ignored files, which is rarely what you want.",
  },
  'log-oneline-graph-all': {
    prompt: "Show the history of **all** branches as a compact graph, one line per commit.",
    explanation:
      "`--oneline` shortens each commit to hash + subject, `--graph` draws the branch lines and `--all` includes every branch, not only the current one. Many people save it as an alias, e.g. `git config --global alias.lg \"log --oneline --graph --all\"`.",
  },
  'blame-file': {
    prompt: "Find out who last changed each line of `src/app.ts`, and in which commit.",
    explanation:
      "`git blame` annotates every line with the commit, author and date of its last change; limit it to some lines with `-L 10,20`. That last change might be just a reformat: `-w` ignores whitespace changes, and `git log -L` shows the full history of a range of lines.",
  },
  'tag-annotated': {
    prompt: "Create an annotated tag `v1.2.0` on the current commit with the message `Release 1.2.0`.",
    explanation:
      "An annotated tag is a full git object with its own author, date and message, which is what you want for releases. `-m` without `-a` also creates an annotated tag. Like every tag, it isn't pushed automatically: use `git push origin v1.2.0`.",
  },
  'push-tags': {
    prompt: "Push all your local tags to `origin`.",
    explanation:
      "A regular `git push` does **not** send tags. `--tags` pushes all of them; to push just one, use `git push origin v1.2.0`. `--follow-tags` is a safer middle ground: it only pushes annotated tags that point to the commits being pushed.",
  },

  // ---------------------------------------------------------------- Level 3
  'checkout-theirs': {
    prompt: "You're merging `feature` into `main` and `config.json` has conflicts. Replace it in your working tree with `feature`'s version of the file (\"theirs\").",
    explanation:
      "During a merge, `--ours` is the branch you're on and `--theirs` is the one being merged in. After picking a side, mark the conflict as resolved with `git add config.json`. Watch out: during a **rebase** the roles are swapped, and `--ours` is the branch you're rebasing onto.",
  },
  'rebase-continue': {
    prompt: "During a rebase you fixed a conflict and staged the file. Tell git to carry on with the rest of the rebase.",
    explanation:
      "Unlike in a merge, you don't commit by hand during a rebase: `--continue` creates the commit and replays the remaining ones. If it gets too messy, `git rebase --abort` puts everything back as it was before the rebase, and `--skip` drops the current commit.",
  },
  'rebase-interactive-last-3': {
    prompt: "Start an interactive rebase to reword, squash or reorder your last 3 commits.",
    explanation:
      "`HEAD~3` is the base: the three commits after it open in your editor, oldest first, where you change `pick` to `reword`, `squash`, `fixup`, `drop`, etc. It rewrites those commits' hashes, so only do it with commits you haven't shared (or be ready to push with `--force-with-lease`).",
  },
  'rebase-onto': {
    prompt: "You're on `feature`, which you created from `develop` by mistake. Move only `feature`'s own commits so they start from `main` instead.",
    explanation:
      "`git rebase --onto <new-base> <old-base>` takes the commits after `<old-base>` (here, those in `feature` but not in `develop`) and replays them on `<new-base>`. A plain `git rebase main` would also drag along `develop`'s commits that aren't in `main`.",
  },
  reflog: {
    prompt: "After a `git reset --hard` you lost a commit. Show the log of every position `HEAD` has been at, so you can find its hash.",
    explanation:
      "The reflog is a local record of where `HEAD` (and each branch) has pointed, including commits no longer reachable from any branch. Once you find the hash, recover it with `git branch rescue <hash>` or `git reset --hard <hash>`. It's never pushed, and old entries expire (by default, unreachable ones after about 30 days).",
  },
  'restore-file-from-commit': {
    prompt: "Bring `README.md` back to exactly how it was in commit `a1b2c3d`, without moving any branch.",
    explanation:
      "`--source` (`-s`) tells `git restore` which commit to take the file from; only that file changes and your branch stays where it is. `git checkout a1b2c3d -- README.md` also works, but it stages the file as well. Commit the result if you want to keep it.",
  },
  'push-force-with-lease': {
    prompt: "You rebased your branch `feature`, which was already on `origin`. Push it, overwriting the remote branch only if nobody else has pushed to it since you last fetched.",
    explanation:
      "A rebase rewrites hashes, so a normal push is rejected. `--force` overwrites blindly and can wipe out teammates' work; `--force-with-lease` refuses if the remote branch moved since your last fetch. Pitfall: a `git fetch` right before pushing updates that reference and removes the protection.",
  },
  'stash-apply-specific': {
    prompt: "Apply the stash `stash@{2}` to your working directory, but keep it in the stash list.",
    explanation:
      "`apply` leaves the stash in the list (unlike `pop`), which is useful if you want to apply it on several branches. Find the right index with `git stash list`. In PowerShell, quote it (`'stash@{2}'`) because braces have a special meaning there.",
  },
  'log-search-string': {
    prompt: "Find the commits that added or removed the text `API_KEY` anywhere in the code.",
    explanation:
      "`-S` (the \"pickaxe\") lists commits where the number of occurrences of that string changed, that is, where it was added or removed. Add `-p` to see the diffs. Don't confuse it with `--grep`, which searches commit **messages**.",
  },
  'bisect-start': {
    prompt: "In one command, start a bisect session telling git that the current commit (`HEAD`) is bad and the tag `v1.0` was good.",
    explanation:
      "`git bisect start <bad> <good>` begins a binary search between those two commits. Git checks out one in the middle; you test it and answer `git bisect good` or `git bisect bad` until it names the first bad commit. Finish with `git bisect reset` to go back to where you started.",
  },
  'log-commits-not-in-main': {
    prompt: "List the commits that are on `feature` but not yet on `main`.",
    explanation:
      "`A..B` means \"reachable from `B` but not from `A`\", so `main..feature` shows what merging `feature` would bring into `main`. Swap them (`feature..main`) to see what you're missing. With three dots (`main...feature`) you get commits that are on either side but not on both.",
  },
  'delete-remote-tag': {
    prompt: "Delete the tag `v0.9` from the remote `origin` (you already deleted it locally).",
    explanation:
      "Deleting a tag locally with `git tag -d` doesn't affect the remote. `--delete` works for tags just like for branches; use the full name `refs/tags/v0.9` if a branch has the same name. Anyone who already fetched the tag keeps their copy until they delete it themselves.",
  },
};
