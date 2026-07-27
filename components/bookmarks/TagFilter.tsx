"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TagFilterProps {
  tags: string[]
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
}

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filter by tag</span>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectTag(null)}
          className={cn(
            "rounded-full text-xs h-8 border-border hover:bg-secondary hover:text-foreground",
            selectedTag === null
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent"
              : "bg-transparent text-muted-foreground"
          )}
        >
          All Bookmarks
        </Button>
        {tags.map((tag) => {
          const isSelected = selectedTag === tag
          return (
            <Button
              key={tag}
              variant="outline"
              size="sm"
              onClick={() => onSelectTag(isSelected ? null : tag)}
              className={cn(
                "rounded-full text-xs h-8 border-border hover:bg-secondary hover:text-foreground transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent"
                  : "bg-transparent text-muted-foreground"
              )}
            >
              #{tag}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
