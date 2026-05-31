import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" aria-live="assertive" className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg-900 p-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all"
              aria-label="Reload the page"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
