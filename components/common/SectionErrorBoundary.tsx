'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SectionErrorBoundaryProps {
    children: ReactNode;
    fallbackTitle?: string;
    fallbackMessage?: string;
    onRetry?: () => void;
    showDetails?: boolean;
}

interface SectionErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    showErrorDetails: boolean;
}

/**
 * Error Boundary for individual sections
 * Isolates errors so they don't crash the entire page
 */
export class SectionErrorBoundary extends Component<
    SectionErrorBoundaryProps,
    SectionErrorBoundaryState
> {
    constructor(props: SectionErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            showErrorDetails: false,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<SectionErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to monitoring service in production
        console.error('Section Error:', error);
        console.error('Error Info:', errorInfo);

        // You could send this to an error tracking service like Sentry
        // if (process.env.NODE_ENV === 'production') {
        //   captureException(error, { extra: errorInfo });
        // }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        this.props.onRetry?.();
    };

    toggleDetails = () => {
        this.setState((prev) => ({ showErrorDetails: !prev.showErrorDetails }));
    };

    render() {
        const { hasError, error, showErrorDetails } = this.state;
        const {
            children,
            fallbackTitle = 'Greška pri učitavanju',
            fallbackMessage = 'Došlo je do greške prilikom učitavanja ove sekcije.',
            showDetails = process.env.NODE_ENV === 'development',
        } = this.props;

        if (hasError) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-red-500/10 border border-red-500/30 p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-500/20 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-300 mb-1">
                                {fallbackTitle}
                            </h3>
                            <p className="text-red-200/70 text-sm mb-4">
                                {fallbackMessage}
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={this.handleRetry}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Pokušaj ponovo
                                </button>

                                {showDetails && error && (
                                    <button
                                        onClick={this.toggleDetails}
                                        className="flex items-center gap-1 px-3 py-2 text-red-400/70 hover:text-red-300 text-sm transition-colors"
                                    >
                                        {showErrorDetails ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                Sakrij detalje
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                Prikaži detalje
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {showErrorDetails && error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4"
                                    >
                                        <div className="p-4 bg-slate-900/50 rounded-xl border border-red-500/20">
                                            <p className="text-xs text-red-400/80 font-mono mb-2">
                                                {error.name}: {error.message}
                                            </p>
                                            {error.stack && (
                                                <pre className="text-xs text-slate-500 font-mono overflow-x-auto whitespace-pre-wrap">
                                                    {error.stack.split('\n').slice(1, 5).join('\n')}
                                                </pre>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return children;
    }
}

/**
 * Hook-friendly wrapper for SectionErrorBoundary
 */
interface WithErrorBoundaryProps {
    children: ReactNode;
    title?: string;
    message?: string;
}

export function SafeSection({ children, title, message }: WithErrorBoundaryProps) {
    return (
        <SectionErrorBoundary fallbackTitle={title} fallbackMessage={message}>
            {children}
        </SectionErrorBoundary>
    );
}
