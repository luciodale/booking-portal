import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
};

type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    // Structured log so the failure shows in Workers Logs even if no
    // upstream consumer subscribes.
    console.error(
      JSON.stringify({
        level: "error",
        source: "react-error-boundary",
        message: error.message,
        metadata: { componentStack: info.componentStack },
      })
    );
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
          <p>Something went wrong rendering this view.</p>
          <button
            type="button"
            className="text-primary underline"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
