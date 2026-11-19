// Compares a typed command with the accepted answers of a quiz item.
// Uses the simulator's tokenizer, so quoting style and extra spaces don't matter.
import { tokenize } from '../git/args';

function words(line: string): string[] | null {
  try {
    const tokens = tokenize(line.trim().replace(/^\$\s*/, '')).map((t) => t.value);
    return tokens.length ? tokens : null;
  } catch {
    return null;
  }
}

// `<any>` would be read as a redirection by the tokenizer, so swap it for a sentinel first
const ANY = '\u0000any\u0000';

export function matchesAnswer(input: string, answers: string[]): boolean {
  const typed = words(input);
  if (!typed) return false;
  return answers.some((answer) => {
    const expected = words(answer.replace(/<any>/g, ANY));
    return !!expected && expected.length === typed.length && expected.every((w, i) => w === ANY || w === typed[i]);
  });
}
