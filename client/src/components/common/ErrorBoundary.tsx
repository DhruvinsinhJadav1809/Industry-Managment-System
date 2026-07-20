import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorPage from "../../pages/ErrorPage";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time crashes anywhere below it in the tree and shows the
 * themed global error page instead of a blank screen.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Swap for real error-reporting (Sentry, etc.) when available.
    console.error("Unhandled UI error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorPage onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}
