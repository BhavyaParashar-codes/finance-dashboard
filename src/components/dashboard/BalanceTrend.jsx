import React, { useState, useCallback, useMemo } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MONTHLY_DATA } from '../../data/mockData'
import { formatCurrency } from '../../utils/helpers'
import useStore from '../../store/useStore'

// ── Time range config ────────────────────────────────────────────────────────
const RANGES = [
  { key: '1M', label: '1M', months: 1 },
  { key: '3M', label: '3M', months: 3 },
  { key: '6M', label: '6M', months: 6 },
  { key: '1Y', label: '1Y', months: 12 },
]

// ── Linear regression — returns next predicted value ─────────────────────────
function linearRegression(values) {
  const n = values.length
  if (n < 2) return values[0] || 0
  const xMean = (n - 1) / 2
  const yMean = values.reduce((s, v) => s + v, 0) / n
  let num = 0, den = 0
  values.forEach((y, x) => {
    num += (x - xMean) * (y - yMean)
    den += (x - xMean) ** 2
  })
  const slope = den === 0 ? 0 : num / den
  return Math.round(yMean - slope * xMean + slope * n)
}

const ALL_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function nextMonthLabel(label) {
  return ALL_MONTHS[(ALL_MONTHS.indexOf(label) + 1) % 12]
}

// ── Build chart data for a given slice of MONTHLY_DATA ───────────────────────
function buildChartData(slicedData) {
  if (!slicedData.length) return []
  const last = slicedData[slicedData.length - 1]
  const forecastIncome   = linearRegression(slicedData.map((d) => d.income))
  const forecastExpenses = linearRegression(slicedData.map((d) => d.expenses))

  // Stitch last real point so forecast lines connect
  const stitched = slicedData.map((d, i) =>
    i === slicedData.length - 1
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

// ── Tooltip ──────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  const isForecast = payload[0]?.payload?.isForecast
  return (
    <div className="bg-white dark:bg-navy-800 border border-border dark:border-navy-700 rounded-xl shadow-glass p-3 text-sm min-w-[160px]">
      <div className="flex items-center gap-2 mb-2">
        <p className="font-semibold text-navy dark:text-white">{label}</p>
        {isForecast && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-teal/10 text-teal">
            Forecast
          </span>
        )}
      </div>
      {payload.map((p) => {
        if (p.value == null) return null
        const name = p.name === 'forecastIncome'   ? 'Proj. Income'
                   : p.name === 'forecastExpenses' ? 'Proj. Expenses'
                   : p.name.charAt(0).toUpperCase() + p.name.slice(1)
        return (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: p.color || p.stroke }} />
            <span className="text-navy-400 dark:text-navy-300 text-xs">{name}:</span>
            <span className="font-medium text-navy dark:text-white ml-auto pl-2 text-xs">
              {formatCurrency(p.value, true, currency)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Clickable dot ─────────────────────────────────────────────────────────────
const ClickableDot = ({ cx, cy, payload, selectedMonth, onClickMonth, color }) => {
  if (!cx || !cy || payload?.isForecast) return null
  const isSelected = selectedMonth === payload.month
  return (
    <circle cx={cx} cy={cy}
      r={isSelected ? 6 : 3.5}
      fill={color}
      stroke={isSelected ? '#ffffff' : 'transparent'}
      strokeWidth={isSelected ? 2.5 : 0}
      style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
      onClick={(e) => { e.stopPropagation(); onClickMonth(payload.month) }}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BalanceTrend() {
  const { selectedMonth, setSelectedMonth, currency } = useStore()
  const [activeRange, setActiveRange] = useState('6M')

  // Slice data based on selected range
  const slicedData = useMemo(() => {
    const range = RANGES.find((r) => r.key === activeRange)
    return MONTHLY_DATA.slice(-range.months)
  }, [activeRange])

  const chartData = useMemo(() => buildChartData(slicedData), [slicedData])
  const forecastPt = chartData[chartData.length - 1]

  const handleChartClick = useCallback((data) => {
    if (!data?.activeLabel) return
    const pt = chartData.find((d) => d.month === data.activeLabel)
    if (pt?.isForecast) return
    setSelectedMonth(selectedMonth === data.activeLabel ? null : data.activeLabel)
  }, [chartData, selectedMonth, setSelectedMonth])

  const handleDotClick = useCallback((month) => {
    setSelectedMonth(selectedMonth === month ? null : month)
  }, [selectedMonth, setSelectedMonth])

  // Y-axis formatter
  const yFormatter = (v) => formatCurrency(v, true, currency)

  return (
    <div className="card p-5 animate-slide-up opacity-0"
      style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h3 className="font-semibold text-navy dark:text-white">Balance Trend</h3>
          <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">
            Click a data point to filter transactions.{' '}
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

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            {[
              { color: '#007C89', label: 'Income',   dashed: false },
              { color: '#EF5350', label: 'Expenses', dashed: false },
              { color: '#007C89', label: 'Forecast', dashed: true  },
            ].map(({ color, label, dashed }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={`inline-block w-5 border-t-2 ${dashed ? 'border-dashed opacity-60' : ''}`}
                  style={{ borderColor: color }} />
                <span className="text-navy-400 dark:text-navy-300">{label}</span>
              </span>
            ))}
          </div>

          {/* Range toggle — segmented control */}
          <div className="flex items-center bg-surface dark:bg-navy-900 border border-border dark:border-navy-700 rounded-xl p-1 gap-0.5">
            {RANGES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveRange(key)}
                className={`relative px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeRange === key
                    ? 'text-white'
                    : 'text-navy-400 dark:text-navy-400 hover:text-navy dark:hover:text-white'
                }`}
              >
                {activeRange === key && (
                  <motion.div
                    layoutId="range-pill"
                    className="absolute inset-0 bg-teal rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRange}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart
              data={chartData}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
              onClick={handleChartClick}
              style={{ cursor: 'pointer' }}
            >
              <defs>
                <linearGradient id="incomeGradBT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#007C89" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#007C89" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradBT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF5350" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#EF5350" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#D9E2EC" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#627D98' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false}
                tickFormatter={yFormatter} width={60} />
              <Tooltip content={<CustomTooltip currency={currency} />} />

              {selectedMonth && (
                <ReferenceLine x={selectedMonth} stroke="#007C89"
                  strokeWidth={1.5} strokeOpacity={0.25} />
              )}

              {/* Real data */}
              <Area type="monotone" dataKey="income" stroke="#007C89" strokeWidth={2.5}
                fill="url(#incomeGradBT)" connectNulls={false}
                dot={(props) => (
                  <ClickableDot {...props} selectedMonth={selectedMonth}
                    onClickMonth={handleDotClick} color="#007C89" />
                )}
                activeDot={{ r: 5, fill: '#007C89', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="expenses" stroke="#EF5350" strokeWidth={2.5}
                fill="url(#expenseGradBT)" connectNulls={false}
                dot={(props) => (
                  <ClickableDot {...props} selectedMonth={selectedMonth}
                    onClickMonth={handleDotClick} color="#EF5350" />
                )}
                activeDot={{ r: 5, fill: '#EF5350', stroke: '#fff', strokeWidth: 2 }}
              />

              {/* Forecast dashed lines */}
              <Line type="monotone" dataKey="forecastIncome" stroke="#007C89"
                strokeWidth={2} strokeDasharray="6 4" strokeOpacity={0.65}
                dot={false} activeDot={false} connectNulls legendType="none" />
              <Line type="monotone" dataKey="forecastExpenses" stroke="#EF5350"
                strokeWidth={2} strokeDasharray="6 4" strokeOpacity={0.65}
                dot={false} activeDot={false} connectNulls legendType="none" />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Forecast callout */}
      {forecastPt && (
        <div className="mt-3 px-3 py-2.5 bg-teal/5 border border-teal/15 rounded-xl flex items-start gap-2.5">
          <TrendingUp size={14} className="text-teal flex-shrink-0 mt-0.5" />
          <p className="text-xs text-navy-500 dark:text-navy-300 leading-relaxed">
            <span className="font-semibold text-teal">Next month forecast</span>
            {' '}({forecastPt.month}){': '}
            Income {formatCurrency(forecastPt.forecastIncome, true, currency)},
            {' '}expenses {formatCurrency(forecastPt.forecastExpenses, true, currency)}
            {' '}— based on {RANGES.find((r) => r.key === activeRange)?.label} linear trend.
          </p>
        </div>
      )}
    </div>
  )
}