-- ============================================================
-- EduPilot SaaS Database Schema Update: Bookmarks Table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  subject     TEXT,
  tags        TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 1. Users can insert their own bookmarks
DROP POLICY IF EXISTS bookmarks_insert_own ON public.bookmarks;
CREATE POLICY bookmarks_insert_own ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Users can read their own bookmarks
DROP POLICY IF EXISTS bookmarks_select_own ON public.bookmarks;
CREATE POLICY bookmarks_select_own ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Users can delete their own bookmarks
DROP POLICY IF EXISTS bookmarks_delete_own ON public.bookmarks;
CREATE POLICY bookmarks_delete_own ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);
