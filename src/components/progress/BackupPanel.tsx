import { useRef } from 'react';
import { Icon } from '../ui/Icon';
import { btn, heading } from '../ui/styles';
import { useToast } from '../ui/Toast';
import { useStore } from '../../store/AppStore';
import { parseBackup } from '../../services/storage';

/** Everything is stored in this browser only, so offer a simple way to move it or keep a copy. */
export function BackupPanel() {
  const { data, actions } = useStore();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lamp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const next = parseBackup(await file.text());
      if (window.confirm('Replace everything in this browser with the backup?')) {
        actions.replaceAll(next);
        toast('Backup restored');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'That file could not be read');
    }
  };

  return (
    <section aria-labelledby="backup" className="mt-14 border-t border-line pt-8">
      <h2 id="backup" className={heading.section}>
        Your data
      </h2>
      <p className="mt-2 text-lg text-muted">
        Your highlights, notes and progress are saved in this browser only. Save a backup to move them to another device or keep
        them safe.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={btn.secondary} onClick={exportData}>
          <Icon name="download" /> Save a backup
        </button>
        <button type="button" className={btn.secondary} onClick={() => fileRef.current?.click()}>
          <Icon name="upload" /> Restore a backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importData(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          className={btn.quiet}
          onClick={() => {
            if (window.confirm('Delete all highlights, notes, bookmarks and progress from this browser? This cannot be undone.')) {
              actions.resetAll();
              toast('All reading data deleted');
            }
          }}
        >
          Delete all data
        </button>
      </div>
    </section>
  );
}
