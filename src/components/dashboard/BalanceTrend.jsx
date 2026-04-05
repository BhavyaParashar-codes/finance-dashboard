import React, { useCallback } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { MONTHLY_DATA } from '../../data/mockData'
import { formatCurrency, convertAmount } from '../../utils/helpers'
import useStore from '../../store/useStore'

function linearRegression(values) {
  const n = values.length
  const xMean = (n - 1) / 2
  const yMean = values.reduce((s, v) => s + v, 0) / n
  let num = 0, den = 0
  values.forEach((y, x) => {
    num += (x - xMean) * (y - yMean)
    den += (x - xMean) ** 2
  })
  const slope = den === 0 ? 0 : num / den
  const intercept = yMean - slope * xMean
  return Math.round(intercept + slope * n)
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function nextMonthLabel(label) {
  return MONTH_NAMES[(MONTH_NAMES.indexOf(label) + 1) % 12]
}

function buildChartData() {
  const real = MONTHLY_DATA
  const last = real[real.length - 1]
  const forecastIncome = linearRegression(real.map((d) => d.income))
  const forecastExpenses = linearRegression(real.map((d) => d.expenses))

  const stitched = real.map((d, i) =>
    i === real.length - 1
      ? { ...d, forecastIncome: d.income, forecastExpenses: d.expenses }
      : d
  )
  const forecastPt = {
    month: nextMonthLabel(last.month),
    income: null,
    expenses: null,
    forecastIncome,
    forecastExpenses,
    isForecast: true,
  }
  return [...stitched, forecastPt]
}

const CHART_DATA = buildChartData()
const FORECAST_PT = CHART_DATA[CHART_DATA.length - 1]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const pt = CHART_DATA.find((d) => d.month === label)
  return (
    <div className="bg-white dark:bg-navy-800 border border-border dark:border-navy-700 rounded-xl shadow-glass p-3 text-sm min-w-[160px]">
      <div className="flex items-center gap-2 mb-2">
        <p className="font-semibold text-navy dark:text-white">{label}</p>
        {pt?.isForecast && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-teal/10 text-teal">Forecast</span>
        )}
      </div>
      {payload.map((p) => {
        if (p.value == null) return null
        const name = p.name === 'forecastIncome' ? 'Proj. Income'
          : p.name === 'forecastExpenses' ? 'Proj. Expenses'
          : p.name.charAt(0).toUpperCase() + p.name.slice(1)
        return (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.stroke }} />
            <span className="text-navy-400 dark:text-navy-300 text-xs">{name}:</span>
            <span className="font-medium text-navy dark:text-white ml-auto pl-2 text-xs">
              {formatCurrency(p.value, true)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const ClickableDot = ({ cx, cy, payload, selectedMonth, onClickMonth, color }) => {
  if (!cx || !cy || payload?.isForecast) return null
  const isSelected = selectedMonth === payload.month
  return (
    <circle
      cx={cx} cy={cy}
      r={isSelected ? 6 : 3.5}
      fill={color}
      stroke={isSelected ? '#ffffff' : 'transparent'}
      strokeWidth={isSelected ? 2.5 : 0}
      style={{ cursor: 'pointer', transition: 'r 0.15s ease, stroke-width 0.15s ease' }}
      onClick={(e) => { e.stopPropagation(); onClickMonth(payload.month) }}
    />
  )
}

export default function BalanceTrend() {
  const { selectedMonth, setSelectedMonth } = useStore()

  const handleChartClick = useCallback((data) => {
    if (!data?.activeLabel) return
    const pt = CHART_DATA.find((d) => d.month === data.activeLabel)
    if (pt?.isForecast) return
    setSelectedMonth(selectedMonth === data.activeLabel ? null : data.activeLabel)
  }, [selectedMonth, setSelectedMonth])

  const handleDotClick = useCallback((month) => {
    setSelectedMonth(selectedMonth === month ? null : month)
  }, [selectedMonth, setSelectedMonth])

  return (
    <div className="card p-5 animate-slide-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
      <div className="flex items-start justify-between mb-5 gap-2">
        <div>
          <h3 className="font-semibold text-navy dark:text-white">Balance Trend</h3>
          <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">
            Click a point to filter transactions by month.{' '}
            {selectedMonth && (
              <button
                className="text-teal hover:text-teal-600 underline underline-offset-2 transition-colors"
                onClick={() => setSelectedMonth(null)}
              >
                Clear ({selectedMonth}) ×
              </button>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs flex-shrink-0">
          {[
            { color: '#007C89', label: 'Income', dashed: false },
            { color: '#EF5350', label: 'Expenses', dashed: false },
            { color: '#007C89', label: 'Forecast', dashed: true },
          ].map(({ color, label, dashed }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span
                className={`inline-block w-5 border-t-2 ${dashed ? 'border-dashed opacity-60' : ''}`}
                style={{ borderColor: color }}
              />
              <span className="text-navy-400 dark:text-navy-300">{label}</span>
            </span>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={CHART_DATA}
          margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
          onClick={handleChartClick}
          style={{ cursor: 'pointer' }}
        >
          <defs>
            <linearGradient id="incomeGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007C89" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#007C89" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF5350" stopOpacity={0.14} />
              <stop offset="95%" stopColor="#EF5350" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#D9E2EC" strokeOpacity={0.5} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#627D98' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
          <Tooltip content={<CustomTooltip />} />

          {selectedMonth && (
            <ReferenceLine x={selectedMonth} stroke="#007C89" strokeWidth={1.5} strokeOpacity={0.25} />
          )}

          <Area type="monotone" dataKey="income" stroke="#007C89" strokeWidth={2.5}
            fill="url(#incomeGrad2)" connectNulls={false}
            dot={(props) => <ClickableDot {...props} selectedMonth={selectedMonth} onClickMonth={handleDotClick} color="#007C89" />}
            activeDot={{ r: 5, fill: '#007C89', stroke: '#fff', strokeWidth: 2 }}
          />
          <Area type="monotone" dataKey="expenses" stroke="#EF5350" strokeWidth={2.5}
            fill="url(#expenseGrad2)" connectNulls={false}
            dot={(props) => <ClickableDot {...props} selectedMonth={selectedMonth} onClickMonth={handleDotClick} color="#EF5350" />}
            activeDot={{ r: 5, fill: '#EF5350', stroke: '#fff', strokeWidth: 2 }}
          />
          <Line type="monotone" dataKey="forecastIncome" stroke="#007C89" strokeWidth={2}
            strokeDasharray="6 4" strokeOpacity={0.65} dot={false} activeDot={false} connectNulls legendType="none" />
          <Line type="monotone" dataKey="forecastExpenses" stroke="#EF5350" strokeWidth={2}
            strokeDasharray="6 4" strokeOpacity={0.65} dot={false} activeDot={false} connectNulls legendType="none" />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-3 px-3 py-2.5 bg-teal/5 border border-teal/15 rounded-xl flex items-start gap-2.5">
        <TrendingUp size={14} className="text-teal flex-shrink-0 mt-0.5" />
        <p className="text-xs text-navy-500 dark:text-navy-300 leading-relaxed">
          <span className="font-semibold text-teal">Next month forecast:</span>{' '}
          Projected income {formatCurrency(FORECAST_PT.forecastIncome, true)}, expenses{' '}
          {formatCurrency(FORECAST_PT.forecastExpenses, true)} — linear regression over 6 months.
        </p>
      </div>
    </div>
  )
}
