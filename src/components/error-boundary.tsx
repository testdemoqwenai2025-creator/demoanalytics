'use client'

import * as React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error | null; reset: () => void }>
}

const DefaultFallback = ({ error, reset }: { error: Error | null; reset: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
    <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
    <h2 className="text-lg font-semibold mb-1">Something went wrong</h2>
    <p className="text-sm text-muted-foreground mb-4 max-w-md">
      {error?.message || 'An unexpected error occurred while rendering this section.'}
    </p>
    <div className="flex gap-2">
      <Button size="sm" onClick={reset}>
        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Try again
      </Button>
      <Button size="sm" variant="outline" asChild>
        <a href="/">Go home</a>
      </Button>
    </div>
  </div>
)

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultFallback
      return <Fallback error={this.state.error} reset={this.reset} />
    }
    return this.props.children
  }
}

// Hook version for wrapping page sections
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error | null; reset: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
