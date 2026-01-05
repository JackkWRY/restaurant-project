/**
 * @file Error Boundary Component
 * @description React Error Boundary for catching and displaying errors
 * 
 * This component handles:
 * - Catch React component errors
 * - Display user-friendly error UI
 * - Log errors for debugging
 * - Provide reset functionality
 * - Show error details in development
 * - Custom fallback support
 * 
 * State management:
 * - Class component state for error tracking
 * 
 * Features:
 * - Error catching via componentDidCatch
 * - Custom fallback UI option
 * - Error reset functionality
 * - Development-only error details
 * - Home page navigation
 * 
 * @module components/common/ErrorBoundary
 * @requires react
 * @requires lucide-react
 * 
 * @see {@link https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary}
 */

'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

/**
 * Props for ErrorBoundary component
 * @property {React.ReactNode} children - Child components to wrap
 * @property {React.ReactNode} [fallback] - Optional custom fallback UI
 */
interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Error boundary state
 * @property {boolean} hasError - Whether an error has been caught
 * @property {Error} [error] - The caught error object
 * @property {React.ErrorInfo} [errorInfo] - React error info
 */
interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary Class Component
 * 
 * Catches errors in child components and displays fallback UI.
 * Provides error reset and navigation options.
 * 
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * 
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  // Derive state from error
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                เกิดข้อผิดพลาด
              </h2>
              <p className="text-slate-600 mb-6">
                {this.state.error?.message || 'Something went wrong'}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="text-left mb-6 bg-slate-100 p-4 rounded-lg">
                  <summary className="cursor-pointer font-bold text-sm text-slate-700 mb-2">
                    Error Details (Dev Only)
                  </summary>
                  <pre className="text-xs text-slate-600 overflow-auto max-h-40">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  ลองอีกครั้ง
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Home size={20} />
                  กลับหน้าหลัก
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
