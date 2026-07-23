import { getSupabaseAdmin } from "@/lib/supabase-server"
import { callAIWithFallback, cleanJsonText } from "@/lib/ai"

export type TimeframeFilter = "today" | "week" | "month" | "30days" | "all"

export interface SubjectProgressItem {
  subject: string
  count: number
  quizScore: number
  completedTasks: number
  totalTasks: number
  percentage: number
  color: string
}

export interface ActivityPoint {
  label: string
  date?: string
  count: number
  durationSeconds: number
}

export interface RecentActivityItem {
  id: string
  type: "ai_tutor" | "flashcards" | "study_plan" | "quiz" | "note" | "time_tracking"
  title: string
  subject: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface RemainingCredits {
  ai_chat: number
  flashcards: number
  study_plan: number
  total: number
}

export interface ConsumedCredits {
  ai_chat: number
  flashcards: number
  study_plan: number
  total: number
}

export interface GoalCompletionStats {
  totalTasks: number
  completedTasks: number
  percentage: number
}

export interface DashboardStats {
  totalAiConversations: number
  flashcardSetsCreated: number
  studyPlansGenerated: number
  completedStudyPlans: number
  remainingCredits: RemainingCredits
  creditsConsumed: ConsumedCredits
  dailyActivity: ActivityPoint[]
  weeklyActivity: ActivityPoint[]
  monthlyActivity: ActivityPoint[]
  subjectProgress: SubjectProgressItem[]
  recentSessions: RecentActivityItem[]
  learningStreak: number
  longestStreak: number
  avgDailySessions: number
  goalCompletion: GoalCompletionStats
  timeframe: TimeframeFilter
  isTrial: boolean
}

function getFilterCutoffDate(timeframe: TimeframeFilter): Date | null {
  const now = new Date()
  switch (timeframe) {
    case "today": {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case "week": {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      return d
    }
    case "30days": {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      return d
    }
    case "month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1)
      return d
    }
    case "all":
    default:
      return null
  }
}

function startOfDay(d: Date) {
  const res = new Date(d)
  res.setHours(0, 0, 0, 0)
  return res
}

function toDayKey(dateOrStr: string | Date) {
  return new Date(dateOrStr).toISOString().split("T")[0]
}

function calculateStreak(dates: string[]) {
  const uniqueDays = Array.from(new Set(dates)).sort().reverse()
  if (uniqueDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  const today = startOfDay(new Date())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let currentStreak = 0
  const latestDay = uniqueDays[0]

  if (latestDay === toDayKey(today) || latestDay === toDayKey(yesterday)) {
    currentStreak = 1
    let prev = new Date(latestDay)

    for (let i = 1; i < uniqueDays.length; i++) {
      const curr = new Date(uniqueDays[i])
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        currentStreak++
        prev = curr
      } else {
        break
      }
    }
  }

  let longestStreak = 1
  let running = 1

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1])
    const curr = new Date(uniqueDays[i])
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      running++
      longestStreak = Math.max(longestStreak, running)
    } else {
      running = 1
    }
  }

  return { currentStreak, longestStreak }
}

const SUBJECT_COLORS = [
  "hsl(var(--primary))",
  "hsl(142 71% 45%)",
  "hsl(199 89% 48%)",
  "hsl(271 91% 65%)",
  "hsl(32 95% 54%)",
  "hsl(340 82% 52%)",
  "hsl(175 75% 42%)",
]

export async function fetchDashboardStats(
  userId: string,
  timeframe: TimeframeFilter = "week"
): Promise<DashboardStats> {
  const admin = await getSupabaseAdmin()
  const cutoff = getFilterCutoffDate(timeframe)

  const [
    { data: chatSessions },
    { data: usageLogs },
    { data: flashcardSets },
    { data: studyPlans },
    { data: quizAttempts },
    { data: activitySessions },
    { data: creditsRow },
    { data: subRow },
    { data: customActivities },
    { data: savedNotes },
  ] = await Promise.all([
    admin
      .from("chat_sessions")
      .select("id, title, topic, created_at, last_message_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin
      .from("usage_logs")
      .select("id, feature, metadata, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin
      .from("saved_flashcard_sets")
      .select("id, topic, card_count, cards, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin
      .from("saved_study_plans")
      .select("id, title, goal, tasks, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    admin
      .from("saved_quiz_attempts")
      .select("id, topic, score, total_questions, percentage, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin
      .from("user_activity_sessions")
      .select("id, duration_seconds, started_at, path")
      .eq("user_id", userId)
      .order("started_at", { ascending: false }),
    admin
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    admin
      .from("subscriptions")
      .select("trial_active, trial_expiry")
      .eq("user_id", userId)
      .maybeSingle(),
    admin
      .from("study_activity")
      .select("id, activity_type, subject, metadata, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin
      .from("saved_notes")
      .select("id, source_title, source_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ])

  const allChats = chatSessions || []
  const allLogs = usageLogs || []
  const allFlashcards = flashcardSets || []
  const allPlans = studyPlans || []
  const allQuizzes = quizAttempts || []
  const allSessions = activitySessions || []
  const allCustomActivities = customActivities || []
  const allNotes = savedNotes || []

  // Filter lists based on selected timeframe
  const filterByCutoff = <T extends { created_at?: string; started_at?: string }>(
    list: T[]
  ): T[] => {
    if (!cutoff) return list
    return list.filter((item) => {
      const dateStr = item.created_at || item.started_at
      if (!dateStr) return true
      return new Date(dateStr) >= cutoff
    })
  }

  const filteredChats = filterByCutoff(allChats)
  const filteredFlashcards = filterByCutoff(allFlashcards)
  const filteredPlans = filterByCutoff(allPlans)
  const filteredQuizzes = filterByCutoff(allQuizzes)
  const filteredSessions = filterByCutoff(allSessions)
  const filteredCustom = filterByCutoff(allCustomActivities)

  // Totals
  const totalAiConversations = Math.max(
    filteredChats.length,
    allLogs.filter((l) => l.feature === "ai_chat").length
  )
  const flashcardSetsCreated = filteredFlashcards.length
  const studyPlansGenerated = filteredPlans.length

  // Plan completion calculations
  let completedStudyPlans = 0
  let totalTasks = 0
  let completedTasks = 0

  for (const plan of filteredPlans) {
    const tasks = Array.isArray(plan.tasks) ? plan.tasks : []
    if (tasks.length > 0) {
      totalTasks += tasks.length
      const completedCount = tasks.filter((t: { completed?: boolean }) => t.completed).length
      completedTasks += completedCount
      if (completedCount === tasks.length) {
        completedStudyPlans++
      }
    }
  }

  const goalPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Credits Calculation
  const isTrial =
    subRow?.trial_active === true &&
    subRow?.trial_expiry &&
    new Date(subRow.trial_expiry) > new Date()

  const remainingCredits: RemainingCredits = {
    ai_chat: isTrial ? 9999 : creditsRow?.ai_chat_remaining ?? 5,
    flashcards: isTrial ? 9999 : creditsRow?.flashcards_remaining ?? 3,
    study_plan: isTrial ? 9999 : creditsRow?.study_plan_remaining ?? 2,
    total: isTrial
      ? 9999
      : (creditsRow?.ai_chat_remaining ?? 5) +
        (creditsRow?.flashcards_remaining ?? 3) +
        (creditsRow?.study_plan_remaining ?? 2),
  }

  const creditsConsumed: ConsumedCredits = {
    ai_chat: creditsRow?.ai_chat_used ?? 0,
    flashcards: creditsRow?.flashcards_used ?? 0,
    study_plan: creditsRow?.study_plan_used ?? 0,
    total:
      (creditsRow?.ai_chat_used ?? 0) +
      (creditsRow?.flashcards_used ?? 0) +
      (creditsRow?.study_plan_used ?? 0),
  }

  // Streaks calculation using all activity dates
  const activityDates = [
    ...allSessions.map((s) => toDayKey(s.started_at)),
    ...allLogs.map((l) => toDayKey(l.created_at)),
    ...allChats.map((c) => toDayKey(c.created_at)),
    ...allFlashcards.map((f) => toDayKey(f.created_at)),
    ...allPlans.map((p) => toDayKey(p.created_at)),
    ...allQuizzes.map((q) => toDayKey(q.created_at)),
    ...allCustomActivities.map((ca) => toDayKey(ca.created_at)),
    ...allNotes.map((n) => toDayKey(n.created_at)),
  ]

  const { currentStreak, longestStreak } = calculateStreak(activityDates)

  // Average daily study sessions
  const uniqueActiveDays = new Set(activityDates).size
  const totalEventsCount =
    filteredChats.length +
    filteredFlashcards.length +
    filteredPlans.length +
    filteredQuizzes.length +
    filteredSessions.length

  const avgDailySessions =
    uniqueActiveDays > 0 ? Number((totalEventsCount / uniqueActiveDays).toFixed(1)) : 0

  // Subject Progress & Distribution aggregation
  const subjectMap = new Map<
    string,
    { count: number; quizScores: number[]; totalTasks: number; completedTasks: number }
  >()

  const addSubjectData = (
    sub: string | null | undefined,
    increment = 1,
    quizScore?: number,
    tCount = 0,
    cCount = 0
  ) => {
    const topic = (sub || "General Study").trim()
    if (!topic) return
    const existing = subjectMap.get(topic) || {
      count: 0,
      quizScores: [],
      totalTasks: 0,
      completedTasks: 0,
    }
    existing.count += increment
    if (typeof quizScore === "number") existing.quizScores.push(quizScore)
    existing.totalTasks += tCount
    existing.completedTasks += cCount
    subjectMap.set(topic, existing)
  }

  for (const c of filteredChats) addSubjectData(c.topic || c.title)
  for (const f of filteredFlashcards) addSubjectData(f.topic, f.card_count || 1)
  for (const q of filteredQuizzes) addSubjectData(q.topic, 1, Number(q.percentage || 0))
  for (const p of filteredPlans) {
    const tasks = Array.isArray(p.tasks) ? p.tasks : []
    const totalT = tasks.length
    const compT = tasks.filter((t: { completed?: boolean }) => t.completed).length
    addSubjectData(p.title, 1, undefined, totalT, compT)
  }
  for (const ca of filteredCustom) addSubjectData(ca.subject)
  for (const n of allNotes) addSubjectData(n.source_title)

  const rawSubjects = Array.from(subjectMap.entries()).map(([subj, data], idx) => {
    const avgScore = data.quizScores.length
      ? Math.round(data.quizScores.reduce((a, b) => a + b, 0) / data.quizScores.length)
      : 75
    const taskPct =
      data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : avgScore

    return {
      subject: subj,
      count: data.count,
      quizScore: avgScore,
      completedTasks: data.completedTasks,
      totalTasks: data.totalTasks,
      percentage: taskPct,
      color: SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
    }
  })

  // Sort subjects by count descending and take top 6
  const subjectProgress = rawSubjects.sort((a, b) => b.count - a.count).slice(0, 6)

  // Chart aggregation: Daily (last 7 days)
  const today = startOfDay(new Date())
  const dailyActivity: ActivityPoint[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const key = toDayKey(d)

    const daySessions = filteredSessions.filter((s) => toDayKey(s.started_at) === key)
    const duration = daySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0)

    const count =
      daySessions.length +
      filteredChats.filter((c) => toDayKey(c.created_at) === key).length +
      filteredFlashcards.filter((f) => toDayKey(f.created_at) === key).length +
      filteredQuizzes.filter((q) => toDayKey(q.created_at) === key).length +
      filteredPlans.filter((p) => toDayKey(p.created_at) === key).length

    return {
      label: d.toLocaleString("en-US", { weekday: "short" }),
      date: key,
      count,
      durationSeconds: duration,
    }
  })

  // Weekly Activity (7 days)
  const weeklyActivity = dailyActivity

  // Monthly Activity (last 6 months)
  const now = new Date()
  const monthlyActivity: ActivityPoint[] = Array.from({ length: 6 }).map((_, i) => {
    const current = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const year = current.getFullYear()
    const month = current.getMonth()

    const matchesMonth = (dStr?: string) => {
      if (!dStr) return false
      const dt = new Date(dStr)
      return dt.getFullYear() === year && dt.getMonth() === month
    }

    const monthSessions = allSessions.filter((s) => matchesMonth(s.started_at))
    const monthDuration = monthSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0)

    const monthCount =
      monthSessions.length +
      allChats.filter((c) => matchesMonth(c.created_at)).length +
      allFlashcards.filter((f) => matchesMonth(f.created_at)).length +
      allQuizzes.filter((q) => matchesMonth(q.created_at)).length +
      allPlans.filter((p) => matchesMonth(p.created_at)).length

    return {
      label: current.toLocaleString("en-US", { month: "short" }),
      count: monthCount,
      durationSeconds: monthDuration,
    }
  })

  // Recent Activity Feed compilation
  const recentSessions: RecentActivityItem[] = [
    ...allChats.map((c) => ({
      id: `chat-${c.id}`,
      type: "ai_tutor" as const,
      title: c.title || c.topic || "AI Tutor Session",
      subject: c.topic || "AI Learning",
      timestamp: c.created_at,
    })),
    ...allFlashcards.map((f) => ({
      id: `fc-${f.id}`,
      type: "flashcards" as const,
      title: `Flashcards: ${f.topic}`,
      subject: f.topic,
      timestamp: f.created_at,
      metadata: { count: f.card_count },
    })),
    ...allQuizzes.map((q) => ({
      id: `quiz-${q.id}`,
      type: "quiz" as const,
      title: `Quiz: ${q.topic}`,
      subject: q.topic,
      timestamp: q.created_at,
      metadata: { score: q.score, percentage: q.percentage },
    })),
    ...allPlans.map((p) => ({
      id: `plan-${p.id}`,
      type: "study_plan" as const,
      title: p.title,
      subject: p.goal || "Study Plan",
      timestamp: p.updated_at || p.created_at,
    })),
    ...allCustomActivities.map((ca) => ({
      id: `act-${ca.id}`,
      type: (ca.activity_type as RecentActivityItem["type"]) || "time_tracking",
      title: `${ca.activity_type.replace("_", " ")}: ${ca.subject || "Study"}`,
      subject: ca.subject || "General",
      timestamp: ca.created_at,
      metadata: ca.metadata as Record<string, unknown>,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15)

  return {
    totalAiConversations,
    flashcardSetsCreated,
    studyPlansGenerated,
    completedStudyPlans,
    remainingCredits,
    creditsConsumed,
    dailyActivity,
    weeklyActivity,
    monthlyActivity,
    subjectProgress,
    recentSessions,
    learningStreak: currentStreak,
    longestStreak,
    avgDailySessions,
    goalCompletion: {
      totalTasks,
      completedTasks,
      percentage: goalPercentage,
    },
    timeframe,
    isTrial,
  }
}

export interface AIInsightItem {
  id: string
  text: string
  category: "praise" | "suggestion" | "streak" | "warning" | "tip"
}

export async function generatePersonalizedInsights(
  userId: string,
  stats: DashboardStats
): Promise<AIInsightItem[]> {
  try {
    const prompt = `You are EduPilot's AI Learning Advisor. Analyze this student's progress and return 4 to 5 concise, actionable, personalized learning insights.

Student Metrics:
- Current Streak: ${stats.learningStreak} days (Longest: ${stats.longestStreak} days)
- AI Tutor Conversations: ${stats.totalAiConversations}
- Flashcard Sets Created: ${stats.flashcardSetsCreated}
- Study Plans Generated: ${stats.studyPlansGenerated} (${stats.completedStudyPlans} fully completed)
- Goal Completion Rate: ${stats.goalCompletion.percentage}% (${stats.goalCompletion.completedTasks}/${stats.goalCompletion.totalTasks} tasks)
- Top Subjects Studied: ${stats.subjectProgress.map((s) => `${s.subject} (${s.count} sessions, ${s.percentage}% accuracy)`).join(", ") || "None yet"}
- Remaining Credits: ${stats.remainingCredits.total} (AI Chat: ${stats.remainingCredits.ai_chat}, Flashcards: ${stats.remainingCredits.flashcards})
- Avg Daily Sessions: ${stats.avgDailySessions}

Return ONLY a valid JSON array of objects in this format:
[
  {
    "id": "1",
    "text": "Insight message string",
    "category": "praise" | "suggestion" | "streak" | "warning" | "tip"
  }
]`

    const raw = await callAIWithFallback(prompt)
    const cleaned = cleanJsonText(raw)
    const parsed = JSON.parse(cleaned)

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 5).map((item, idx) => ({
        id: String(item.id || idx + 1),
        text: String(item.text || "Keep building your daily learning habit."),
        category: (["praise", "suggestion", "streak", "warning", "tip"].includes(item.category)
          ? item.category
          : "tip") as AIInsightItem["category"],
      }))
    }
  } catch (err) {
    // Silent fallback to rule-based insights below
  }

  // Fallback Rule-Based Insights
  const fallbackInsights: AIInsightItem[] = []

  if (stats.learningStreak >= 3) {
    fallbackInsights.push({
      id: "fb-1",
      text: `🔥 Fantastic momentum! You are on a ${stats.learningStreak}-day study streak.`,
      category: "streak",
    })
  } else {
    fallbackInsights.push({
      id: "fb-1",
      text: "Start a study session today to build your daily learning streak!",
      category: "tip",
    })
  }

  if (stats.totalAiConversations > 0) {
    fallbackInsights.push({
      id: "fb-2",
      text: `You have completed ${stats.totalAiConversations} AI Tutor sessions to deepen concept clarity.`,
      category: "praise",
    })
  } else {
    fallbackInsights.push({
      id: "fb-2",
      text: "Try asking AI Tutor to explain complex topics step-by-step or using analogies.",
      category: "suggestion",
    })
  }

  if (stats.subjectProgress.length > 0) {
    const topSubject = stats.subjectProgress[0]
    fallbackInsights.push({
      id: "fb-3",
      text: `You're focusing strongly on ${topSubject.subject}. Consider balancing with secondary topics.`,
      category: "suggestion",
    })
  } else {
    fallbackInsights.push({
      id: "fb-3",
      text: "Generate flashcards or a study plan to organize your core subjects.",
      category: "tip",
    })
  }

  if (stats.flashcardSetsCreated === 0) {
    fallbackInsights.push({
      id: "fb-4",
      text: "Active recall with Flashcards can boost memory retention by up to 50%. Create your first set!",
      category: "warning",
    })
  } else {
    fallbackInsights.push({
      id: "fb-4",
      text: `You created ${stats.flashcardSetsCreated} flashcard sets for spaced repetition revision.`,
      category: "praise",
    })
  }

  if (stats.remainingCredits.total <= 3 && !stats.isTrial) {
    fallbackInsights.push({
      id: "fb-5",
      text: "You are running low on credits. Consider upgrading to Pro or Premium for unlimited AI study tools.",
      category: "warning",
    })
  }

  return fallbackInsights.slice(0, 5)
}
