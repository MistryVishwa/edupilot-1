"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { cn } from "@/lib/utils"
import type { Bookmark } from "@/types"

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (id: string) => Promise<void>
  onTagClick?: (tag: string) => void
}

export function BookmarkCard({ bookmark, onDelete, onTagClick }: BookmarkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await onDelete(bookmark.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const formattedDate = new Date(bookmark.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  // We show expand/collapse button if the answer content is somewhat long
  const isLongAnswer = bookmark.answer.length > 250

  return (
    <Card className="flex flex-col h-full border-border bg-card/60 hover:bg-card hover:border-primary/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {bookmark.subject && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {bookmark.subject}
              </Badge>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title="Delete bookmark"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground leading-relaxed line-clamp-3">
            Q: {bookmark.question}
          </h4>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3 text-sm text-foreground/90">
        <div className="border-t border-border/40 pt-3">
          <div
            className={cn(
              "relative overflow-hidden transition-all duration-300",
              isLongAnswer && !isExpanded && "max-h-36"
            )}
          >
            <MarkdownRenderer content={bookmark.answer} className="leading-relaxed" />
            {isLongAnswer && !isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card/90 via-card/50 to-transparent pointer-events-none" />
            )}
          </div>

          {isLongAnswer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 w-full justify-center gap-1 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <span>Show More</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>

      {bookmark.tags && bookmark.tags.length > 0 && (
        <CardFooter className="flex flex-wrap gap-1.5 pt-0 pb-4">
          {bookmark.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="inline-flex items-center rounded-full border border-border/80 bg-secondary/30 px-2 py-0.5 text-xs text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              #{tag}
            </button>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}
