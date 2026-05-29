import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="rounded-2xl bg-red-500/5 border border-red-500/10 p-8 max-w-md text-center">
            <svg className="w-10 h-10 text-red-400/50 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 className="text-sm font-semibold text-red-400/70 mb-2">Something went wrong</h2>
            <p className="text-xs text-red-400/40 font-mono mb-4">{this.state.error?.message || 'Unknown error'}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg bg-white/10 text-xs text-white/50 hover:bg-white/15 transition-all"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}