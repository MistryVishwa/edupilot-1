import type { Metadata } from "next"
import { BookmarkList } from "@/components/bookmarks/BookmarkList"
import { Bookmark } from "lucide-react"

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Revisit and organize your bookmarked AI Tutor responses.",
}

export default function BookmarksPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Bookmark className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Saved Bookmarks</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Your personal knowledge library of bookmarked AI responses.
          </p>
        </div>
      </div>

      <BookmarkList />
    </div>
  )
}
