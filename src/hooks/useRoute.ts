import { useCallback, useEffect, useState } from 'react';
import type { BookId } from '../types/bible';

export type StudyTab = 'highlights' | 'notes' | 'bookmarks';

export type Route =
  | { view: 'home' }
  | { view: 'bible'; book?: BookId; chapter?: number; verse?: number; planId?: string; planDay?: number }
  | { view: 'plans'; planId?: string; day?: number }
  | { view: 'study'; tab?: StudyTab }
  | { view: 'progress' };

export type View = Route['view'];

const toInt = (s?: string) => {
  const n = Number(s);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

function safeDecode(part: string): string {
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

export function parseHash(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const parts = path.split('/').filter(Boolean).map(safeDecode);
  const params = new URLSearchParams(query);
  switch (parts[0]) {
    case 'bible':
      return {
        view: 'bible',
        book: parts[1]?.toUpperCase(),
        chapter: toInt(parts[2]),
        verse: toInt(parts[3]),
        planId: params.get('plan') ?? undefined,
        planDay: toInt(params.get('day') ?? undefined),
      };
    case 'plans':
      return { view: 'plans', planId: parts[1], day: toInt(parts[2]) };
    case 'study': {
      const tab = parts[1];
      return { view: 'study', tab: tab === 'notes' || tab === 'bookmarks' || tab === 'highlights' ? tab : undefined };
    }
    case 'progress':
      return { view: 'progress' };
    default:
      return { view: 'home' };
  }
}

export function routeToHash(route: Route): string {
  switch (route.view) {
    case 'bible': {
      const path = '#/' + ['bible', route.book, route.chapter, route.verse].filter((p) => p !== undefined).join('/');
      return route.planId && route.planDay ? `${path}?plan=${encodeURIComponent(route.planId)}&day=${route.planDay}` : path;
    }
    case 'plans':
      return '#/' + ['plans', route.planId, route.day].filter((p) => p !== undefined).join('/');
    case 'study':
      return route.tab ? `#/study/${route.tab}` : '#/study';
    case 'progress':
      return '#/progress';
    default:
      return '#/';
  }
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next: Route, options?: { replace?: boolean }) => {
    const hash = routeToHash(next);
    if (options?.replace) {
      window.history.replaceState(null, '', hash);
      setRoute(parseHash(hash));
    } else if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(parseHash(hash));
    }
  }, []);

  return { route, navigate };
}
