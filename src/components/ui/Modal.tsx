import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import { btn } from './styles';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 'sheet' slides up from the bottom on phones, which is easier to reach with a thumb. */
  size?: 'small' | 'large';
}

/**
 * Built on the native <dialog> element, which gives focus trapping, Escape to close,
 * and correct screen reader behaviour for free.
 */
export function Modal({ open, onClose, title, children, size = 'small' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the dimmed backdrop closes the dialog.
        if (e.target === ref.current) onClose();
      }}
      className={`modal ${size === 'large' ? 'modal-large' : ''}`}
    >
      {open && (
        <div className="flex max-h-[inherit] flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
            <h2 id={titleId} className="font-serif text-xl font-semibold text-ink">
              {title}
            </h2>
            <button type="button" className={btn.icon} onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          </header>
          <div className="overflow-y-auto px-5 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
