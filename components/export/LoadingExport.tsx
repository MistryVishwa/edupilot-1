"use client"

import { Loader2 } from "lucide-react"

interface LoadingExportProps {
  format?: string
  message?: string
}

export function LoadingExport({ format = "document", message }: LoadingExportProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-foreground">
        {message || `Generating your ${format.toUpperCase()} export...`}
      </p>
      <p className="text-xs text-muted-foreground">Please wait while EduPilot formats your study document.</p>
    </div>
  )
}
