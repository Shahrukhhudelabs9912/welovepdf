"use client";

import { Component, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error.message);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorBoundaryFallback
          errorMessage={this.state.error?.message}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorBoundaryFallback({
  errorMessage,
  onReset,
}: {
  errorMessage?: string;
  onReset: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex min-h-[400px] items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("common.error_something_wrong")}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("common.error_unexpected")}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500 font-mono break-all">
          {errorMessage || t("common.error_unknown")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.error_reload")}
          </Button>
          <Button onClick={onReset} className="gap-2">
            {t("common.try_again")}
          </Button>
        </div>
      </div>
    </div>
  );
}