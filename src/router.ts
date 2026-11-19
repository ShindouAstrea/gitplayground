// Minimal hash router: #/practice/merge-conflict?v=3
import { useSyncExternalStore } from 'react';

export interface Route {
  parts: string[];
  query: URLSearchParams;
}

function parse(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(qs) };
}

let current = parse();
window.addEventListener('hashchange', () => {
  current = parse();
  window.scrollTo(0, 0);
});

export function useRoute(): Route {
  return useSyncExternalStore(
    (l) => {
      window.addEventListener('hashchange', l);
      return () => window.removeEventListener('hashchange', l);
    },
    () => current,
  );
}

export function navigate(path: string) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}
