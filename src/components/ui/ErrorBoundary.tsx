import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[error-boundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[60vh] grid place-items-center px-6">
          <div className="max-w-md text-center space-y-4">
            <div className="mx-auto h-12 w-12 grid place-items-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <h1 className="font-display text-2xl">Something broke.</h1>
            <p className="text-sm text-muted-foreground">
              The page hit an unexpected error. Refresh, or head back to safety.
            </p>
            {import.meta.env.DEV && (
              <pre className="text-left text-[11px] font-mono text-red-400 bg-red-500/5 border border-red-500/20 rounded p-3 overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" onClick={this.handleReset}>Try again</Button>
              <Button asChild size="sm" variant="outline"><Link to="/">Home</Link></Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
