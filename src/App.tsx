import { useCallback, useEffect, useState } from 'react';
import { AppStoreProvider, useStore } from './store/AppStore';
import { BibleProvider } from './store/BibleProvider';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { SettingsDialog } from './components/layout/SettingsDialog';
import { SearchDialog } from './components/search/SearchDialog';
import { HomeView } from './components/home/HomeView';
import { ReaderView } from './components/reader/ReaderView';
import { PlansView } from './components/plans/PlansView';
import { StudyView } from './components/study/StudyView';
import { ProgressView } from './components/progress/ProgressView';
import { useRoute, routeToHash, type Route, type View } from './hooks/useRoute';
import type { Nav } from './types/nav';

export default function App() {
  return (
    <AppStoreProvider>
      <BibleProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </BibleProvider>
    </AppStoreProvider>
  );
}

function Shell() {
  const { route, navigate } = useRoute();
  const { data, recovered, canSave } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const theme = data.preferences.theme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const color = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, [theme]);

  const go = useCallback(
    (next: Route) => {
      setNoticeDismissed(true);
      navigate(next);
      window.scrollTo({ top: 0 });
    },
    [navigate],
  );

  const nav: Nav = {
    go,
    openPassage: (loc) => go({ view: 'bible', book: loc.book, chapter: loc.chapter, verse: loc.verse }),
    openSearch: (query = '') => {
      setSearchQuery(query);
      setSearchOpen(true);
    },
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key !== '/' || e.metaKey || e.ctrlKey || target.closest('input, textarea, select, [contenteditable]')) return;
      e.preventDefault();
      setSearchQuery('');
      setSearchOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const goToView = (view: View) => {
    if (view === 'bible') {
      const last = data.lastLocation;
      go(last ? { view: 'bible', book: last.book, chapter: last.chapter } : { view: 'bible' });
    } else go({ view } as Route);
  };

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:font-bold focus:text-accent-ink"
      >
        Skip to content
      </a>
      <Header
        current={route.view}
        onNavigate={goToView}
        onSearch={() => nav.openSearch()}
        onSettings={() => setSettingsOpen(true)}
        notice={
          !canSave
            ? 'Your browser is not letting Lamp save. Highlights and progress will be lost when you close this page.'
            : recovered && !noticeDismissed
              ? 'Your saved reading data could not be read, so Lamp started fresh. A copy of the old data was kept in this browser.'
              : undefined
        }
      />

      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 pb-36 pt-6 outline-none sm:px-6 md:pb-20">
        <ErrorBoundary resetKey={routeToHash(route)}>
          {route.view === 'home' && <HomeView nav={nav} />}
          {route.view === 'bible' && <ReaderView route={route} nav={nav} onOpenSettings={() => setSettingsOpen(true)} />}
          {route.view === 'plans' && <PlansView planId={route.planId} day={route.day} nav={nav} />}
          {route.view === 'study' && <StudyView tab={route.tab ?? 'highlights'} nav={nav} />}
          {route.view === 'progress' && <ProgressView nav={nav} />}
        </ErrorBoundary>
      </main>

      <BottomNav current={route.view} onNavigate={goToView} />
      <SearchDialog open={searchOpen} initialQuery={searchQuery} onClose={() => setSearchOpen(false)} nav={nav} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
