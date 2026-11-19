// Fluent builder used by exercises (and tests) to prepare a repository.
import { allPaths, normalizeContent } from './diff';
import { runArgv } from './engine';
import { createCommit, createState } from './repo';
import type { RepoState } from './types';

export type Files = Record<string, string | null>;

export const DEFAULT_REMOTE_URL = 'https://github.com/you/project.git';

export class Scenario {
  s: RepoState;

  constructor(initialized = true) {
    this.s = createState(initialized);
  }

  /** Runs a command given as separate words; throws if git fails */
  git(...words: string[]): this {
    const r = runArgv(this.s, ['git', ...words]);
    if (!r.ok) {
      throw new Error(`Scenario step failed: git ${words.join(' ')}\n${r.lines.map((l) => l.text ?? '').join('\n')}`);
    }
    this.s = r.state;
    return this;
  }

  /** Writes (or deletes with null) files in the working directory only */
  write(files: Files): this {
    for (const [p, content] of Object.entries(files)) {
      if (content === null) delete this.s.workdir[p];
      else this.s.workdir[p] = normalizeContent(content);
    }
    return this;
  }

  /** Writes files, stages everything and commits */
  commit(message: string, files: Files = {}, author?: string): this {
    this.write(files);
    for (const p of allPaths(this.s.workdir, this.s.index)) {
      if (this.s.workdir[p] === undefined) delete this.s.index[p];
      else this.s.index[p] = this.s.workdir[p];
    }
    const previous = this.s.config['user.name'];
    if (author) this.s.config['user.name'] = author;
    this.git('commit', '-q', '--allow-empty', '-m', message);
    this.s.config['user.name'] = previous;
    return this;
  }

  stage(...paths: string[]): this {
    return this.git('add', ...paths);
  }

  branch(name: string, start?: string): this {
    return start ? this.git('branch', name, start) : this.git('branch', name);
  }

  switch(name: string): this {
    const r = runArgv(this.s, ['git', 'switch', '-q', name]);
    if (!r.ok) throw new Error(`Scenario switch failed: ${name}`);
    this.s = r.state;
    return this;
  }

  /** Like a clone: creates `origin` with all local branches and sets upstreams */
  origin(url = DEFAULT_REMOTE_URL, branches?: string[]): this {
    const s = this.s;
    const names = branches ?? Object.keys(s.branches);
    s.remotes.origin = {
      url,
      commits: structuredClone(s.commits),
      branches: Object.fromEntries(names.map((b) => [b, s.branches[b]])),
      tags: {},
    };
    for (const b of names) {
      s.remoteBranches[`origin/${b}`] = s.branches[b];
      s.upstreams[b] = `origin/${b}`;
    }
    return this;
  }

  /** A commit that only exists on the remote (someone else pushed it) */
  remoteCommit(branch: string, message: string, files: Files, author = 'Ana'): this {
    const s = this.s;
    const r = s.remotes.origin;
    const tip = r.branches[branch];
    const tree = { ...(tip ? r.commits[tip].tree : {}) };
    for (const [p, content] of Object.entries(files)) {
      if (content === null) delete tree[p];
      else tree[p] = normalizeContent(content);
    }
    r.branches[branch] = createCommit(s, tip ? [tip] : [], message, tree, author, r.commits);
    return this;
  }

  /** Forget the setup's reflog so `git reflog` only shows the learner's moves */
  clearReflog(): this {
    this.s.reflog = this.s.reflog.slice(0, 1);
    return this;
  }

  done(): RepoState {
    return this.s;
  }
}
