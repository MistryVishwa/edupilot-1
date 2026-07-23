"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function LoadingBookmarks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col h-64 rounded-xl border border-border/60 bg-card/40 p-5 space-y-4 shadow-sm animate-pulse"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded-full bg-secondary/80" />
            <Skeleton className="h-4 w-20 rounded bg-secondary/60" />
          </div>
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full rounded bg-secondary/80" />
            <Skeleton className="h-4 w-3/4 rounded bg-secondary/80" />
            <div className="pt-3 space-y-2">
              <Skeleton className="h-3 w-full rounded bg-secondary/50" />
              <Skeleton className="h-3 w-5/6 rounded bg-secondary/50" />
              <Skeleton className="h-3 w-2/3 rounded bg-secondary/50" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16 rounded-full bg-secondary/60" />
            <Skeleton className="h-6 w-16 rounded-full bg-secondary/60" />
          </div>
        </div>
      ))}
    </div>
  )
}
