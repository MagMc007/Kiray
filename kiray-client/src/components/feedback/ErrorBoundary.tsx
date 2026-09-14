'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Kiray application:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('kiray_user');
        window.localStorage.removeItem('kiray_favorites');
        window.localStorage.removeItem('kiray_active_view');
      }
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-stone-200 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-2xl text-slate-900">
                Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Kiray encountered an unexpected issue while loading this page. You can try refreshing
                or resetting your session.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] font-mono text-stone-600 text-left overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-stone-300 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset &amp; Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
