import { getSupabaseAdmin } from "./supabase-server"
import type { Bookmark } from "@/types"

/**
 * Checks if a bookmark already exists for the given user with identical question and answer.
 */
export async function findDuplicateBookmark(
  userId: string,
  question: string,
  answer: string
): Promise<Bookmark | null> {
  const admin = await getSupabaseAdmin()

  const { data, error } = await admin
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .eq("question", question)
    .eq("answer", answer)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("Error checking for duplicate bookmark:", error)
    return null
  }

  return (data as Bookmark) || null
}

/**
 * Saves a new AI Tutor response bookmark for the user.
 */
export async function createBookmark(
  userId: string,
  input: {
    question: string
    answer: string
    subject?: string | null
    tags?: string[]
  }
): Promise<Bookmark> {
  const existing = await findDuplicateBookmark(userId, input.question, input.answer)
  if (existing) {
    const err = new Error("This response is already bookmarked")
    ;(err as { code?: string }).code = "DUPLICATE_BOOKMARK"
    throw err
  }

  const admin = await getSupabaseAdmin()

  const payload = {
    user_id: userId,
    question: input.question,
    answer: input.answer,
    subject: input.subject || null,
    tags: input.tags || [],
    created_at: new Date().toISOString(),
  }

  const { data, error } = await admin
    .from("bookmarks")
    .insert(payload)
    .select("*")
    .single()

  if (error) {
    throw new Error(`Failed to save bookmark: ${error.message}`)
  }

  return data as Bookmark
}

/**
 * Retrieves all bookmarks for a specific user, with optional search and tag filters.
 */
export async function getBookmarks(
  userId: string,
  filters?: { search?: string; tag?: string }
): Promise<Bookmark[]> {
  const admin = await getSupabaseAdmin()

  let query = admin
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)

  if (filters?.tag) {
    // Check if the tags array contains the specified tag
    query = query.contains("tags", [filters.tag])
  }

  if (filters?.search) {
    const searchPattern = `%${filters.search}%`
    query = query.or(
      `question.ilike.${searchPattern},answer.ilike.${searchPattern},subject.ilike.${searchPattern}`
    )
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch bookmarks: ${error.message}`)
  }

  return (data || []) as Bookmark[]
}

/**
 * Deletes a bookmark belonging to the user.
 */
export async function deleteBookmark(userId: string, bookmarkId: string): Promise<void> {
  const admin = await getSupabaseAdmin()

  const { error } = await admin
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("id", bookmarkId)

  if (error) {
    throw new Error(`Failed to delete bookmark: ${error.message}`)
  }
}
