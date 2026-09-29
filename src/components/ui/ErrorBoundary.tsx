import { Component, type ErrorInfo, type ReactNode } from 'react';
import { btn } from './styles';

interface Props {
  children: ReactNode;
  /** Changing this value clears the error, for example when the user navigates elsewhere. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/** Stops a problem in one section from taking down the whole page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Section crashed:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-xl py-16 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">This section could not be shown</h2>
        <p className="mt-3 text-lg text-muted">
          Your highlights, notes and progress are safe. Try again, or go back to the home page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className={btn.primary} onClick={() => this.setState({ error: null })}>
            Try again
          </button>
          <a className={btn.secondary} href="#/">
            Go to home
          </a>
        </div>
      </div>
    );
  }
}
