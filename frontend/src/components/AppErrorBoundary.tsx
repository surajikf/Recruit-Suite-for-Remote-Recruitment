import React from 'react'

type State = { hasError: boolean; error?: any }

export default class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: undefined }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('UI Error Boundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-10">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-yellow-800 mb-4">The page encountered an error. Try reloading. If it persists, share the console error with the team.</p>
            <details className="text-xs text-yellow-800 whitespace-pre-wrap" open>
              {String(this.state.error || '')}
            </details>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}


