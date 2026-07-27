-- Create production-style study activity table for analytics dashboard
CREATE TABLE IF NOT EXISTS public.study_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  subject TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_activity_user_id ON public.study_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_study_activity_created_at ON public.study_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_activity_type ON public.study_activity(activity_type);

ALTER TABLE public.study_activity ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'study_activity' AND policyname = 'study_activity_select_own'
  ) THEN
    CREATE POLICY "study_activity_select_own" ON public.study_activity
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'study_activity' AND policyname = 'study_activity_insert_own'
  ) THEN
    CREATE POLICY "study_activity_insert_own" ON public.study_activity
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
