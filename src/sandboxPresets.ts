// Starting points for the free sandbox.
import { Scenario } from './git/scenario';
import type { RepoState } from './git/types';

export type PresetId = 'empty' | 'history' | 'branches' | 'remote';

const app = (n: number) => `function main() {\n  console.log('version ${n}');\n}\n\nmain();\n`;

export const PRESETS: Record<PresetId, () => RepoState> = {
  empty: () => new Scenario(false).write({ 'README.md': '# My project\n' }).done(),

  history: () =>
    new Scenario()
      .commit('Initial commit', { 'README.md': '# My project\n', 'app.js': app(1) })
      .commit('Add styles', { 'styles.css': 'body { font-family: sans-serif; }\n' })
      .commit('Bump version', { 'app.js': app(2) })
      .git('switch', '-c', 'feature/login')
      .commit('Add login form', { 'login.html': '<form>\n  <input name="user">\n</form>\n' })
      .commit('Validate login', { 'login.js': 'export const valid = (u) => !!u;\n' })
      .switch('main')
      .done(),

  branches: () =>
    new Scenario()
      .commit('Initial commit', { 'README.md': '# My project\n', 'app.js': app(1) })
      .git('switch', '-c', 'feature')
      .commit('Feature: change greeting', { 'app.js': app(1).replace('version 1', 'hello from feature') })
      .commit('Feature: add docs', { 'docs.md': '# Docs\n' })
      .switch('main')
      .commit('Main: change greeting', { 'app.js': app(1).replace('version 1', 'hello from main') })
      .commit('Main: add license', { LICENSE: 'MIT\n' })
      .done(),

  remote: () =>
    new Scenario()
      .commit('Initial commit', { 'README.md': '# My project\n', 'app.js': app(1) })
      .commit('Add styles', { 'styles.css': 'body { font-family: sans-serif; }\n' })
      .origin()
      .remoteCommit('main', 'Add CI', { '.github/ci.yml': 'on: push\n' }, 'Ana')
      .commit('Bump version', { 'app.js': app(2) })
      .done(),
};
