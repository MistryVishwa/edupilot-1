"use client"

import { Bookmark, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyBookmarksProps {
  isFiltered?: boolean
  onClearFilters?: () => void
}

export function EmptyBookmarks({ isFiltered, onClearFilters }: EmptyBookmarksProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center md:p-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/80 text-muted-foreground mb-4">
          <SearchX className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No matching bookmarks</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          We couldn't find any bookmarks matching your search or selected tag filter.
        </p>
        {onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="rounded-xl border-border">
            Clear Filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center md:p-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
        <Bookmark className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No bookmarks yet</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        Bookmark important AI answers to build your personal knowledge library and easily review them anytime.
      </p>
      <Button asChild className="rounded-xl px-5">
        <a href="/ai-tutor">Go to AI Tutor</a>
      </Button>
    </div>
  )
}
