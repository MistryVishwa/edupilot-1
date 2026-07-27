export type ExportContentType = "ai-tutor" | "notes" | "flashcards" | "planner" | "combined"
export type ExportFormat = "pdf" | "docx" | "markdown"

export interface FormattedSection {
  title: string
  type: "text" | "qa" | "list" | "table"
  content?: string
  items?: string[]
  headers?: string[]
  rows?: string[][]
  pairs?: Array<{ q: string; a: string; time?: string }>
}

export interface FormattedDocument {
  title: string
  subject: string
  date: string
  author: string
  toc: string[]
  sections: FormattedSection[]
  footer: string
}

export interface ExportPayload {
  type: ExportContentType
  title?: string
  subject?: string
  content: any
}

function cleanMarkdownSyntax(str: string): string {
  if (!str) return ""
  return str
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function formatExportPayload(payload: ExportPayload): FormattedDocument {
  const docTitle = payload.title || "EduPilot Study Export"
  const docSubject = payload.subject || "Study Document"
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const author = "EduPilot AI Study Assistant"
  const footer = "Generated using EduPilot"

  const sections: FormattedSection[] = []

  switch (payload.type) {
    case "ai-tutor": {
      const messages: Array<{ role: string; content: string; timestamp?: string }> =
        Array.isArray(payload.content?.messages)
          ? payload.content.messages
          : Array.isArray(payload.content)
            ? payload.content
            : []

      const pairs: Array<{ q: string; a: string; time?: string }> = []
      let currentQuestion = ""
      let currentTime = ""

      messages.forEach((msg) => {
        const timeVal = msg.timestamp
          ? new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : undefined

        if (msg.role === "user") {
          if (currentQuestion) {
            pairs.push({ q: currentQuestion, a: "No response provided.", time: currentTime })
          }
          currentQuestion = msg.content
          currentTime = timeVal || ""
        } else if (msg.role === "assistant") {
          pairs.push({
            q: currentQuestion || "General Question",
            a: cleanMarkdownSyntax(msg.content),
            time: timeVal || currentTime,
          })
          currentQuestion = ""
          currentTime = ""
        }
      })

      if (currentQuestion) {
        pairs.push({ q: currentQuestion, a: "No response provided.", time: currentTime })
      }

      sections.push({
        title: "AI Tutor Conversation History",
        type: "qa",
        pairs: pairs.length > 0 ? pairs : [{ q: "Conversation", a: "No messages recorded." }],
      })
      break
    }

    case "notes": {
      const tabs: Array<{ title: string; content: string }> = Array.isArray(payload.content?.tabs)
        ? payload.content.tabs
        : Array.isArray(payload.content)
          ? payload.content
          : []

      if (tabs.length > 0) {
        tabs.forEach((tab) => {
          sections.push({
            title: tab.title || "Note Section",
            type: "text",
            content: cleanMarkdownSyntax(tab.content),
          })
        })
      } else if (typeof payload.content === "string") {
        sections.push({
          title: "Notes Content",
          type: "text",
          content: cleanMarkdownSyntax(payload.content),
        })
      }
      break
    }

    case "flashcards": {
      const cards: Array<{ front: string; back: string }> = Array.isArray(payload.content?.cards)
        ? payload.content.cards
        : Array.isArray(payload.content)
          ? payload.content
          : []

      sections.push({
        title: "Flashcard Set Overview",
        type: "table",
        headers: ["Card #", "Front (Question)", "Back (Answer)"],
        rows: cards.map((c, i) => [
          String(i + 1),
          c.front || "",
          cleanMarkdownSyntax(c.back || ""),
        ]),
      })
      break
    }

    case "planner": {
      const tasks: Array<{
        title: string
        time?: string
        duration?: string
        subject?: string
        completed?: boolean
        day?: number
      }> = Array.isArray(payload.content?.tasks)
        ? payload.content.tasks
        : Array.isArray(payload.content)
          ? payload.content
          : []

      sections.push({
        title: "Scheduled Study Tasks",
        type: "table",
        headers: ["Status", "Time", "Duration", "Subject", "Task Description"],
        rows: tasks.map((t) => [
          t.completed ? "[X] Done" : "[ ] Pending",
          t.time || "Flex",
          t.duration || "1h",
          t.subject || "General",
          t.title || "",
        ]),
      })
      break
    }

    case "combined": {
      const items: Array<{ type: ExportContentType; title?: string; content: any }> =
        Array.isArray(payload.content?.items) ? payload.content.items : []

      items.forEach((item, index) => {
        const subDoc = formatExportPayload({
          type: item.type,
          title: item.title || `Study Section ${index + 1}`,
          subject: payload.subject,
          content: item.content,
        })

        subDoc.sections.forEach((s) => {
          sections.push({
            ...s,
            title: `${item.title ? item.title + " - " : ""}${s.title}`,
          })
        })
      })
      break
    }
  }

  if (sections.length === 0) {
    sections.push({
      title: "Study Material",
      type: "text",
      content: typeof payload.content === "string" ? payload.content : JSON.stringify(payload.content, null, 2),
    })
  }

  const toc = sections.map((s) => s.title)

  return {
    title: docTitle,
    subject: docSubject,
    date: dateStr,
    author,
    toc,
    sections,
    footer,
  }
}
