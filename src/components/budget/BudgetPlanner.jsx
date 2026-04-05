import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, RotateCcw, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import useStore from '../../store/useStore'
import { formatCurrency } from '../../utils/helpers'
import { CATEGORY_COLORS } from '../../data/mockData'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

// Get spending for the CURRENT month only
function getCurrentMonthSpending(transactions) {
  const now = new Date()
  const currentMonth = now.getMonth()   // 0-indexed
  const currentYear = now.getFullYear()

  const map = {}
  transactions
    .filter((t) => {
      const d = new Date(t.date)
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount)
    })
  return map
}

function BudgetRing({ pct, color, size = 72 }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const clampedPct = Math.min(pct, 100)
  return (
    <svg width={size} height={size} className="flex-shrink-0 -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor"
        strokeWidth={6} className="text-border dark:text-navy-700" />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={6} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (circ * clampedPct) / 100 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

function BudgetCard({ category, budget, spent, currency, onEdit }) {
  const pct = budget > 0 ? (spent / budget) * 100 : 0
  const remaining = budget - spent
  const isOver = pct > 100
  const isWarning = pct >= 80 && !isOver
  const color = isOver ? '#EF5350' : isWarning ? '#F6A623' : (CATEGORY_COLORS[category] || '#007C89')
  const statusColor = isOver ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'

  return (
    <motion.div variants={cardVariants}
      className={`card p-4 hover:shadow-card-hover transition-shadow duration-200 ${isOver ? 'ring-1 ring-red-200 dark:ring-red-900/40' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <BudgetRing pct={pct} color={color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-navy dark:text-white">{Math.round(pct)}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: CATEGORY_COLORS[category] || '#007C89' }} />
              <span className="font-semibold text-navy dark:text-white text-sm truncate">{category}</span>
            </div>
            <div className="flex items-center gap-1">
              {isOver && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
              {isWarning && <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />}
              {!isOver && !isWarning && pct > 0 && <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />}
              <button onClick={() => onEdit(category, budget)}
                className="p-1 rounded-lg hover:bg-surface dark:hover:bg-navy-700 text-navy-400 hover:text-teal transition-colors">
                <Edit2 size={13} />
              </button>
            </div>
          </div>

          <div className="mt-2 h-1.5 bg-border dark:bg-navy-700 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: color }}
            />
          </div>

          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-mono text-navy-500 dark:text-navy-300">
              {formatCurrency(spent, true, currency)} <span className="text-navy-400">/ {formatCurrency(budget, true, currency)}</span>
            </span>
            <span className={`text-xs font-medium ${statusColor}`}>
              {isOver
                ? `${formatCurrency(Math.abs(remaining), true, currency)} over`
                : `${formatCurrency(remaining, true, currency)} left`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function EditModal({ category, current, onSave, onClose }) {
  const [val, setVal] = useState(current.toString())
  const valid = !isNaN(Number(val)) && Number(val) > 0
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white dark:bg-navy-800 rounded-2xl border border-border dark:border-navy-700 shadow-glass p-6 w-full max-w-sm">
        <h3 className="font-semibold text-navy dark:text-white mb-1">Edit Budget</h3>
        <p className="text-xs text-navy-400 mb-4">{category}</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm font-medium">₹</span>
          <input type="number" value={val} onChange={(e) => setVal(e.target.value)}
            className="w-full pl-7 pr-4 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700
                       rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            autoFocus min="0" />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={() => valid && onSave(Number(val))}
            disabled={!valid}
            className={`btn-primary flex-1 justify-center ${!valid ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Save Budget
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function BudgetPlanner() {
  const { transactions, budgets, setBudget, resetBudgets, currency } = useStore()
  const [editTarget, setEditTarget] = useState(null)

  // Current month label e.g. "April 2026"
  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  // Only spending from the current calendar month
  const spendMap = getCurrentMonthSpending(transactions)

  const budgetCategories = Object.keys(budgets)
  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0)
  const totalSpent = budgetCategories.reduce((s, cat) => s + (spendMap[cat] || 0), 0)
  const overBudgetCount = budgetCategories.filter((cat) => (spendMap[cat] || 0) > budgets[cat]).length
  const onTrackCount = budgetCategories.filter((cat) => {
    const pct = budgets[cat] > 0 ? ((spendMap[cat] || 0) / budgets[cat]) * 100 : 0
    return pct < 80
  }).length

  const handleSave = (category, amount) => {
    setBudget(category, amount)
    toast.success('Budget updated', { description: `${category} → ${formatCurrency(amount, true, currency)}` })
    setEditTarget(null)
  }

  return (
    <div className="space-y-5">
      {/* Month banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-teal" />
        <p className="text-sm font-semibold text-navy dark:text-white">
          Budget for <span className="text-teal">{monthLabel}</span>
        </p>
        <span className="text-xs text-navy-400 dark:text-navy-400 ml-1">
          — showing only this month's expenses
        </span>
      </motion.div>

      {/* Summary row */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: formatCurrency(totalBudget, true, currency), sub: monthLabel, color: 'text-teal' },
          {
            label: 'Total Spent',
            value: formatCurrency(totalSpent, true, currency),
            sub: `${Math.round((totalSpent / totalBudget) * 100)}% used`,
            color: totalSpent > totalBudget ? 'text-red-500' : 'text-navy dark:text-white',
          },
          { label: 'Over Budget', value: overBudgetCount, sub: 'categories', color: overBudgetCount > 0 ? 'text-red-500' : 'text-emerald-500' },
          { label: 'On Track', value: onTrackCount, sub: 'categories', color: 'text-emerald-500' },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-xs text-navy-400 dark:text-navy-400 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold font-mono ${item.color}`}>{item.value}</p>
            <p className="text-xs text-navy-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Budget cards */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-navy-400 uppercase tracking-widest">Category Budgets</h2>
        <button onClick={() => { resetBudgets(); toast.success('Budgets reset to defaults') }}
          className="btn-ghost text-xs py-1.5 gap-1.5">
          <RotateCcw size={12} /> Reset defaults
        </button>
      </div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        variants={containerVariants} initial="hidden" animate="visible">
        {budgetCategories.map((cat) => (
          <BudgetCard key={cat} category={cat} budget={budgets[cat]}
            spent={spendMap[cat] || 0} currency={currency}
            onEdit={(cat, budget) => setEditTarget({ cat, budget })} />
        ))}
      </motion.div>

      {/* Tip */}
      <div className="card p-4 flex items-start gap-3">
        <TrendingUp size={16} className="text-teal flex-shrink-0 mt-0.5" />
        <p className="text-xs text-navy-500 dark:text-navy-300 leading-relaxed">
          <span className="font-semibold text-teal">Budget tip:</span> The 50/30/20 rule — 50% on needs (Rent, Utilities, Food), 30% on wants (Entertainment, Shopping), 20% saved.
        </p>
      </div>

      {editTarget && (
        <EditModal category={editTarget.cat} current={editTarget.budget}
          onSave={(amount) => handleSave(editTarget.cat, amount)}
          onClose={() => setEditTarget(null)} />
      )}
    </div>
  )
}
