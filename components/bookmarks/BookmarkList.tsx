"use client"

import { useCallback, useEffect, useState } from "react"
import { BookmarkCard } from "./BookmarkCard"
import { BookmarkSearch } from "./BookmarkSearch"
import { BookmarkFilters } from "./BookmarkFilters"
import { EmptyBookmarks } from "./EmptyBookmarks"
import { LoadingBookmarks } from "./LoadingBookmarks"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"
import type { Bookmark as BookmarkType } from "@/types"
import { Button } from "@/components/ui/button"

export function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // 1. Initial tag extraction fetch: loads all bookmarks once to extract all unique tags
  const loadAvailableTags = useCallback(async () => {
    try {
      const res = await fetch("/api/bookmarks")
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          const tags = Array.from(
            new Set((json.data as BookmarkType[]).flatMap((b) => b.tags || []))
          )
          setAvailableTags(tags)
        }
      }
    } catch (err) {
      console.error("Failed to load tags:", err)
    }
  }, [])

  // 2. Filtered fetch: loads bookmarks matching current search and tag filters
  const fetchFilteredBookmarks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedTag) params.append("tag", selectedTag)

      const url = `/api/bookmarks?${params.toString()}`
      const res = await fetch(url)
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || "Failed to load bookmarks")
      }

      if (json.success && Array.isArray(json.data)) {
        setBookmarks(json.data)
      } else {
        setBookmarks([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedTag])

  // Run initial tags load once on mount
  useEffect(() => {
    void loadAvailableTags()
  }, [loadAvailableTags])

  // Refetch when filters change
  useEffect(() => {
    void fetchFilteredBookmarks()
  }, [fetchFilteredBookmarks])

  // Handle bookmark deletion
  const handleDeleteBookmark = async (id: string) => {
    try {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: "DELETE",
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || "Failed to delete bookmark")
      }

      // Success feedback
      toast({
        title: "Bookmark removed",
        description: "The bookmark has been deleted.",
      })

      // Update local state instantly
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
      
      // Re-load available tags in case the deleted bookmark was the only one containing a tag
      void loadAvailableTags()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error deleting bookmark",
        description: err instanceof Error ? err.message : "Something went wrong.",
      })
    }
  }

  // Clear filters helper
  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedTag(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <BookmarkSearch onSearch={setSearchQuery} />
        {availableTags.length > 0 && (
          <BookmarkFilters
            tags={availableTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        )}
      </div>

      {isLoading ? (
        <LoadingBookmarks />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-destructive mb-4">Error: {error}</p>
          <Button variant="outline" className="gap-2" onClick={fetchFilteredBookmarks}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyBookmarks
          isFiltered={Boolean(searchQuery || selectedTag)}
          onClearFilters={handleClearFilters}
        />
      ) : (
        // Grid of cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onDelete={handleDeleteBookmark}
              onTagClick={(tag) => setSelectedTag(tag)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
