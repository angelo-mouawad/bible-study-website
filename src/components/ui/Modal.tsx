import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import { btn } from './styles';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'small' | 'large';
}

export function Modal({ open, onClose, title, children, size = 'small' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`modal ${size === 'large' ? 'modal-large' : ''}`}
    >
      {open && (
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
            <h2 id={titleId} className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
              {title}
            </h2>
            <button type="button" className={btn.icon} onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
