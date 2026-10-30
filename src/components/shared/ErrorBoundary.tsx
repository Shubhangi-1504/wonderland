import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Short label used in the fallback, e.g. "Chat". */
  label?: string;
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

    const label = this.props.label ?? "This panel";
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
