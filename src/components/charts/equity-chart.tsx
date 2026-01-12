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

interface EquityDataPoint {
  date: string
  value: number
  benchmark?: number
}

interface EquityChartProps {
  data: EquityDataPoint[]
  title?: string
  showBenchmark?: boolean
  className?: string
}

export function EquityChart({
  data,
  title = "Courbe de performance",
  showBenchmark = false,
  className,
}: EquityChartProps) {
  const formatXAxis = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM", { locale: fr })
  }

  const formatTooltipDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMMM yyyy", { locale: fr })
  }

  const formatValue = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatTooltipDate(label)}
          </p>
          <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">
            Performance: {formatValue(payload[0].value)}
          </p>
          {showBenchmark && payload[1] && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Benchmark: {formatValue(payload[1].value)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const minValue = Math.min(...data.map((d) => d.value))
  const maxValue = Math.max(...data.map((d) => d.value))
  const padding = (maxValue - minValue) * 0.1

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                domain={[minValue - padding, maxValue + padding]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#a1a1aa" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
              {showBenchmark && (
                <Area
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorBenchmark)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
