import { Modal } from '../ui/Modal';
import { Icon, type IconName } from '../ui/Icon';
import { useStore } from '../../store/AppStore';
import { TRANSLATIONS } from '../../data/translations';
import type { ReadingWidth, Theme } from '../../types/storage';

const THEMES: { id: Theme; label: string; icon: IconName }[] = [
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'contrast', label: 'High contrast', icon: 'contrast' },
];

const WIDTHS: { id: ReadingWidth; label: string }[] = [
  { id: 'narrow', label: 'Narrow' },
  { id: 'medium', label: 'Medium' },
  { id: 'wide', label: 'Wide' },
];

const option = (active: boolean) =>
  `flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border px-3 font-bold transition-all ${
    active ? 'border-cocoa bg-cocoa text-paper' : 'border-line bg-surface text-ink hover:border-sand hover:bg-accent-soft'
  }`;

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, actions } = useStore();
  const prefs = data.preferences;

  return (
    <Modal open={open} onClose={onClose} title="Reading settings">
      <div className="space-y-7">
        <fieldset>
          <legend className="mb-2 font-display text-lg font-semibold">Text size</legend>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={option(false)}
              onClick={() => actions.setPreferences({ fontSize: Math.max(14, prefs.fontSize - 2) })}
              disabled={prefs.fontSize <= 14}
              aria-label="Make text smaller"
            >
              <span className="font-display text-lg">A</span> Smaller
            </button>
            <output className="w-14 text-center text-lg font-bold" aria-live="polite">
              {prefs.fontSize}
            </output>
            <button
              type="button"
              className={option(false)}
              onClick={() => actions.setPreferences({ fontSize: Math.min(34, prefs.fontSize + 2) })}
              disabled={prefs.fontSize >= 34}
              aria-label="Make text larger"
            >
              <span className="font-display text-2xl">A</span> Larger
            </button>
          </div>
          <p className="scripture mt-4 rounded-2xl bg-accent-soft/60 p-4 text-ink" style={{ fontSize: prefs.fontSize }}>
            Thy word is a lamp unto my feet, and a light unto my path.
          </p>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-display text-lg font-semibold">Colours</legend>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={prefs.theme === t.id}
                className={option(prefs.theme === t.id)}
                onClick={() => actions.setPreferences({ theme: t.id })}
              >
                <Icon name={t.icon} /> {t.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-display text-lg font-semibold">Reading width</legend>
          <div className="flex gap-2">
            {WIDTHS.map((w) => (
              <button
                key={w.id}
                type="button"
                aria-pressed={prefs.width === w.id}
                className={option(prefs.width === w.id)}
                onClick={() => actions.setPreferences({ width: w.id })}
              >
                {w.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 text-lg font-bold">
          Show verse numbers
          <input
            type="checkbox"
            className="h-6 w-6 accent-[var(--accent)]"
            checked={prefs.showVerseNumbers}
            onChange={(e) => actions.setPreferences({ showVerseNumbers: e.target.checked })}
          />
        </label>

        <div>
          <label htmlFor="translation" className="mb-2 block text-lg font-bold">
            Translation
          </label>
          <select
            id="translation"
            className="min-h-12 w-full rounded-full border border-line bg-surface px-4 text-lg text-ink"
            value={prefs.translation}
            onChange={(e) => actions.setPreferences({ translation: e.target.value })}
          >
            {TRANSLATIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.abbreviation})
              </option>
            ))}
          </select>
          {TRANSLATIONS.length === 1 && (
            <p className="mt-2 text-base text-muted">The King James Version is in the public domain. More translations can be added later.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
