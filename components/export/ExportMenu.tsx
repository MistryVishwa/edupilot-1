"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileCode, Loader2, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ExportContentType, ExportFormat } from "@/lib/export/formatter"
import { cn } from "@/lib/utils"

interface ExportMenuProps {
  type: ExportContentType
  title?: string
  subject?: string
  content: any
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  label?: string
}

export function ExportMenu({
  type,
  title = "EduPilot Study Material",
  subject = "General Study",
  content,
  className,
  variant = "outline",
  size = "sm",
  disabled = false,
  label = "Export",
}: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)
  const { toast } = useToast()

  const handleExport = async (format: ExportFormat) => {
    if (isExporting || disabled) return
    setIsExporting(format)

    try {
      const response = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          subject,
          content,
        }),
      })

      if (response.status === 401) {
        toast({
          title: "Sign in required",
          description: "You must be signed in to export study materials.",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        throw new Error(errJson.error || `Failed to generate ${format.toUpperCase()}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      
      const contentDisposition = response.headers.get("Content-Disposition")
      let filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${format === "markdown" ? "md" : format}`

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) {
          filename = match[1]
        }
      }

      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `Your ${format.toUpperCase()} document has been downloaded.`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: err instanceof Error ? err.message : "Something went wrong during export.",
      })
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || Boolean(isExporting)}
          className={cn("gap-1.5 font-medium transition-colors", className)}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>{isExporting ? `Exporting ${isExporting.toUpperCase()}...` : label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-xl">
        <DropdownMenuItem
          onClick={() => void handleExport("pdf")}
          className="gap-2.5 cursor-pointer hover:bg-secondary"
        >
          <FileText className="h-4 w-4 text-rose-500" />
          <div className="flex flex-col">
            <span className="font-medium text-xs">PDF Document</span>
            <span className="text-[10px] text-muted-foreground">High-quality formatted PDF</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void handleExport("docx")}
          className="gap-2.5 cursor-pointer hover:bg-secondary"
        >
          <FileCode className="h-4 w-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="font-medium text-xs">Word Document (.docx)</span>
            <span className="text-[10px] text-muted-foreground">Editable Microsoft Word</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void handleExport("markdown")}
          className="gap-2.5 cursor-pointer hover:bg-secondary"
        >
          <FileText className="h-4 w-4 text-emerald-500" />
          <div className="flex flex-col">
            <span className="font-medium text-xs">Markdown (.md)</span>
            <span className="text-[10px] text-muted-foreground">Plain text markdown</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
