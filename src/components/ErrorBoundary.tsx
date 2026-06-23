import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full flex flex-col items-center text-center gap-6 border border-red-500/30 bg-red-500/5">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black text-white font-display">System Error</h2>
              <p className="text-slate-400 text-sm">
                AURA encountered an unexpected error. This usually happens when the backend server is unreachable.
              </p>
            </div>
            
            <div className="bg-black/40 p-4 rounded-xl w-full text-left overflow-x-auto border border-white/5">
              <code className="text-xs text-red-400 font-mono">
                {this.state.error?.message || 'Unknown Error'}
              </code>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
            >
              <RefreshCcw className="w-4 h-4" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
