"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubjectProgressItem } from "@/lib/dashboard-analytics"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { BookOpen, PieChart as PieIcon } from "lucide-react"

interface SubjectChartProps {
  subjects: SubjectProgressItem[]
}

export function SubjectChart({ subjects }: SubjectChartProps) {
  const hasData = subjects.length > 0 && subjects.some((s) => s.count > 0)

  const chartData = subjects.map((s) => ({
    name: s.subject,
    value: s.count,
    color: s.color,
  }))

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <PieIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          Subject Progress & Distribution
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {hasData ? (
          <>
            <div className="h-[220px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(val: number, name: string) => [`${val} sessions`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Subject Accuracy & Completion
              </p>

              <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                {subjects.map((item) => (
                  <div
                    key={item.subject}
                    className="flex flex-col space-y-1 rounded-lg border border-border/60 bg-secondary/30 p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="flex items-center gap-2 truncate text-foreground">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.subject}</span>
                      </span>
                      <span className="font-bold text-foreground">{item.percentage}%</span>
                    </div>

                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, item.percentage)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-[260px] flex items-center justify-center text-center">
            <div>
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-foreground">No Subject Data Available</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                Start AI chats, quizzes, or flashcards on topics to view subject-wise distribution.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
