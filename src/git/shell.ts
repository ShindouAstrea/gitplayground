// Tiny fake shell so files can be created/edited from the terminal.
import { normalizeContent } from './diff';
import { Ctx, GitError, has, REPO_PATH } from './repo';

const EDITORS = new Set(['nano', 'vim', 'vi', 'code', 'notepad', 'emacs', 'edit']);

export const SHELL_COMMANDS = ['help', 'clear', 'ls', 'cat', 'echo', 'touch', 'rm', 'mv', 'mkdir', 'pwd', 'cd', 'nano', 'code'];

function echoText(args: string[]): string {
  let interpret = false;
  let newline = true;
  while (args[0] === '-e' || args[0] === '-n') {
    if (args[0] === '-e') interpret = true;
    else newline = false;
    args = args.slice(1);
  }
  let text = args.join(' ');
  if (interpret) text = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  return newline ? text + '\n' : text;
}

/** Runs `cmd args > file` style redirections (echo/cat only) */
export function redirect(ctx: Ctx, words: string[], target: string, append: boolean) {
  const s = ctx.s;
  const [cmd, ...args] = words;
  let text: string;
  if (cmd === 'echo') text = echoText(args);
  else if (cmd === 'cat') {
    text = args
      .map((f) => {
        if (!has(s.workdir, f)) throw new GitError(`cat: ${f}: No such file or directory`);
        return s.workdir[f];
      })
      .join('');
  } else throw new GitError(`bash: output redirection is only supported for echo and cat in this simulator`);
  const path = target.replace(/^\.\//, '');
  const previous = append && has(s.workdir, path) ? normalizeContent(s.workdir[path]) : '';
  s.workdir[path] = normalizeContent(previous + text);
}

/** Returns false when the command is not a shell command */
export function shell(ctx: Ctx, words: string[]): boolean {
  const s = ctx.s;
  const [cmd, ...args] = words;
  const files = () => args.filter((a) => !a.startsWith('-')).map((a) => a.replace(/^\.\//, ''));
  switch (cmd) {
    case 'help':
      ctx.hint('shellHelp');
      return true;
    case 'clear':
    case 'cls':
      ctx.ui = { type: 'clear' };
      return true;
    case 'ls':
    case 'dir': {
      const names = Object.keys(s.workdir).sort();
      if (args.includes('-a') || args.includes('-la')) ctx.print(s.initialized ? '.git' : '');
      if (names.length) ctx.print(names.join('\n'));
      return true;
    }
    case 'cat':
    case 'type':
      for (const f of files()) {
        if (!has(s.workdir, f)) throw new GitError(`cat: ${f}: No such file or directory`);
        ctx.print(s.workdir[f].replace(/\n$/, ''));
      }
      return true;
    case 'echo':
      ctx.print(echoText(args).replace(/\n$/, ''));
      return true;
    case 'touch':
      for (const f of files()) if (!has(s.workdir, f)) s.workdir[f] = '';
      return true;
    case 'rm':
    case 'del': {
      const force = args.some((a) => /^-\w*f/.test(a));
      for (const f of files()) {
        const under = Object.keys(s.workdir).filter((p) => p === f || p.startsWith(f.replace(/\/$/, '') + '/'));
        if (!under.length && !force) throw new GitError(`rm: cannot remove '${f}': No such file or directory`);
        for (const p of under) delete s.workdir[p];
      }
      return true;
    }
    case 'mv': {
      const [src, dst] = files();
      if (!src || !dst) throw new GitError('mv: missing destination file operand');
      if (!has(s.workdir, src)) throw new GitError(`mv: cannot stat '${src}': No such file or directory`);
      s.workdir[dst] = s.workdir[src];
      delete s.workdir[src];
      return true;
    }
    case 'mkdir':
      return true;
    case 'pwd':
      ctx.print(REPO_PATH);
      return true;
    case 'cd':
      if (args[0] && args[0] !== '.' && args[0] !== '~') throw new GitError('cd: this simulator works inside a single folder');
      return true;
    case 'whoami':
      ctx.print('you');
      return true;
    default:
      if (cmd && EDITORS.has(cmd)) {
        const f = files()[0];
        if (!f) throw new GitError(`${cmd}: missing file name`);
        ctx.ui = { type: 'edit', path: f };
        return true;
      }
      return false;
  }
}
