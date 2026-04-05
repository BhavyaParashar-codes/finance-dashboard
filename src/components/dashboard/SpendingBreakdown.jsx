import React, { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORY_COLORS } from '../../data/mockData'
import { formatCurrency } from '../../utils/helpers'
import useStore from '../../store/useStore'

// Expanded active slice — no tooltip, info shown inline in donut center
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 7}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={1}
      />
    </g>
  )
}

export default function SpendingBreakdown({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const { setActivePage, setFilter, currency } = useStore()

  const total = data.reduce((s, d) => s + d.value, 0)
  const hoveredItem = hoverIndex !== null ? data[hoverIndex] : null

  const handleSliceClick = (_, index) => {
    const item = data[index]
    if (!item) return
    setFilter('category', item.name)
    setActivePage('transactions')
  }

  const handleLegendClick = (item) => {
    setFilter('category', item.name)
    setActivePage('transactions')
  }

  return (
    <div
      className="card p-5 animate-slide-up opacity-0"
      style={{ animationDelay: '280ms', animationFillMode: 'forwards' }}
    >
      <div className="mb-3">
        <h3 className="font-semibold text-navy dark:text-white">Spending Breakdown</h3>
        <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">
          Hover a slice · Click to explore transactions
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">

        {/* Donut + inline center tooltip */}
        <div className="relative w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2.5}
                dataKey="value"
                activeIndex={hoverIndex !== null ? hoverIndex : undefined}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={handleSliceClick}
                strokeWidth={0}
                style={{ cursor: 'pointer' }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name] || '#007C89'}
                    opacity={
                      hoverIndex === null || hoverIndex === index ? 1 : 0.28
                    }
                    style={{ transition: 'opacity 0.18s ease' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label — shows hovered item or totals */}
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none px-2">
            <AnimatePresence mode="wait">
              {hoveredItem ? (
                <motion.div
                  key={hoveredItem.name}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.15 }}
                  className="text-center"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full mx-auto mb-1"
                    style={{ background: CATEGORY_COLORS[hoveredItem.name] || '#007C89' }}
                  />
                  <p className="text-[10px] font-medium text-navy dark:text-white leading-tight text-center line-clamp-2 px-1">
                    {hoveredItem.name}
                  </p>
                  <p className="text-sm font-bold mt-0.5 text-navy dark:text-white">
                    {formatCurrency(hoveredItem.value, true, currency)}
                  </p>
                  <p className="text-[10px] text-navy-400">
                    {((hoveredItem.value / total) * 100).toFixed(0)}%
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="total"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.15 }}
                  className="text-center"
                >
                  <p className="text-[10px] text-navy-400 dark:text-navy-300">Total Spend</p>
                  <p className="text-sm font-bold text-navy dark:text-white mt-0.5">
                    {formatCurrency(total, true, currency)}
                  </p>
                  <p className="text-[10px] text-navy-400 mt-0.5">
                    {data.length} categories
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Legend list with mini progress bars */}
        <div className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto scrollbar-none">
          {data.slice(0, 8).map((item, index) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0
            const color = CATEGORY_COLORS[item.name] || '#007C89'
            const isHovered = hoverIndex === index

            return (
              <button
                key={item.name}
                className={`w-full text-left rounded-xl px-2 py-1.5 transition-all duration-150 group
                  ${isHovered ? 'bg-surface dark:bg-navy-700/60' : 'hover:bg-surface/70 dark:hover:bg-navy-700/40'}`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => handleLegendClick(item)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-150"
                    style={{
                      background: color,
                      transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                    }}
                  />
                  <span className={`text-xs flex-1 truncate transition-colors duration-150 font-medium
                    ${isHovered ? 'text-navy dark:text-white' : 'text-navy-500 dark:text-navy-300'}`}>
                    {item.name}
                  </span>
                  <span className="text-xs font-mono font-semibold text-navy dark:text-white flex-shrink-0">
                    {formatCurrency(item.value, true, currency)}
                  </span>
                  <span className="text-[10px] text-navy-400 w-7 text-right flex-shrink-0">
                    {pct.toFixed(0)}%
                  </span>
                  {isHovered && (
                    <ArrowRight size={10} className="text-teal flex-shrink-0" />
                  )}
                </div>
                {/* Mini progress bar */}
                <div className="h-1 bg-border dark:bg-navy-600 rounded-full overflow-hidden ml-4">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    style={{ background: color, opacity: isHovered ? 1 : 0.65 }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom hint */}
      <p className="text-[10px] text-navy-400 dark:text-navy-500 text-center mt-3">
        Click any category to open filtered transactions →
      </p>
    </div>
  )
}