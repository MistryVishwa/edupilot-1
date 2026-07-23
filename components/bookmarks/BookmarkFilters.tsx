"use client"

import { TagFilter } from "./TagFilter"

interface BookmarkFiltersProps {
  tags: string[]
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
}

export function BookmarkFilters({ tags, selectedTag, onSelectTag }: BookmarkFiltersProps) {
  return (
    <TagFilter
      tags={tags}
      selectedTag={selectedTag}
      onSelectTag={onSelectTag}
    />
  )
}
