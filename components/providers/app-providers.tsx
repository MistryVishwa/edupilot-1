"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionTimeoutManager } from "@/components/session-timeout-manager"
import { UserDataProvider } from "@/hooks/use-user"
import { EduPilotGuideChatbot } from "@/components/edupilot-guide-chatbot"
import { Toaster } from "@/components/ui/toaster"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <UserDataProvider>
        <SessionTimeoutManager />
        {children}
        <Toaster />
        <EduPilotGuideChatbot />
      </UserDataProvider>
    </ThemeProvider>
  )
}