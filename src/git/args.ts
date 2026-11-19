// Shell-like tokenizer and a small getopt-style flag parser.
import { GitError } from './repo';

export type Op = '&&' | '||' | ';' | '>' | '>>' | '|';
export type Token = { kind: 'word'; value: string } | { kind: 'op'; value: Op };

export function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let cur = '';
  let started = false;
  const push = () => {
    if (started) tokens.push({ kind: 'word', value: cur });
    cur = '';
    started = false;
  };
  const op = (value: Op) => {
    push();
    tokens.push({ kind: 'op', value });
  };
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === '"' || ch === "'") {
      started = true;
      i++;
      while (i < line.length && line[i] !== ch) {
        if (ch === '"' && line[i] === '\\' && '"\\$`'.includes(line[i + 1] ?? '')) {
          cur += line[i + 1];
          i += 2;
          continue;
        }
        cur += line[i++];
      }
      if (i >= line.length) throw new GitError(`bash: unexpected EOF while looking for matching \`${ch}'`);
      i++;
    } else if (ch === '\\' && i + 1 < line.length) {
      cur += line[i + 1];
      started = true;
      i += 2;
    } else if (/\s/.test(ch)) {
      push();
      i++;
    } else if (ch === '&' && line[i + 1] === '&') {
      op('&&');
      i += 2;
    } else if (ch === '|') {
      if (line[i + 1] === '|') {
        op('||');
        i += 2;
      } else {
        op('|');
        i++;
      }
    } else if (ch === ';') {
      op(';');
      i++;
    } else if (ch === '>') {
      if (line[i + 1] === '>') {
        op('>>');
        i += 2;
      } else {
        op('>');
        i++;
      }
    } else {
      cur += ch;
      started = true;
      i++;
    }
  }
  push();
  return tokens;
}

export type FlagSpec = Record<string, 'bool' | 'value'>;

export class Args {
  pos: string[] = [];
  /** Arguments after a literal `--` (null when there was no `--`) */
  paths: string[] | null = null;
  private flags = new Map<string, string[]>();

  add(name: string, value: string) {
    const list = this.flags.get(name) ?? [];
    list.push(value);
    this.flags.set(name, list);
  }
  has(...names: string[]): boolean {
    return names.some((n) => this.flags.has(n));
  }
  value(...names: string[]): string | undefined {
    const all = this.values(...names);
    return all[all.length - 1];
  }
  values(...names: string[]): string[] {
    return names.flatMap((n) => this.flags.get(n) ?? []);
  }
}

export function unknownOption(name: string): GitError {
  return new GitError(`error: unknown option '${name.replace(/^-+/, '')}'`, 'unsupported', { option: name });
}

/**
 * Parses flags according to `spec`. Supports `--long`, `--long=value`,
 * `--long value`, `-s value`, `-svalue` and clusters like `-am "msg"`.
 * When `numeric` is set, `-5` is read as `-n 5` (git log).
 */
export function parseArgs(argv: string[], spec: FlagSpec, numeric = false): Args {
  const args = new Args();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') {
      args.paths = argv.slice(i + 1);
      break;
    }
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      const name = eq > 0 ? a.slice(0, eq) : a;
      const kind = spec[name];
      if (!kind) throw unknownOption(name);
      if (kind === 'value') {
        const val = eq > 0 ? a.slice(eq + 1) : argv[++i];
        if (val === undefined) throw new GitError(`error: option '${name.slice(2)}' requires a value`);
        args.add(name, val);
      } else args.add(name, '');
    } else if (a.startsWith('-') && a.length > 1) {
      if (numeric && /^-\d+$/.test(a)) {
        args.add('-n', a.slice(1));
        continue;
      }
      for (let k = 1; k < a.length; k++) {
        const name = '-' + a[k];
        const kind = spec[name];
        if (!kind) throw unknownOption(name);
        if (kind === 'value') {
          const val = a.slice(k + 1) || argv[++i];
          if (val === undefined) throw new GitError(`error: switch '${a[k]}' requires a value`);
          args.add(name, val);
          break;
        }
        args.add(name, '');
      }
    } else {
      args.pos.push(a);
    }
  }
  return args;
}
