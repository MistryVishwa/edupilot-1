import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth-server"
import { deleteBookmark } from "@/lib/bookmarks-db"

export const dynamic = "force-dynamic"

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    await deleteBookmark(user.id, id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/bookmarks/[id]] DELETE Error:", err)
    const msg = err instanceof Error ? err.message : "Failed to delete bookmark"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
