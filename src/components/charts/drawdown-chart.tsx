"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DrawdownDataPoint {
  date: string
  drawdown: number
}

interface DrawdownChartProps {
  data: DrawdownDataPoint[]
  title?: string
  maxDrawdown?: number
  className?: string
}

export function DrawdownChart({
  data,
  title = "Drawdown",
  maxDrawdown,
  className,
}: DrawdownChartProps) {
  const formatXAxis = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM", { locale: fr })
  }

  const formatTooltipDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMMM yyyy", { locale: fr })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatTooltipDate(label)}
          </p>
          <p className="mt-1 font-semibold text-red-600 dark:text-red-400">
            Drawdown: {payload[0].value.toFixed(2)}%
          </p>
        </div>
      )
    }
    return null
  }

  const minDrawdown = Math.min(...data.map((d) => d.drawdown), maxDrawdown || 0)

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {maxDrawdown !== undefined && (
            <span className="text-sm text-red-600 dark:text-red-400">
              Max: {maxDrawdown.toFixed(2)}%
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-700" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                stroke="#a1a1aa"
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 12 }}
                stroke="#a1a1aa"
                tickLine={false}
                axisLine={false}
                domain={[minDrawdown * 1.1, 0]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#a1a1aa" />
              {maxDrawdown && (
                <ReferenceLine
                  y={maxDrawdown}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: "Max DD", position: "right", fontSize: 10 }}
                />
              )}
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorDrawdown)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
