"use client"

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VolatilityDataPoint {
  date: string
  realized: number
  implied?: number
  vix?: number
}

interface VolatilityChartProps {
  data: VolatilityDataPoint[]
  title?: string
  showImplied?: boolean
  showVix?: boolean
  className?: string
}

export function VolatilityChart({
  data,
  title = "Volatilite",
  showImplied = false,
  showVix = false,
  className,
}: VolatilityChartProps) {
  const formatXAxis = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM", { locale: fr })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            {format(new Date(label), "d MMMM yyyy", { locale: fr })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}%
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="realized"
                name="Vol. Realisee"
                fill="#6366f1"
                opacity={0.7}
                radius={[4, 4, 0, 0]}
              />
              {showImplied && (
                <Line
                  type="monotone"
                  dataKey="implied"
                  name="Vol. Implicite"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {showVix && (
                <Line
                  type="monotone"
                  dataKey="vix"
                  name="VIX"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
