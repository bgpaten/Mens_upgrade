import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center gradient-bg p-6">
          <div className="glass-card p-8 max-w-md space-y-6 text-center">
            <div className="p-4 bg-rose-400/10 rounded-full w-fit mx-auto">
              <AlertTriangle className="w-12 h-12 text-rose-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Something Went Wrong</h2>
              <p className="text-white/40 text-sm">
                The application encountered an unexpected error.
              </p>
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-white/20 cursor-pointer hover:text-white/40">
                    Error details
                  </summary>
                  <pre className="mt-2 p-3 bg-black/20 rounded-lg text-[10px] text-rose-300 overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
