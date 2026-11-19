// Shared shapes for the translatable learning content (guide + quiz).
// Every locale provides the same ids; only the human text changes.
//
// Text fields support a tiny markdown subset (see components/Markdown.tsx):
//   - blank line            -> new paragraph
//   - lines starting "- "   -> bullet list
//   - `inline code`
//   - **bold**

export type GuideCategory =
  | 'setup'
  | 'basics'
  | 'branching'
  | 'undo'
  | 'rewriting'
  | 'remotes'
  | 'stash'
  | 'inspection'
  | 'tags';

/** 1 = beginner, 2 = intermediate, 3 = advanced */
export type Level = 1 | 2 | 3;

export interface GuideExample {
  /** A real shell line, e.g. `git commit -m "Fix login"` */
  code: string;
  /** What the example does, in the locale's language */
  explanation: string;
}

export interface GuideCommand {
  /** Stable id shared across locales, e.g. "commit", "rebase-interactive" */
  id: string;
  /** Command as typed, e.g. "git commit" */
  command: string;
  category: GuideCategory;
  level: Level;
  /** One line, shown in lists and search results */
  summary: string;
  /** Longer explanation (mini markdown) */
  description: string;
  /** Generic forms, e.g. `git commit -m "<message>"` */
  syntax: string[];
  examples: GuideExample[];
  tips?: string[];
  /** Shown highlighted: destructive/history-rewriting caveats */
  warning?: string;
  /** Ids of other GuideCommand entries */
  related?: string[];
  /** Extra search terms in the locale's language (synonyms, problems it solves) */
  keywords?: string[];
}

export interface GuideRecipeStep {
  text: string;
  code?: string;
}

/** A "How do I...?" walkthrough for a concrete real-world problem */
export interface GuideRecipe {
  id: string;
  title: string;
  /** The situation the reader is in */
  problem: string;
  category: GuideCategory;
  level: Level;
  steps: GuideRecipeStep[];
  notes?: string[];
  /** Ids of GuideCommand entries */
  related?: string[];
  keywords?: string[];
}

/** Short conceptual explainer (what is a commit, HEAD, the staging area...) */
export interface GuideConcept {
  id: string;
  title: string;
  body: string;
  related?: string[];
  keywords?: string[];
}

/** Language-neutral quiz data (accepted answers are commands) */
export interface QuizItem {
  id: string;
  category: GuideCategory;
  level: Level;
  /**
   * Accepted answers. Comparison ignores repeated spaces and the quote style,
   * so `git commit -m "x"` and `git commit -m 'x'` match. Use the literal text
   * <any> where any single argument is acceptable, e.g. `git switch -c <any>`.
   */
  answers: string[];
  /** Optional guide command id to link to */
  guide?: string;
}

export interface QuizText {
  prompt: string;
  explanation: string;
}
