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
    </div>
  )
}
