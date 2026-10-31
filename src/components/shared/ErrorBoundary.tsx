import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Short label used in the fallback, e.g. "Chat". */
  label?: string;
  /** If true, renders a full-screen recovery screen with a reload button. */
  fullScreen?: boolean;
}

interface State {
  hasError: boolean;
}

/**
 * Contains a render crash so it never takes down the 3D app around it.
 * Wrap feature panels: `<ErrorBoundary label="Chat"><ChatPanel /></ErrorBoundary>`.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log the error type only; never render internals to the user.
    console.error("[moneyverse] UI error contained:", error.name, info.componentStack);
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    const label = this.props.label ?? (this.props.fullScreen ? "MONEYVERSE" : "This panel");

    if (this.props.fullScreen) {
      return (
        <div
          role="alert"
          className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-navy px-6 text-center text-white"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-2xl font-bold text-gold">
            !
          </div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-slate-300">
            {label} hit an unexpected snag. Your simulated session is preserved. Reload to continue.
          </p>
          <button
            type="button"
            onClick={() => {
              this.reset();
              if (typeof window !== "undefined") window.location.reload();
            }}
            className="mt-2 rounded-xl bg-gradient-to-r from-purple to-cyan px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple/20 transition-all hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            Reload application
          </button>
        </div>
      );
    }

    return (
      <div
        role="alert"
        className="flex h-[min(70vh,540px)] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-midnight/95 p-6 text-center"
      >
        <p className="font-display text-sm font-semibold text-white">{label} hit a snag</p>
        <p className="max-w-[260px] text-xs text-slate-400">
          The rest of MONEYVERSE keeps working. You can try reopening it.
        </p>
        <button
          type="button"
          onClick={this.reset}
          className="rounded-xl bg-gradient-to-br from-purple to-cyan px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          Try again
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
