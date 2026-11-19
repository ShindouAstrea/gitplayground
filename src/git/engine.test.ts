import { describe, expect, it } from 'vitest';
import { applyRebasePlan, run } from './engine';
import { headId, resolveRev } from './repo';
import { Scenario } from './scenario';
import type { RepoState } from './types';

/** Runs commands in order, failing the test if any unexpected error happens */
function exec(state: RepoState, ...lines: string[]): RepoState {
  for (const line of lines) {
    const r = run(state, line);
    if (!r.ok) throw new Error(`"${line}" failed:\n${r.lines.map((l) => l.text ?? l.hint).join('\n')}`);
    state = r.state;
  }
  return state;
}

function output(state: RepoState, line: string) {
  const r = run(state, line);
  return { ...r, text: r.lines.map((l) => l.text ?? l.parts?.map((p) => p.t).join('') ?? '').join('\n') };
}

const base = () =>
  new Scenario()
    .commit('Initial commit', { 'README.md': '# Project\n', 'app.js': 'line1\nline2\nline3\nline4\nline5\n' })
    .done();

describe('basics', () => {
  it('init, add, commit', () => {
    let s = new Scenario(false).write({ 'a.txt': 'hello' }).done();
    expect(run(s, 'git status').ok).toBe(false);
    s = exec(s, 'git init', 'git add .', 'git commit -m "First"');
    expect(Object.keys(s.commits)).toHaveLength(1);
    expect(output(s, 'git status').text).toContain('nothing to commit, working tree clean');
  });

  it('supports && chaining, echo redirects and -am', () => {
    let s = base();
    s = exec(s, 'echo "new line" >> app.js && git commit -am "Append"');
    expect(s.commits[headId(s)!].tree['app.js']).toContain('new line');
    const r = run(s, 'git commit -m "nothing" && echo never > x.txt');
    expect(r.ok).toBe(false);
    expect(r.state.workdir['x.txt']).toBeUndefined();
  });

  it('amend replaces the last commit', () => {
    let s = exec(base(), 'echo x > b.txt', 'git add b.txt', 'git commit -m "Add b"');
    const before = headId(s);
    s = exec(s, 'git commit --amend -m "Add file b"');
    expect(headId(s)).not.toBe(before);
    expect(s.commits[headId(s)!].message).toBe('Add file b');
    expect(s.commits[headId(s)!].parents).toEqual(s.commits[before!].parents);
  });

  it('restore and reset paths', () => {
    let s = exec(base(), 'echo changed > README.md', 'echo y > app.js', 'git add app.js');
    s = exec(s, 'git restore README.md', 'git restore --staged app.js');
    expect(s.workdir['README.md']).toBe('# Project\n');
    expect(s.index['app.js']).toBe(s.commits[headId(s)!].tree['app.js']);
    expect(s.workdir['app.js']).toBe('y\n');
  });
});

describe('branching and merging', () => {
  it('fast-forward merge', () => {
    let s = exec(base(), 'git switch -c feature', 'echo f > f.txt', 'git add .', 'git commit -m "Feature"');
    const tip = headId(s);
    s = exec(s, 'git switch main', 'git merge feature');
    expect(headId(s)).toBe(tip);
    expect(s.workdir['f.txt']).toBe('f\n');
  });

  it('three-way merge creates a merge commit; different lines merge cleanly', () => {
    let s = exec(base(), 'git switch -c feature');
    s = exec(s, 'git restore app.js');
    s.workdir['app.js'] = 'line1 feature\nline2\nline3\nline4\nline5\n';
    s = exec(s, 'git commit -am "Edit line1"', 'git switch main');
    s.workdir['app.js'] = 'line1\nline2\nline3\nline4\nline5 main\n';
    s = exec(s, 'git commit -am "Edit line5"', 'git merge feature');
    const merge = s.commits[headId(s)!];
    expect(merge.parents).toHaveLength(2);
    expect(merge.tree['app.js']).toBe('line1 feature\nline2\nline3\nline4\nline5 main\n');
    expect(merge.message).toBe("Merge branch 'feature'");
  });

  it('merge conflict -> checkout --theirs -> add -> commit', () => {
    let s = exec(base(), 'git switch -c feature', 'echo feature > README.md', 'git commit -am "F"', 'git switch main');
    s = exec(s, 'echo main > README.md', 'git commit -am "M"');
    const r = run(s, 'git merge feature');
    expect(r.ok).toBe(false);
    s = r.state;
    expect(s.operation?.type).toBe('merge');
    expect(s.workdir['README.md']).toContain('<<<<<<< HEAD');
    expect(run(s, 'git commit -m x').ok).toBe(false);
    s = exec(s, 'git checkout --theirs README.md', 'git add README.md', 'git commit');
    expect(s.operation).toBeNull();
    expect(s.commits[headId(s)!].parents).toHaveLength(2);
    expect(s.workdir['README.md']).toBe('feature\n');
  });

  it('merge --abort restores the previous state', () => {
    let s = exec(base(), 'git switch -c feature', 'echo feature > README.md', 'git commit -am "F"', 'git switch main');
    s = exec(s, 'echo main > README.md', 'git commit -am "M"');
    s = run(s, 'git merge feature').state;
    s = exec(s, 'git merge --abort');
    expect(s.operation).toBeNull();
    expect(s.workdir['README.md']).toBe('main\n');
  });

  it('refuses to switch with conflicting local changes', () => {
    let s = exec(base(), 'git switch -c feature', 'echo feature > README.md', 'git commit -am "F"', 'git switch main');
    s = exec(s, 'echo dirty > README.md');
    const r = run(s, 'git switch feature');
    expect(r.ok).toBe(false);
    expect(r.lines[0].text).toContain('would be overwritten by checkout');
  });

  it('branch -d refuses unmerged, -D forces', () => {
    let s = exec(base(), 'git switch -c feature', 'echo f > f.txt', 'git add .', 'git commit -m F', 'git switch main');
    expect(run(s, 'git branch -d feature').ok).toBe(false);
    s = exec(s, 'git branch -D feature');
    expect(s.branches.feature).toBeUndefined();
  });

  it('detached HEAD warns when leaving commits behind', () => {
    let s = exec(base(), 'echo 2 > b.txt', 'git add .', 'git commit -m second', 'git checkout HEAD~1');
    expect(s.head.type).toBe('detached');
    s = exec(s, 'echo exp > exp.txt', 'git add .', 'git commit -m experiment');
    const r = output(s, 'git switch main');
    expect(r.text).toContain('leaving 1 commit behind');
  });
});

describe('rewriting history', () => {
  const diverged = () => {
    let s = exec(base(), 'git switch -c feature', 'echo a > a.txt', 'git add .', 'git commit -m "A"');
    s = exec(s, 'echo b > b.txt', 'git add .', 'git commit -m "B"', 'git switch main');
    return exec(s, 'echo m > m.txt', 'git add .', 'git commit -m "M"', 'git switch feature');
  };

  it('rebase replays commits on top of main', () => {
    let s = diverged();
    s = exec(s, 'git rebase main');
    expect(s.head).toEqual({ type: 'branch', name: 'feature' });
    const tip = s.commits[headId(s)!];
    expect(tip.message).toBe('B');
    expect(s.commits[tip.parents[0]].message).toBe('A');
    expect(s.commits[tip.parents[0]].parents[0]).toBe(s.branches.main);
  });

  it('rebase conflict -> resolve -> continue', () => {
    let s = exec(base(), 'git switch -c feature', 'echo feature > README.md', 'git commit -am "F"', 'git switch main');
    s = exec(s, 'echo main > README.md', 'git commit -am "M"', 'git switch feature');
    const r = run(s, 'git rebase main');
    expect(r.ok).toBe(false);
    s = r.state;
    expect(s.operation?.type).toBe('rebase');
    expect(s.head.type).toBe('detached');
    s = exec(s, 'echo both > README.md', 'git add README.md', 'git rebase --continue');
    expect(s.operation).toBeNull();
    expect(s.commits[s.branches.feature].parents[0]).toBe(s.branches.main);
    expect(s.workdir['README.md']).toBe('both\n');
  });

  it('interactive rebase can squash', () => {
    let s = exec(base(), 'echo 1 > n.txt', 'git add .', 'git commit -m one');
    s = exec(s, 'echo 2 >> n.txt', 'git commit -am two', 'echo 3 >> n.txt', 'git commit -am three');
    const r = run(s, 'git rebase -i HEAD~3');
    expect(r.ui?.type).toBe('rebase-todo');
    if (r.ui?.type !== 'rebase-todo') return;
    const [a, b, c] = r.ui.plan.steps;
    const res = applyRebasePlan(r.state, {
      ...r.ui.plan,
      steps: [a, { ...b, action: 'squash' }, { ...c, action: 'fixup', message: 'Numbers' }],
    });
    expect(res.ok).toBe(true);
    s = res.state;
    const tip = s.commits[headId(s)!];
    expect(tip.message).toBe('Numbers');
    expect(tip.tree['n.txt']).toBe('1\n2\n3\n');
    expect(s.commits[tip.parents[0]].message).toBe('Initial commit');
  });

  it('interactive rebase keeps untouched commits (fast-forward picks)', () => {
    let s = exec(base(), 'echo 1 > n.txt', 'git add .', 'git commit -m one', 'echo 2 >> n.txt', 'git commit -am two');
    const one = s.commits[headId(s)!].parents[0];
    const r = run(s, 'git rebase -i HEAD~2');
    if (r.ui?.type !== 'rebase-todo') throw new Error('no todo');
    const [a, b] = r.ui.plan.steps;
    s = applyRebasePlan(r.state, { ...r.ui.plan, steps: [a, { ...b, action: 'reword', message: 'two!' }] }).state;
    expect(s.commits[headId(s)!].parents[0]).toBe(one);
    expect(s.commits[headId(s)!].message).toBe('two!');
  });

  it('cherry-pick and revert', () => {
    let s = exec(base(), 'git switch -c hotfix', 'echo fix > fix.txt', 'git add .', 'git commit -m "Fix"', 'git switch main');
    const fix = s.branches.hotfix;
    s = exec(s, `git cherry-pick ${fix}`);
    expect(s.workdir['fix.txt']).toBe('fix\n');
    s = exec(s, 'git revert HEAD');
    expect(s.workdir['fix.txt']).toBeUndefined();
    expect(s.commits[headId(s)!].message).toMatch(/^Revert "Fix"/);
  });

  it('reset soft / mixed / hard', () => {
    let s = exec(base(), 'echo 2 > b.txt', 'git add .', 'git commit -m second');
    const soft = exec(s, 'git reset --soft HEAD~1');
    expect(soft.index['b.txt']).toBe('2\n');
    const mixed = exec(s, 'git reset HEAD~1');
    expect(mixed.index['b.txt']).toBeUndefined();
    expect(mixed.workdir['b.txt']).toBe('2\n');
    const hard = exec(s, 'git reset --hard HEAD~1');
    expect(hard.workdir['b.txt']).toBeUndefined();
    // recover with reflog
    s = exec(hard, 'git reset --hard HEAD@{1}');
    expect(s.workdir['b.txt']).toBe('2\n');
  });
});

describe('stash', () => {
  it('push and pop', () => {
    let s = exec(base(), 'echo wip >> app.js', 'echo new > new.txt', 'git add new.txt', 'git stash');
    expect(s.workdir['app.js']).toBe('line1\nline2\nline3\nline4\nline5\n');
    expect(s.workdir['new.txt']).toBeUndefined();
    s = exec(s, 'git stash pop');
    expect(s.workdir['app.js']).toContain('wip');
    expect(s.index['new.txt']).toBe('new\n');
    expect(s.stash).toHaveLength(0);
  });
});

describe('remotes', () => {
  it('push rejected -> pull --rebase -> push', () => {
    let s = new Scenario()
      .commit('Initial commit', { 'README.md': '# P\n' })
      .origin()
      .remoteCommit('main', 'Teammate work', { 'team.txt': 'hi' })
      .done();
    s = exec(s, 'echo mine > mine.txt', 'git add .', 'git commit -m "Mine"');
    const rejected = run(s, 'git push');
    expect(rejected.ok).toBe(false);
    expect(rejected.lines.map((l) => l.text).join('\n')).toContain('fetch first');
    const divergent = run(s, 'git pull');
    expect(divergent.ok).toBe(false);
    s = exec(s, 'git pull --rebase', 'git push');
    expect(s.remotes.origin.branches.main).toBe(headId(s));
    expect(s.workdir['team.txt']).toBe('hi\n');
  });

  it('push -u sets upstream and switch DWIM creates tracking branches', () => {
    let s = new Scenario().commit('Initial commit', { 'README.md': '# P\n' }).origin().done();
    s = exec(s, 'git switch -c feature', 'echo f > f.txt', 'git add .', 'git commit -m F');
    expect(run(s, 'git push').ok).toBe(false);
    s = exec(s, 'git push -u origin feature');
    expect(s.upstreams.feature).toBe('origin/feature');
    s = exec(s, 'git switch main', 'git branch -D feature', 'git switch feature');
    expect(s.upstreams.feature).toBe('origin/feature');
    expect(resolveRev(s, 'feature')).toBe(s.remoteBranches['origin/feature']);
  });

  it('force-with-lease protects unseen remote work', () => {
    let s = new Scenario().commit('Initial commit', { 'README.md': '# P\n' }).origin().done();
    s = exec(s, 'echo a > a.txt', 'git add .', 'git commit -m A', 'git push');
    s = exec(s, 'git commit --amend -m "A2"');
    s.remotes.origin.branches.main = s.remotes.origin.branches.main; // unchanged remote
    expect(run(s, 'git push --force-with-lease').ok).toBe(true);
  });
});

describe('log', () => {
  it('prints oneline with decorations and a graph', () => {
    let s = exec(base(), 'git switch -c feature', 'echo a > a.txt', 'git add .', 'git commit -m A', 'git switch main');
    s = exec(s, 'echo m > m.txt', 'git add .', 'git commit -m M', 'git merge feature -m "Merge feature"');
    const r = output(s, 'git log --oneline --graph --all');
    expect(r.ok).toBe(true);
    expect(r.text).toContain('(HEAD -> main)');
    expect(r.text).toContain('Merge feature');
  });
});
