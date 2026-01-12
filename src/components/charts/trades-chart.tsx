"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface TradeResult {
  date: string
  pnl: number
  instrument?: string
}

interface TradesPnLChartProps {
  data: TradeResult[]
  title?: string
  className?: string
}

export function TradesPnLChart({
  data,
  title = "PnL par trade",
  className,
}: TradesPnLChartProps) {
  const formatXAxis = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM", { locale: fr })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      return (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {format(new Date(label), "d MMMM yyyy", { locale: fr })}
          </p>
          <p
            className={`mt-1 font-semibold ${
              value >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {value >= 0 ? "+" : ""}
            {value.toFixed(2)}%
          </p>
          {payload[0].payload.instrument && (
            <p className="text-xs text-zinc-500">{payload[0].payload.instrument}</p>
          )}
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
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface WinRateData {
  wins: number
  losses: number
  breakeven: number
}

interface WinRateChartProps {
  data: WinRateData
  title?: string
  className?: string
}

export function WinRateChart({
  data,
  title = "Repartition des trades",
  className,
}: WinRateChartProps) {
  const chartData = [
    { name: "Gagnants", value: data.wins, color: "#10b981" },
    { name: "Perdants", value: data.losses, color: "#ef4444" },
    { name: "Neutres", value: data.breakeven, color: "#a1a1aa" },
  ].filter((d) => d.value > 0)

  const total = data.wins + data.losses + data.breakeven
  const winRate = total > 0 ? (data.wins / total) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <span className="text-sm font-semibold text-emerald-600">
            Win rate: {winRate.toFixed(1)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} trades`, ""]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
