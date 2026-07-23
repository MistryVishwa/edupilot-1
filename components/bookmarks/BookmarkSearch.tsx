"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface BookmarkSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function BookmarkSearch({ onSearch, placeholder = "Search bookmarks by question, answer, subject..." }: BookmarkSearchProps) {
  const [value, setValue] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value)
    }, 400) // 400ms debounce delay

    return () => {
      clearTimeout(handler)
    }
  }, [value, onSearch])

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 bg-secondary/40 border-border hover:border-primary/20 focus-visible:border-primary/45 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
