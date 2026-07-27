import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth-server"
import { formatExportPayload } from "@/lib/export/formatter"
import { generateDocx } from "@/lib/export/docx"
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
    const docxBuffer = await generateDocx(doc)
    const filename = `${sanitizeFilename(result.data.title)}.docx`

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(docxBuffer.length),
      },
    })
  } catch (err) {
    console.error("[api/export/docx] Error:", err)
    const msg = err instanceof Error ? err.message : "Failed to generate DOCX document"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
