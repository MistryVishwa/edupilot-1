"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Layers, HelpCircle, Calendar, Sparkles } from "lucide-react"

export function EmptyDashboard() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center md:p-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
          <Sparkles className="h-8 w-8" />
        </div>

        <h3 className="text-xl font-bold text-foreground">Welcome to your AI Study Dashboard</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          You haven&apos;t logged any study sessions or generated tools yet. Jump into any EduPilot tool below to begin tracking your study progress and analytics.
        </p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4 border-border hover:bg-secondary">
            <Link href="/ai-tutor">
              <Brain className="h-5 w-5 text-violet-500" />
              <span className="text-xs font-semibold">AI Tutor</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4 border-border hover:bg-secondary">
            <Link href="/flashcards">
              <Layers className="h-5 w-5 text-emerald-500" />
              <span className="text-xs font-semibold">Flashcards</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4 border-border hover:bg-secondary">
            <Link href="/quiz">
              <HelpCircle className="h-5 w-5 text-amber-500" />
              <span className="text-xs font-semibold">Take Quiz</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4 border-border hover:bg-secondary">
            <Link href="/planner">
              <Calendar className="h-5 w-5 text-sky-500" />
              <span className="text-xs font-semibold">Study Plan</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
