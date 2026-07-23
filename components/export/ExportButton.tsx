"use client"

import { ExportMenu } from "./ExportMenu"
import { ExportContentType } from "@/lib/export/formatter"

interface ExportButtonProps {
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

export function ExportButton(props: ExportButtonProps) {
  return <ExportMenu {...props} />
}
