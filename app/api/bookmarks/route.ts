import { NextResponse, NextRequest } from "next/server"
import { getUser } from "@/lib/auth-server"
import { getBookmarks, createBookmark } from "@/lib/bookmarks-db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const createBookmarkSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  subject: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || undefined
    const tag = searchParams.get("tag") || undefined

    const bookmarks = await getBookmarks(user.id, { search, tag })
    return NextResponse.json({ success: true, data: bookmarks })
  } catch (err) {
    console.error("[api/bookmarks] GET Error:", err)
    const msg = err instanceof Error ? err.message : "Failed to load bookmarks"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const result = createBookmarkSchema.safeParse(body)

    if (!result.success) {
      const errorMsg = result.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const bookmark = await createBookmark(user.id, result.data)
    return NextResponse.json({ success: true, data: bookmark }, { status: 201 })
  } catch (err) {
    console.error("[api/bookmarks] POST Error:", err)
    const code = (err as { code?: string })?.code
    if (code === "DUPLICATE_BOOKMARK") {
      return NextResponse.json(
        { error: "This response is already bookmarked", code: "DUPLICATE_BOOKMARK" },
        { status: 409 }
      )
    }
    const msg = err instanceof Error ? err.message : "Failed to save bookmark"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
