"use client"

import { useEffect, useState, useCallback } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DashboardStats, TimeframeFilter, AIInsightItem } from "@/lib/dashboard-analytics"
import { StatCard } from "@/components/dashboard/analytics/StatCard"
import { ProgressCard } from "@/components/dashboard/analytics/ProgressCard"
import { CreditsCard } from "@/components/dashboard/analytics/CreditsCard"
import { LearningStreak } from "@/components/dashboard/analytics/LearningStreak"
import { SubjectChart } from "@/components/dashboard/analytics/SubjectChart"
import { WeeklyChart } from "@/components/dashboard/analytics/WeeklyChart"
import { ActivityTimeline } from "@/components/dashboard/analytics/ActivityTimeline"
import { InsightsCard } from "@/components/dashboard/analytics/InsightsCard"
import { EmptyDashboard } from "@/components/dashboard/analytics/EmptyDashboard"
import { LoadingDashboard } from "@/components/dashboard/analytics/LoadingDashboard"
import {
  Brain,
  Layers,
  Calendar,
  Flame,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  BarChart3,
  BookOpen,
} from "lucide-react"
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import {
  TrendingUp, Clock, Target, Flame, Brain, Trophy, BookOpen, Calendar, MessageSquareText, Layers, ListChecks
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"

interface StatsData {
  streak: number
  learningHours: string
  quizzesTaken: number
  aiChats: number
  flashcardSessions: number
  weekTrend: string
  weeklyActivity: Array<{ day: string; count: number; label?: string }>
}

// Historical, per-feature-type usage trend + aggregates. Sourced from the same
// usage_logs table that lib/credits.ts writes to on every credit deduction
// (see app/api/usage/history/route.ts) rather than a separate pipeline. This
// is fetched independently of /api/user/stats so it never adds load to the
// main /dashboard page.
interface UsageHistoryPoint {
  date: string
  label: string
  ai_chat: number
  flashcards: number
  study_plan: number
}

interface UsageHistoryData {
  trend: UsageHistoryPoint[]
  aggregates: {
    totalSessions: number
    decksCreated: number
    plansCreated: number
    totalCreditActions: number
  }
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [insights, setInsights] = useState<AIInsightItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("week")

  const loadData = useCallback(async (tf: TimeframeFilter) => {
    try {
      const [statsRes, insightsRes] = await Promise.all([
        fetch(`/api/dashboard/stats?timeframe=${tf}`),
        fetch("/api/dashboard/insights"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json()
        setInsights(insightsData.insights || [])
      }
    } catch {
      // handled
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])
  const [period, setPeriod]   = useState("week")
  const [usageHistory, setUsageHistory] = useState<UsageHistoryData | null>(null)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/user/stats?period=${period}`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false))
  }, [period])

  useEffect(() => {
    setIsHistoryLoading(true)
    fetch(`/api/usage/history?period=${period}`)
      .then(r => r.json())
      .then(setUsageHistory)
      .catch(() => setUsageHistory(null))
      .finally(() => setIsHistoryLoading(false))
  }, [period])

  useEffect(() => {
    loadData(timeframe)
  }, [timeframe, loadData])

  const handleTimeframeChange = (val: string) => {
    const tf = val as TimeframeFilter
    setTimeframe(tf)
    setIsRefreshing(true)
    loadData(tf)
  }

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    loadData(timeframe)
  }

  const hasAnyActivity =
    stats &&
    (stats.totalAiConversations > 0 ||
      stats.flashcardSetsCreated > 0 ||
      stats.studyPlansGenerated > 0 ||
      stats.recentSessions.length > 0 ||
      stats.learningStreak > 0)

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              AI Study Progress Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              Live Analytics
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your learning metrics, subject progress, streak momentum, and AI insights.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-[150px] bg-secondary border-border text-foreground font-medium text-xs">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="h-9 w-9 border-border bg-secondary hover:bg-secondary/80"
            title="Refresh dashboard stats"
          >
            <RefreshCw className={`h-4 w-4 text-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingDashboard />
      ) : !hasAnyActivity ? (
        <EmptyDashboard />
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="AI Tutor Chats"
              value={stats.totalAiConversations}
              unit="sessions"
              subtext="Interactive tutor conversations"
              icon={Brain}
              color="text-violet-500"
              bgColor="bg-violet-500/10"
            />
            <StatCard
              title="Flashcards Created"
              value={stats.flashcardSetsCreated}
              unit="sets"
              subtext="Spaced repetition card decks"
              icon={Layers}
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <StatCard
              title="Study Plans"
              value={stats.studyPlansGenerated}
              unit="plans"
              subtext={`${stats.completedStudyPlans} fully completed`}
              icon={Calendar}
              color="text-sky-500"
              bgColor="bg-sky-500/10"
            />
            <StatCard
              title="Learning Streak"
              value={stats.learningStreak}
              unit="days"
              subtext={`Personal best: ${stats.longestStreak} days`}
              icon={Flame}
              color="text-orange-500"
              bgColor="bg-orange-500/10"
            />
          </div>

          {/* Primary Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <WeeklyChart
              data={stats.weeklyActivity}
              title={
                timeframe === "today"
                  ? "Today's Study Signals"
                  : timeframe === "month" || timeframe === "30days"
                  ? "Monthly Activity Trend"
                  : "Weekly Study Activity Trend"
              }
            />
            <SubjectChart subjects={stats.subjectProgress} />
          </div>
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity Chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : stats?.weeklyActivity && stats.weeklyActivity.some(d => d.count > 0) ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyActivity} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#actGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No activity this week yet</p>
                  <p className="text-xs text-muted-foreground">Start using AI features to see your stats</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

          {/* Secondary Stats Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <LearningStreak
              currentStreak={stats.learningStreak}
              longestStreak={stats.longestStreak}
              avgDailySessions={stats.avgDailySessions}
            />
            <ProgressCard
              completedStudyPlans={stats.completedStudyPlans}
              totalStudyPlans={stats.studyPlansGenerated}
              totalTasks={stats.goalCompletion.totalTasks}
              completedTasks={stats.goalCompletion.completedTasks}
              percentage={stats.goalCompletion.percentage}
            />
            <CreditsCard
              remaining={stats.remainingCredits}
              consumed={stats.creditsConsumed}
              isTrial={stats.isTrial}
            />
          </div>

          {/* AI Insights & Recent Activity Timeline Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <InsightsCard initialInsights={insights} />
            <ActivityTimeline activities={stats.recentSessions} />
          </div>
        </>
      )}
      {/* Usage by Feature Type - aggregate stats sourced from usage_logs (same
          source lib/credits.ts writes to on every credit deduction) */}
      {isHistoryLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total AI Sessions", value: usageHistory?.aggregates.totalSessions ?? 0, icon: MessageSquareText, color: "text-violet-500", bgColor: "bg-violet-500/10" },
            { label: "Decks Created",     value: usageHistory?.aggregates.decksCreated ?? 0,   icon: Layers,           color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
            { label: "Plans Created",     value: usageHistory?.aggregates.plansCreated ?? 0,   icon: ListChecks,       color: "text-primary",     bgColor: "bg-primary/10" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border bg-card">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", stat.bgColor)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Credit Usage Trend, segmented by feature type */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Usage Trend by Feature
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isHistoryLoading ? (
            <Skeleton className="h-[260px]" />
          ) : usageHistory?.trend && usageHistory.trend.some(d => d.ai_chat + d.flashcards + d.study_plan > 0) ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageHistory.trend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} minTickGap={20} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="ai_chat" name="AI Chats" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="flashcards" name="Flashcards" stroke="hsl(var(--chart-2,142 71% 45%))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="study_plan" name="Study Plans" stroke="hsl(var(--chart-3,199 89% 48%))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No usage recorded for this period yet</p>
                <p className="text-xs text-muted-foreground">Chats, flashcard sets, and study plans will show up here over time</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total AI Chats",       value: stats?.aiChats ?? 0,             icon: Brain   },
                { label: "Quizzes Completed",    value: stats?.quizzesTaken ?? 0,         icon: Target  },
                { label: "Flashcard Sessions",   value: stats?.flashcardSessions ?? 0,   icon: BookOpen},
                { label: "Days Active",          value: stats?.streak ?? 0,              icon: Flame   },
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-border bg-secondary/50 p-4 text-center">
                  <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
