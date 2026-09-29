import type { Route } from '../hooks/useRoute';
import type { Location } from './bible';

export interface Nav {
  go: (route: Route) => void;
  openPassage: (loc: Location) => void;
  openSearch: (query?: string) => void;
}
