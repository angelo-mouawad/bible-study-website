import type { IconName } from '../ui/Icon';
import type { View } from '../../hooks/useRoute';

export const NAV_ITEMS: { view: View; label: string; icon: IconName }[] = [
  { view: 'home', label: 'Home', icon: 'home' },
  { view: 'bible', label: 'Bible', icon: 'book' },
  { view: 'plans', label: 'Plans', icon: 'plan' },
  { view: 'study', label: 'Study', icon: 'study' },
  { view: 'progress', label: 'Progress', icon: 'progress' },
];
