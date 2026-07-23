"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  question: string
  answer: string
  subject?: string | null
  tags?: string[]
  className?: string
}

export function BookmarkButton({
  question,
  answer,
  subject,
  tags = [],
  className,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSaving || isBookmarked) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer,
          subject: subject || "AI Tutor",
          tags,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        toast({
          title: "Sign in required",
          description: "You must be signed in to bookmark AI Tutor responses.",
          variant: "destructive",
        })
        return
      }

      if (response.status === 409 || data.code === "DUPLICATE_BOOKMARK") {
        setIsBookmarked(true)
        toast({
          title: "Already bookmarked",
          description: "This response is already saved in your bookmarks.",
        })
        return
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to save bookmark")
      }

      setIsBookmarked(true)
      toast({
        title: "Bookmark saved",
        description: "AI response has been bookmarked successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving bookmark",
        description: error instanceof Error ? error.message : "Something went wrong.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-7 w-7 text-muted-foreground hover:text-foreground transition-colors duration-200",
        isBookmarked && "text-primary hover:text-primary",
        className
      )}
      onClick={handleBookmark}
      disabled={isSaving}
      title={isBookmarked ? "Bookmarked" : "Bookmark this answer"}
    >
      {isSaving ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="h-3.5 w-3.5" />
      ) : (
        <Bookmark className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}
