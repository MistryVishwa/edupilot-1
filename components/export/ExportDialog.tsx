"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Sparkles, Layers, FileText, MessageSquareText, Calendar } from "lucide-react"
import { ExportMenu } from "./ExportMenu"

interface ExportDialogProps {
  trigger?: React.ReactNode
  availableData?: {
    chatMessages?: any[]
    notesTabs?: any[]
    flashcards?: any[]
    plannerTasks?: any[]
  }
}

export function ExportDialog({ trigger, availableData }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("Combined Study Session")
  const [subject, setSubject] = useState("Comprehensive Study Materials")

  const [includeChat, setIncludeChat] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [includeFlashcards, setIncludeFlashcards] = useState(true)
  const [includePlanner, setIncludePlanner] = useState(true)

  const items: any[] = []

  if (includeChat && availableData?.chatMessages?.length) {
    items.push({
      type: "ai-tutor",
      title: "AI Tutor Conversation",
      content: { messages: availableData.chatMessages },
    })
  }

  if (includeNotes && availableData?.notesTabs?.length) {
    items.push({
      type: "notes",
      title: "Study Notes",
      content: { tabs: availableData.notesTabs },
    })
  }

  if (includeFlashcards && availableData?.flashcards?.length) {
    items.push({
      type: "flashcards",
      title: "Flashcard Set",
      content: { cards: availableData.flashcards },
    })
  }

  if (includePlanner && availableData?.plannerTasks?.length) {
    items.push({
      type: "planner",
      title: "Study Planner Schedule",
      content: { tasks: availableData.plannerTasks },
    })
  }

  const combinedPayload = {
    items,
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Combined Export
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Combined Study Session Export
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <p className="text-sm text-muted-foreground">
            Select the study materials you want to package into a single professional document.
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Document Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Physics Midterm Study Package"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Subject / Topic</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Quantum Mechanics"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-border/60 pt-3">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Include Materials</Label>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-3">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">AI Tutor Chat</p>
                    <p className="text-xs text-muted-foreground">Include Q&A chat history</p>
                  </div>
                </div>
                <Checkbox
                  checked={includeChat}
                  onCheckedChange={(checked) => setIncludeChat(Boolean(checked))}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Study Notes</p>
                    <p className="text-xs text-muted-foreground">Include summary & concept breakdown</p>
                  </div>
                </div>
                <Checkbox
                  checked={includeNotes}
                  onCheckedChange={(checked) => setIncludeNotes(Boolean(checked))}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Flashcards</p>
                    <p className="text-xs text-muted-foreground">Include Q&A cards table</p>
                  </div>
                </div>
                <Checkbox
                  checked={includeFlashcards}
                  onCheckedChange={(checked) => setIncludeFlashcards(Boolean(checked))}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Study Planner Schedule</p>
                    <p className="text-xs text-muted-foreground">Include task timetable</p>
                  </div>
                </div>
                <Checkbox
                  checked={includePlanner}
                  onCheckedChange={(checked) => setIncludePlanner(Boolean(checked))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <ExportMenu
              type="combined"
              title={title}
              subject={subject}
              content={combinedPayload}
              label="Export Combined"
              disabled={items.length === 0}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
