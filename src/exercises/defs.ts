// Exercise definitions: how each repository is prepared, what counts as done
// and a reference solution. Texts live in i18n/locales/<lang>/exercises.ts.
import { headId, treesEqual } from '../git/repo';
import { Scenario } from '../git/scenario';
import {
  ancestor,
  between,
  clean,
  fileAt,
  findByMessage,
  headTreeOf,
  isLinear,
  message,
  noMarkers,
  onBranch,
  remoteTip,
  settled,
  tipOf,
} from './checks';
import type { RepoState } from '../git/types';
import { defineExercise, type ExerciseDef } from './types';

const FEATURES = ['login', 'search', 'payments', 'profile', 'cart', 'invoices', 'reports', 'comments'] as const;
const PEOPLE = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe'] as const;
const PROJECTS = ['shop', 'blog', 'todo-app', 'weather', 'agenda'] as const;

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function projectFiles(name: string) {
  return {
    'README.md': `# ${name}\n\nSmall demo project.\n`,
    'src/app.js': "import { start } from './core.js';\n\nstart();\n",
    'src/core.js': "export function start() {\n  console.log('ready');\n}\n",
  };
}

const featureCode = (f: string, extra = '') => `export function ${f.replace(/-/g, '')}() {\n  return '${f}';${extra}\n}\n`;

// ---------------------------------------------------------------------------
// Level 1 — fundamentals
// ---------------------------------------------------------------------------

const firstCommit = defineExercise({
  id: 'first-commit',
  level: 1,
  guide: ['init', 'status', 'add', 'commit'],
  params: (rng) => {
    const file = rng.pick(['index.html', 'main.py', 'app.js']);
    return { project: rng.pick(PROJECTS), file };
  },
  setup: (p) =>
    new Scenario(false)
      .write({
        'README.md': `# ${p.project}\n`,
        [p.file]: p.file.endsWith('.html') ? '<h1>Hello</h1>\n' : p.file.endsWith('.py') ? "print('hello')\n" : "console.log('hello');\n",
      })
      .done(),
  goals: [
    { id: 'init', check: (s) => s.initialized },
    { id: 'commit', check: (s, p) => !!headTreeOf(s)['README.md'] && !!headTreeOf(s)[p.file] },
    { id: 'clean', check: (s) => s.initialized && !!headId(s) && clean(s) },
  ],
  solution: () => ['git init', 'git status', 'git add .', 'git commit -m "Initial commit"', 'git log'],
});

const stageSome = defineExercise({
  id: 'stage-some',
  level: 1,
  guide: ['status', 'add', 'commit', 'diff'],
  params: (rng) => ({ feature: rng.pick(FEATURES), project: rng.pick(PROJECTS) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles(p.project))
      .write({
        [`src/${p.feature}.js`]: featureCode(p.feature),
        'README.md': `# ${p.project}\n\nSmall demo project.\n\n## ${cap(p.feature)}\n`,
        'src/core.js': "export function start() {\n  console.log('ready');\n  console.log('DEBUG!!!');\n}\n",
      })
      .done(),
  goals: [
    {
      id: 'committed',
      check: (s, p, init) =>
        headId(s) !== headId(init) &&
        headTreeOf(s)[`src/${p.feature}.js`] !== undefined &&
        headTreeOf(s)['README.md'] === init.workdir['README.md'],
    },
    { id: 'notDebug', check: (s, _p, init) => headId(s) !== headId(init) && headTreeOf(s)['src/core.js'] === headTreeOf(init)['src/core.js'] },
    { id: 'kept', check: (s, _p, init) => headId(s) !== headId(init) && (s.workdir['src/core.js'] ?? '').includes('DEBUG') },
    { id: 'oneCommit', check: (s, _p, init) => s.commits[headId(s) ?? '']?.parents[0] === headId(init) },
  ],
  solution: (p) => ['git status', 'git diff', `git add README.md src/${p.feature}.js`, `git commit -m "Add ${p.feature}"`, 'git status'],
});

const amend = defineExercise({
  id: 'amend',
  level: 1,
  guide: ['commit-amend', 'add', 'log'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .commit(`Add ${p.feature} featrue`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .write({ [`tests/${p.feature}.test.js`]: `test('${p.feature}', () => {});\n` })
      .done(),
  goals: [
    { id: 'message', check: (s, p) => message(s, headId(s)) === `Add ${p.feature} feature` },
    { id: 'included', check: (s, p) => headTreeOf(s)[`tests/${p.feature}.test.js`] !== undefined },
    {
      id: 'replaced',
      check: (s, _p, init) =>
        headId(s) !== headId(init) && s.commits[headId(s) ?? '']?.parents[0] === init.commits[headId(init)!].parents[0],
    },
  ],
  solution: (p) => [`git add tests/${p.feature}.test.js`, `git commit --amend -m "Add ${p.feature} feature"`, 'git log --oneline'],
});

const discard = defineExercise({
  id: 'discard',
  level: 1,
  guide: ['restore', 'status', 'diff'],
  params: (rng) => ({ broken: rng.pick(['src/app.js', 'src/core.js']), project: rng.pick(PROJECTS) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', { ...projectFiles(p.project), 'config.json': '{\n  "port": 8080\n}\n' })
      .write({ [p.broken]: 'oops, I broke everything\n', 'config.json': '{\n  "port": 3000\n}\n' })
      .stage('config.json')
      .done(),
  goals: [
    { id: 'discarded', check: (s, p) => s.workdir[p.broken] === headTreeOf(s)[p.broken] },
    {
      id: 'unstaged',
      check: (s) => s.index['config.json'] === headTreeOf(s)['config.json'] && (s.workdir['config.json'] ?? '').includes('3000'),
    },
    { id: 'noCommit', check: (s, _p, init) => headId(s) === headId(init), constraint: true },
  ],
  solution: (p) => ['git status', `git restore ${p.broken}`, 'git restore --staged config.json', 'git status'],
});

const CULPRITS = ['Refactor core', 'Improve performance', 'Clean up code'] as const;

const findCommit = defineExercise({
  id: 'find-commit',
  level: 1,
  guide: ['log', 'show', 'tag'],
  params: (rng) => ({
    culprit: rng.pick(CULPRITS),
    needle: rng.pick(['debugger;', 'alert(1);']),
    tag: rng.pick(['bug-origin', 'culprit', 'found-it']),
  }),
  setup: (p) => {
    const sc = new Scenario().commit('Initial commit', projectFiles('shop'));
    let core = "export function start() {\n  console.log('ready');\n}\n";
    for (const msg of CULPRITS) {
      if (msg === p.culprit) core = core.replace("  console.log('ready');", `  console.log('ready');\n  ${p.needle}`);
      else core = core.replace('}\n', `  // ${msg.toLowerCase()}\n}\n`);
      sc.commit(msg, { 'src/core.js': core });
      if (msg === 'Improve performance') sc.commit('Update README', { 'README.md': '# shop\n\nNow faster.\n' });
    }
    return sc.commit('Add footer', { 'src/footer.js': 'export const footer = true;\n' }).done();
  },
  goals: [{ id: 'tagged', check: (s, p, init) => s.tags[p.tag]?.target === findByMessage(init, p.culprit) }],
  solution: (p, init) => ['git log --oneline', `git log -S "${p.needle}" --oneline`, `git show ${findByMessage(init, p.culprit)}`, `git tag ${p.tag} ${findByMessage(init, p.culprit)}`],
});

// ---------------------------------------------------------------------------
// Level 2 — branches & merges
// ---------------------------------------------------------------------------

const createBranch = defineExercise({
  id: 'create-branch',
  level: 2,
  guide: ['branch', 'switch', 'commit'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: () =>
    new Scenario().commit('Initial commit', projectFiles('shop')).commit('Add styles', { 'src/styles.css': 'body { margin: 0; }\n' }).done(),
  goals: [
    { id: 'exists', check: (s, p) => !!tipOf(s, `feature/${p.feature}`) },
    { id: 'onIt', check: (s, p) => onBranch(s, `feature/${p.feature}`) },
    { id: 'commit', check: (s, p) => between(s, tipOf(s, 'main'), tipOf(s, `feature/${p.feature}`)).length >= 1 },
    { id: 'mainSame', check: (s, _p, init) => tipOf(s, 'main') === tipOf(init, 'main'), constraint: true },
  ],
  solution: (p) => [
    `git switch -c feature/${p.feature}`,
    `echo "export const ${p.feature} = true;" > src/${p.feature}.js`,
    'git add .',
    `git commit -m "Start ${p.feature}"`,
    'git log --oneline --all',
  ],
});

const ffMerge = defineExercise({
  id: 'ff-merge',
  level: 2,
  guide: ['merge', 'switch', 'branch'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .git('switch', '-c', `feature/${p.feature}`)
      .commit(`Add ${p.feature} module`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .commit(`Test ${p.feature}`, { [`tests/${p.feature}.test.js`]: `test('${p.feature}', () => {});\n` })
      .done(),
  goals: [
    { id: 'onMain', check: (s) => onBranch(s, 'main') },
    { id: 'merged', check: (s, p, init) => tipOf(s, 'main') === tipOf(init, `feature/${p.feature}`) },
    { id: 'deleted', check: (s, p) => !tipOf(s, `feature/${p.feature}`) },
  ],
  solution: (p) => ['git switch main', `git merge feature/${p.feature}`, `git branch -d feature/${p.feature}`],
});

const mergeCommit = defineExercise({
  id: 'merge-commit',
  level: 2,
  guide: ['merge', 'log'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .git('switch', '-c', `feature/${p.feature}`)
      .commit(`Add ${p.feature} module`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .commit(`Add ${p.feature} styles`, { [`src/${p.feature}.css`]: `.${p.feature} { color: teal; }\n` })
      .switch('main')
      .commit('Hotfix: typo in README', { 'README.md': '# shop\n\nSmall demo project!\n' })
      .switch(`feature/${p.feature}`)
      .done(),
  goals: [
    { id: 'onMain', check: (s) => onBranch(s, 'main') },
    {
      id: 'mergeCommit',
      check: (s, p, init) => {
        const c = s.commits[tipOf(s, 'main') ?? ''];
        return !!c && c.parents.length === 2 && ancestor(s, tipOf(init, `feature/${p.feature}`), c.id);
      },
    },
    { id: 'both', check: (s, p) => !!fileAt(s, tipOf(s, 'main'), `src/${p.feature}.js`) && (fileAt(s, tipOf(s, 'main'), 'README.md') ?? '').includes('!') },
  ],
  solution: (p) => ['git switch main', `git merge feature/${p.feature}`, 'git log --oneline --graph'],
});

const mergedMain = (s: RepoState) => s.commits[tipOf(s, 'main') ?? '']?.parents.length === 2;

const mergeConflict = defineExercise({
  id: 'merge-conflict',
  level: 2,
  guide: ['merge', 'add', 'commit', 'status'],
  params: (rng) => {
    const a = rng.pick(PEOPLE.slice(1));
    let b = rng.pick(PEOPLE.slice(1));
    if (b === a) b = a === 'Elena' ? 'Felipe' : 'Elena';
    return { a, b };
  },
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', { 'TEAM.md': '# Team\n\n- Ana\n' })
      .git('switch', '-c', 'feature/team')
      .commit(`Add ${p.b} to the team`, { 'TEAM.md': `# Team\n\n- Ana\n- ${p.b}\n` })
      .switch('main')
      .commit(`Add ${p.a} to the team`, { 'TEAM.md': `# Team\n\n- Ana\n- ${p.a}\n` })
      .done(),
  goals: [
    { id: 'merged', check: mergedMain },
    { id: 'noMarkers', check: (s) => mergedMain(s) && noMarkers(fileAt(s, tipOf(s, 'main'), 'TEAM.md')) },
    {
      id: 'both',
      check: (s, p) => {
        const t = fileAt(s, tipOf(s, 'main'), 'TEAM.md') ?? '';
        return t.includes(`- ${p.a}`) && t.includes(`- ${p.b}`);
      },
    },
    { id: 'finished', check: (s) => mergedMain(s) && settled(s) && onBranch(s, 'main') },
  ],
  solution: (p) => [
    'git merge feature/team',
    'git status',
    `# edit TEAM.md: keep both names (${p.a} and ${p.b}) and delete the <<<<<<< ======= >>>>>>> lines`,
    `echo -e "# Team\\n\\n- Ana\\n- ${p.a}\\n- ${p.b}" > TEAM.md`,
    'git add TEAM.md',
    'git commit -m "Merge feature/team"',
  ],
});

const conflictSides = defineExercise({
  id: 'conflict-sides',
  level: 2,
  guide: ['merge', 'checkout', 'restore'],
  params: (rng) => ({ color: rng.pick(['teal', 'purple', 'orange']), port: rng.pick(['3000', '5000', '9090']) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', { 'config.json': '{\n  "port": 8080\n}\n', 'styles.css': 'h1 { color: black; }\n' })
      .git('switch', '-c', 'redesign')
      .commit('New look', { 'config.json': `{\n  "port": ${p.port}\n}\n`, 'styles.css': `h1 { color: ${p.color}; }\n` })
      .switch('main')
      .commit('Production settings', { 'config.json': '{\n  "port": 80\n}\n', 'styles.css': 'h1 { color: gray; }\n' })
      .done(),
  goals: [
    { id: 'merged', check: mergedMain },
    { id: 'ours', check: (s) => mergedMain(s) && fileAt(s, tipOf(s, 'main'), 'config.json') === '{\n  "port": 80\n}\n' },
    { id: 'theirs', check: (s, p) => fileAt(s, tipOf(s, 'main'), 'styles.css') === `h1 { color: ${p.color}; }\n` },
    { id: 'finished', check: (s) => mergedMain(s) && settled(s) },
  ],
  solution: () => [
    'git merge redesign',
    'git checkout --ours config.json',
    'git checkout --theirs styles.css',
    'git add config.json styles.css',
    'git commit --no-edit',
  ],
});

const detachedRescue = defineExercise({
  id: 'detached-rescue',
  level: 2,
  guide: ['switch', 'checkout', 'branch'],
  params: (rng) => ({ name: rng.pick(['experiment', 'new-layout', 'spike']) }),
  setup: () =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .commit('Add header', { 'src/header.js': 'export const header = 1;\n' })
      .commit('Add footer', { 'src/footer.js': 'export const footer = 1;\n' })
      .git('checkout', 'HEAD~1')
      .commit('Try new layout', { 'src/layout.css': '.grid { display: grid; }\n' })
      .commit('Polish layout', { 'src/layout.css': '.grid { display: grid; gap: 1rem; }\n' })
      .done(),
  goals: [
    { id: 'saved', check: (s, p, init) => tipOf(s, p.name) === headId(init) },
    { id: 'onMain', check: (s) => onBranch(s, 'main') },
  ],
  solution: (p) => ['git status', `git switch -c ${p.name}`, 'git switch main'],
});

// ---------------------------------------------------------------------------
// Level 3 — undo & rewrite
// ---------------------------------------------------------------------------

const undoCommit = defineExercise({
  id: 'undo-commit',
  level: 3,
  guide: ['reset', 'log', 'status'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .commit(`Add ${p.feature}`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .commit(`WIP ${p.feature} (broken)`, { [`src/${p.feature}.js`]: featureCode(p.feature, '\n  // TODO: half done') })
      .done(),
  goals: [
    { id: 'moved', check: (s, _p, init) => tipOf(s, 'main') === init.commits[tipOf(init, 'main')].parents[0] },
    {
      id: 'kept',
      check: (s, p, init) =>
        tipOf(s, 'main') !== tipOf(init, 'main') &&
        s.workdir[`src/${p.feature}.js`] === fileAt(init, tipOf(init, 'main'), `src/${p.feature}.js`),
    },
  ],
  solution: () => ['git log --oneline', 'git reset HEAD~1', 'git status'],
});

const priceFixed = (s: RepoState) => fileAt(s, tipOf(s, 'main'), 'src/price.js') === 'export const price = (n) => n * 1.19;\n';

const revertPushed = defineExercise({
  id: 'revert-pushed',
  level: 3,
  guide: ['revert', 'push', 'log'],
  params: (rng) => ({ feature: rng.pick(FEATURES), rate: rng.pick(['0.5', '2', '10']) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', { ...projectFiles('shop'), 'src/price.js': 'export const price = (n) => n * 1.19;\n' })
      .commit(`Add ${p.feature}`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .commit('Change price calculation', { 'src/price.js': `export const price = (n) => n * ${p.rate};\n` })
      .commit('Update docs', { 'README.md': '# shop\n\nPrices include VAT.\n' })
      .origin()
      .done(),
  goals: [
    { id: 'undone', check: priceFixed },
    {
      id: 'history',
      check: (s, _p, init) => priceFixed(s) && ancestor(s, tipOf(init, 'main'), tipOf(s, 'main')),
    },
    { id: 'pushed', check: (s) => priceFixed(s) && remoteTip(s, 'main') === tipOf(s, 'main') },
  ],
  solution: (_p, init) => ['git log --oneline', `git revert ${findByMessage(init, 'Change price calculation')} --no-edit`, 'git push'],
});

const reflogReset = defineExercise({
  id: 'reflog-reset',
  level: 3,
  guide: ['reflog', 'reset'],
  params: (rng) => ({ feature: rng.pick(FEATURES), n: rng.pick(['2', '3']) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .commit(`Add ${p.feature} model`, { [`src/${p.feature}/model.js`]: 'export const model = {};\n' })
      .commit(`Add ${p.feature} view`, { [`src/${p.feature}/view.js`]: 'export const view = {};\n' })
      .commit(`Add ${p.feature} tests`, { [`tests/${p.feature}.test.js`]: "test('ok', () => {});\n" })
      .git('reset', '--hard', `HEAD~${p.n}`)
      .done(),
  goals: [
    { id: 'recovered', check: (s, _p, init) => tipOf(s, 'main') === init.reflog[1].id },
    { id: 'files', check: (s, p) => s.workdir[`tests/${p.feature}.test.js`] !== undefined },
  ],
  solution: () => ['git reflog', 'git reset --hard HEAD@{1}', 'git log --oneline'],
});

const recoverBranch = defineExercise({
  id: 'recover-branch',
  level: 3,
  guide: ['reflog', 'branch'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .git('switch', '-c', `feature/${p.feature}`)
      .commit(`Start ${p.feature}`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .commit(`Finish ${p.feature}`, { [`src/${p.feature}.js`]: featureCode(p.feature, '\n  // done') })
      .switch('main')
      .git('branch', '-D', `feature/${p.feature}`)
      .done(),
  goals: [{ id: 'restored', check: (s, p, init) => tipOf(s, `feature/${p.feature}`) === findByMessage(init, `Finish ${p.feature}`) }],
  solution: (p, init) => ['git reflog', `git branch feature/${p.feature} ${findByMessage(init, `Finish ${p.feature}`)}`, 'git log --oneline --all'],
});

const cherryPickFix = defineExercise({
  id: 'cherry-pick-fix',
  level: 3,
  guide: ['cherry-pick', 'log', 'switch'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', { ...projectFiles('shop'), 'src/header.js': "export const title = 'Welcom';\n" })
      .git('switch', '-c', 'develop')
      .commit(`Experiment with ${p.feature}`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .commit('Fix typo in header', { 'src/header.js': "export const title = 'Welcome';\n" })
      .commit(`More ${p.feature} experiments`, { [`src/${p.feature}.js`]: featureCode(p.feature, '\n  // v2') })
      .switch('main')
      .done(),
  goals: [
    { id: 'hasFix', check: (s) => fileAt(s, tipOf(s, 'main'), 'src/header.js') === "export const title = 'Welcome';\n" },
    {
      id: 'noExperiments',
      check: (s, p, init) => tipOf(s, 'main') !== tipOf(init, 'main') && fileAt(s, tipOf(s, 'main'), `src/${p.feature}.js`) === undefined,
    },
    { id: 'developSame', check: (s, _p, init) => tipOf(s, 'develop') === tipOf(init, 'develop'), constraint: true },
  ],
  solution: (_p, init) => ['git log --oneline develop', `git cherry-pick ${findByMessage(init, 'Fix typo in header')}`],
});

const rebaseFeature = defineExercise({
  id: 'rebase-feature',
  level: 3,
  guide: ['rebase', 'log'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .git('switch', '-c', `feature/${p.feature}`)
      .commit(`Add ${p.feature} module`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .commit(`Add ${p.feature} tests`, { [`tests/${p.feature}.test.js`]: "test('ok', () => {});\n" })
      .switch('main')
      .commit('Add header', { 'src/header.js': 'export const header = 1;\n' })
      .commit('Add footer', { 'src/footer.js': 'export const footer = 1;\n' })
      .switch(`feature/${p.feature}`)
      .done(),
  goals: [
    { id: 'onTop', check: (s, p) => ancestor(s, tipOf(s, 'main'), tipOf(s, `feature/${p.feature}`)) },
    {
      id: 'linear',
      check: (s, p) => {
        const ids = between(s, tipOf(s, 'main'), tipOf(s, `feature/${p.feature}`));
        return ancestor(s, tipOf(s, 'main'), tipOf(s, `feature/${p.feature}`)) && ids.length === 2 && isLinear(s, ids);
      },
    },
    { id: 'mainSame', check: (s, _p, init) => tipOf(s, 'main') === tipOf(init, 'main'), constraint: true },
  ],
  solution: () => ['git log --oneline --graph --all', 'git rebase main', 'git log --oneline --graph --all'],
});

const CONFIG_BASE = 'export const config = {\n  timeout: 1000,\n  retries: 1,\n};\n';

const rebaseConflict = defineExercise({
  id: 'rebase-conflict',
  level: 3,
  guide: ['rebase', 'add', 'status'],
  params: (rng) => ({ timeout: rng.pick(['5000', '3000', '8000']), retries: rng.pick(['3', '5']) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', { ...projectFiles('shop'), 'src/config.js': CONFIG_BASE })
      .git('switch', '-c', 'feature/slow-network')
      .commit('Increase timeout', { 'src/config.js': CONFIG_BASE.replace('1000', p.timeout) })
      .switch('main')
      .commit('More retries', { 'src/config.js': CONFIG_BASE.replace('retries: 1', `retries: ${p.retries}`) })
      .switch('feature/slow-network')
      .done(),
  goals: [
    { id: 'onTop', check: (s) => ancestor(s, tipOf(s, 'main'), tipOf(s, 'feature/slow-network')) },
    {
      id: 'linear',
      check: (s) => {
        const ids = between(s, tipOf(s, 'main'), tipOf(s, 'feature/slow-network'));
        return ancestor(s, tipOf(s, 'main'), tipOf(s, 'feature/slow-network')) && ids.length === 1 && isLinear(s, ids);
      },
    },
    {
      id: 'both',
      check: (s, p) => {
        const t = fileAt(s, tipOf(s, 'feature/slow-network'), 'src/config.js');
        return noMarkers(t) && !!t && t.includes(`timeout: ${p.timeout}`) && t.includes(`retries: ${p.retries}`);
      },
    },
    {
      id: 'finished',
      check: (s) => ancestor(s, tipOf(s, 'main'), tipOf(s, 'feature/slow-network')) && settled(s) && onBranch(s, 'feature/slow-network'),
    },
  ],
  solution: (p) => [
    'git rebase main',
    'git status',
    `# edit src/config.js: keep timeout: ${p.timeout} AND retries: ${p.retries}, delete the markers`,
    `echo -e "export const config = {\\n  timeout: ${p.timeout},\\n  retries: ${p.retries},\\n};" > src/config.js`,
    'git add src/config.js',
    'git rebase --continue',
  ],
});

const squash = defineExercise({
  id: 'squash',
  level: 3,
  guide: ['rebase-interactive', 'reset', 'commit'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) => {
    const file = `src/${p.feature}.js`;
    return new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .git('switch', '-c', `feature/${p.feature}`)
      .commit('WIP', { [file]: featureCode(p.feature) })
      .commit('more work', { [file]: featureCode(p.feature, '\n  // validate') })
      .commit('fix typo', { [file]: featureCode(p.feature, '\n  // validated') })
      .commit('done!!', { [`tests/${p.feature}.test.js`]: "test('ok', () => {});\n" })
      .done();
  },
  goals: [
    { id: 'single', check: (s, p) => between(s, tipOf(s, 'main'), tipOf(s, `feature/${p.feature}`)).length === 1 },
    { id: 'message', check: (s, p) => message(s, tipOf(s, `feature/${p.feature}`)) === `Add ${p.feature}` },
    {
      id: 'content',
      check: (s, p, init) => {
        const now = s.commits[tipOf(s, `feature/${p.feature}`) ?? ''];
        return (
          !!now &&
          between(s, tipOf(s, 'main'), now.id).length === 1 &&
          treesEqual(now.tree, init.commits[tipOf(init, `feature/${p.feature}`)].tree)
        );
      },
    },
    { id: 'finished', check: (s, p) => between(s, tipOf(s, 'main'), tipOf(s, `feature/${p.feature}`)).length === 1 && settled(s) },
  ],
  solution: (p) => ['git log --oneline', 'git reset --soft main', `git commit -m "Add ${p.feature}"`, 'git log --oneline'],
});

const rebaseInteractive = defineExercise({
  id: 'rebase-interactive',
  level: 3,
  guide: ['rebase-interactive', 'log'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .git('switch', '-c', `feature/${p.feature}`)
      .commit(`Add ${p.feature} model`, { [`src/${p.feature}/model.js`]: 'export const model = {};\n' })
      .commit('Add debug logs', { 'debug.log': 'lots of noise\n' })
      .commit(`Add ${p.feature} veiw`, { [`src/${p.feature}/view.js`]: 'export const view = {};\n' })
      .done(),
  goals: [
    {
      id: 'dropped',
      check: (s, p) => {
        const ids = between(s, tipOf(s, 'main'), tipOf(s, `feature/${p.feature}`));
        return ids.length > 0 && !ids.some((id) => message(s, id) === 'Add debug logs') && fileAt(s, tipOf(s, `feature/${p.feature}`), 'debug.log') === undefined;
      },
    },
    {
      id: 'reworded',
      check: (s, p) => {
        const msgs = between(s, tipOf(s, 'main'), tipOf(s, `feature/${p.feature}`)).map((id) => message(s, id));
        return msgs.includes(`Add ${p.feature} view`) && !msgs.includes(`Add ${p.feature} veiw`);
      },
    },
    { id: 'count', check: (s, p) => between(s, tipOf(s, 'main'), tipOf(s, `feature/${p.feature}`)).length === 2 },
    {
      id: 'finished',
      check: (s, p) =>
        between(s, tipOf(s, 'main'), tipOf(s, `feature/${p.feature}`)).length === 2 && settled(s) && onBranch(s, `feature/${p.feature}`),
    },
  ],
  solution: (p) => [
    'git rebase -i main',
    '# in the todo list: change "Add debug logs" to drop',
    `# change "Add ${p.feature} veiw" to reword and write "Add ${p.feature} view"`,
  ],
});

const moveCommits = defineExercise({
  id: 'move-commits',
  level: 3,
  guide: ['branch', 'reset', 'switch'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .origin()
      .commit(`Add ${p.feature} form`, { [`src/${p.feature}/form.js`]: 'export const form = {};\n' })
      .commit(`Validate ${p.feature} form`, { [`src/${p.feature}/form.js`]: 'export const form = { valid: true };\n' })
      .done(),
  goals: [
    { id: 'branch', check: (s, p, init) => tipOf(s, `feature/${p.feature}`) === tipOf(init, 'main') },
    { id: 'mainBack', check: (s) => tipOf(s, 'main') === s.remoteBranches['origin/main'] },
    { id: 'onFeature', check: (s, p) => onBranch(s, `feature/${p.feature}`) && clean(s) },
  ],
  solution: (p) => [`git branch feature/${p.feature}`, 'git reset --hard origin/main', `git switch feature/${p.feature}`],
});

// ---------------------------------------------------------------------------
// Level 4 — remotes & teamwork
// ---------------------------------------------------------------------------

const firstPush = defineExercise({
  id: 'first-push',
  level: 4,
  guide: ['push', 'remote', 'branch'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .origin()
      .git('switch', '-c', `feature/${p.feature}`)
      .commit(`Add ${p.feature}`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .commit(`Test ${p.feature}`, { [`tests/${p.feature}.test.js`]: "test('ok', () => {});\n" })
      .done(),
  goals: [
    { id: 'pushed', check: (s, p) => !!remoteTip(s, `feature/${p.feature}`) && remoteTip(s, `feature/${p.feature}`) === tipOf(s, `feature/${p.feature}`) },
    { id: 'upstream', check: (s, p) => s.upstreams[`feature/${p.feature}`] === `origin/feature/${p.feature}` },
  ],
  solution: (p) => ['git remote -v', 'git push', `git push -u origin feature/${p.feature}`, 'git status'],
});

const pullRebase = defineExercise({
  id: 'pull-rebase',
  level: 4,
  guide: ['pull', 'push', 'fetch', 'rebase'],
  params: (rng) => ({ feature: rng.pick(FEATURES), mate: rng.pick(PEOPLE) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .origin()
      .remoteCommit('main', 'Add CI pipeline', { '.github/ci.yml': 'on: push\n' }, p.mate)
      .commit(`Add ${p.feature}`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .done(),
  goals: [
    { id: 'integrated', check: (s) => headTreeOf(s)['.github/ci.yml'] !== undefined },
    {
      id: 'linear',
      check: (s) => {
        const ids = between(s, null, tipOf(s, 'main'));
        return headTreeOf(s)['.github/ci.yml'] !== undefined && isLinear(s, ids.slice(1));
      },
    },
    { id: 'pushed', check: (s) => remoteTip(s, 'main') === tipOf(s, 'main') },
  ],
  solution: () => ['git push', 'git pull', 'git pull --rebase', 'git push', 'git log --oneline --graph'],
});

const hotfixDone = (s: RepoState, init: RepoState) =>
  tipOf(s, 'main') !== tipOf(init, 'main') && (fileAt(s, tipOf(s, 'main'), 'src/header.html') ?? '').includes('Welcome');

const stashHotfix = defineExercise({
  id: 'stash-hotfix',
  level: 4,
  guide: ['stash', 'switch', 'commit'],
  params: (rng) => ({ feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', { ...projectFiles('shop'), 'src/header.html': '<h1>Welcom</h1>\n' })
      .git('switch', '-c', `feature/${p.feature}`)
      .commit(`Start ${p.feature}`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .write({ [`src/${p.feature}.js`]: featureCode(p.feature, '\n  // work in progress...') })
      .done(),
  goals: [
    {
      id: 'fixed',
      check: (s, _p, init) => hotfixDone(s, init),
    },
    { id: 'back', check: (s, p, init) => hotfixDone(s, init) && onBranch(s, `feature/${p.feature}`) },
    { id: 'wip', check: (s, p, init) => hotfixDone(s, init) && s.workdir[`src/${p.feature}.js`] === init.workdir[`src/${p.feature}.js`] },
    { id: 'stashEmpty', check: (s, _p, init) => hotfixDone(s, init) && s.stash.length === 0 },
  ],
  solution: (p) => [
    'git stash',
    'git switch main',
    'echo "<h1>Welcome</h1>" > src/header.html',
    'git commit -am "Fix welcome typo"',
    `git switch feature/${p.feature}`,
    'git stash pop',
  ],
});

const tagRelease = defineExercise({
  id: 'tag-release',
  level: 4,
  guide: ['tag', 'push', 'log'],
  params: (rng) => ({ version: rng.pick(['1.0.0', '1.2.0', '2.0.0']), feature: rng.pick(FEATURES) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .commit(`Add ${p.feature}`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .commit(`Release ${p.version}`, { 'VERSION': `${p.version}\n` })
      .commit('Start next iteration', { 'NOTES.md': '# Next\n' })
      .origin()
      .done(),
  goals: [
    {
      id: 'tag',
      check: (s, p, init) => s.tags[`v${p.version}`]?.target === findByMessage(init, `Release ${p.version}`) && !!s.tags[`v${p.version}`]?.message,
    },
    { id: 'pushed', check: (s, p) => s.remotes.origin?.tags[`v${p.version}`]?.target === s.tags[`v${p.version}`]?.target && !!s.tags[`v${p.version}`] },
  ],
  solution: (p, init) => [
    'git log --oneline',
    `git tag -a v${p.version} ${findByMessage(init, `Release ${p.version}`)} -m "Version ${p.version}"`,
    `git push origin v${p.version}`,
  ],
});

const syncBeforePr = defineExercise({
  id: 'sync-before-pr',
  level: 4,
  guide: ['fetch', 'rebase', 'push'],
  params: (rng) => ({ feature: rng.pick(FEATURES), mate: rng.pick(PEOPLE) }),
  setup: (p) =>
    new Scenario()
      .commit('Initial commit', projectFiles('shop'))
      .git('switch', '-c', `feature/${p.feature}`)
      .commit(`Add ${p.feature}`, { [`src/${p.feature}.js`]: featureCode(p.feature) })
      .commit(`Style ${p.feature}`, { [`src/${p.feature}.css`]: '.x { color: red; }\n' })
      .origin()
      .remoteCommit('main', 'Upgrade dependencies', { 'package.json': '{ "version": "2.0.0" }\n' }, p.mate)
      .remoteCommit('main', 'Add linter', { '.eslintrc': '{}\n' }, p.mate)
      .done(),
  goals: [
    { id: 'based', check: (s, p) => ancestor(s, remoteTip(s, 'main'), tipOf(s, `feature/${p.feature}`)) },
    {
      id: 'linear',
      check: (s, p) => {
        const ids = between(s, remoteTip(s, 'main'), tipOf(s, `feature/${p.feature}`));
        return ancestor(s, remoteTip(s, 'main'), tipOf(s, `feature/${p.feature}`)) && ids.length === 2 && isLinear(s, ids);
      },
    },
    {
      id: 'pushed',
      check: (s, p) =>
        ancestor(s, remoteTip(s, 'main'), tipOf(s, `feature/${p.feature}`)) &&
        remoteTip(s, `feature/${p.feature}`) === tipOf(s, `feature/${p.feature}`),
    },
  ],
  solution: () => ['git fetch', 'git log --oneline --graph --all', 'git rebase origin/main', 'git push', 'git push --force-with-lease'],
});

export const exercises: ExerciseDef[] = [
  firstCommit,
  stageSome,
  amend,
  discard,
  findCommit,
  createBranch,
  ffMerge,
  mergeCommit,
  mergeConflict,
  conflictSides,
  detachedRescue,
  undoCommit,
  revertPushed,
  reflogReset,
  recoverBranch,
  cherryPickFix,
  rebaseFeature,
  rebaseConflict,
  squash,
  rebaseInteractive,
  moveCommits,
  firstPush,
  pullRebase,
  stashHotfix,
  tagRelease,
  syncBeforePr,
];

export const exerciseById = (id: string) => exercises.find((e) => e.id === id);
