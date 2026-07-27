import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth-server"
import { formatExportPayload } from "@/lib/export/formatter"
import { generateMarkdown } from "@/lib/export/markdown"
import { z } from "zod"

export const dynamic = "force-dynamic"

const exportSchema = z.object({
  type: z.enum(["ai-tutor", "notes", "flashcards", "planner", "combined"]),
  title: z.string().optional(),
  subject: z.string().optional(),
  content: z.any(),
})

function sanitizeFilename(title?: string): string {
  const base = title || "edupilot-export"
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "edupilot-export"
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const result = exportSchema.safeParse(body)

    if (!result.success) {
      const msg = result.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const doc = formatExportPayload(result.data)
    const markdownContent = generateMarkdown(doc)
    const filename = `${sanitizeFilename(result.data.title)}.md`

    return new NextResponse(markdownContent, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error("[api/export/markdown] Error:", err)
    const msg = err instanceof Error ? err.message : "Failed to generate Markdown document"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
