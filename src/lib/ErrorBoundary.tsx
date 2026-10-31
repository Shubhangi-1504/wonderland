import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Catches React render/lifecycle errors anywhere in the child tree and renders
 * a readable message instead of a blank/white screen. Placed at the app root
 * so the whole app is covered.
 *
 * Note: an error boundary does NOT catch:
 *   - event handlers (onClick, onSubmit, etc.)
 *   - async code (timeouts, fetch, promises)
 *   - server-side rendering
 *   - errors thrown in the boundary component itself
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console / crash reporting service. In production you'd send to
    // your own observability tool (Sentry, LogRocket, etc.) here.
    console.error("[moneyverse ErrorBoundary]", error, errorInfo);
  }

  private reset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const message = this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-navy text-white p-6">
          <div className="max-w-md rounded-xl border border-red-500/40 bg-navy/80 p-6 text-left">
            <h1 className="text-lg font-bold tracking-wide text-red-300">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              MONEYVERSE hit an unexpected error. It was reported to the
              development team. Check the console for details, then reload.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-3 max-h-40 overflow-auto rounded-md bg-black/60 p-3 text-xs text-red-200">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.reset}
              className="mt-4 rounded-md bg-purple px-4 py-2 text-sm font-semibold text-white hover:bg-purple/80"
            >
              Try again
            </button>
          </div>
        </div>
      );
      return message;
    }
    return this.props.children;
  }
}
