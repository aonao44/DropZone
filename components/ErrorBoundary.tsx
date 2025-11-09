"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // ®È¸Ì∞í2,j∞ÉgoSentryjinµ¸”πk·	
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // ´πø‡’©¸Î–√ØUILBåp]åíh:
      if (this.props.fallback) {
        return this.props.fallback
      }

      // «’©Î»n®È¸UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              ®È¸LzW~W_
            </h1>
            <p className="text-zinc-400 mb-6">
              3W3TVD~[ìàWjD®È¸LzW~W_
              ⁄¸∏íç≠ºWfJfWO`UD
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-4 bg-zinc-800 rounded text-left">
                <p className="text-xs font-mono text-red-400 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => window.location.reload()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                ⁄¸∏íç≠º
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                €¸‡k;ã
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
