import React from 'react'
import {
  AlertTriangle, TrendingUp, TrendingDown, Award,
  ArrowRight, Zap, PiggyBank,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import { getSummary, getSpendingByCategory, formatCurrency } from '../../utils/helpers'
import { MONTHLY_DATA, PREV_MONTH_CATEGORY_SPEND, CATEGORY_COLORS } from '../../data/mockData'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

function InsightCard({ icon: Icon, iconBg, iconColor, badge, badgeColor, title, description, action, onAction }) {
  return (
    <motion.div variants={cardVariants} className="insight-card">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${iconBg} flex-shrink-0`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          {badge && (
            <span className={`tag mb-2 ${badgeColor}`}>{badge}</span>
          )}
          <h4 className="font-semibold text-navy dark:text-white text-sm">{title}</h4>
          <p className="text-xs text-navy-400 dark:text-navy-300 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-xs font-medium text-teal hover:text-teal-600 flex items-center gap-1 transition-colors mt-1 self-start"
        >
          {action} <ArrowRight size={12} />
        </button>
      )}
    </motion.div>
  )
}

const MonthlyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-800 border border-border dark:border-navy-700 rounded-xl shadow-glass p-3 text-sm">
      <p className="font-semibold text-navy dark:text-white mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-navy-400 dark:text-navy-300 capitalize">{p.dataKey}:</span>
          <span className="font-medium text-navy dark:text-white">{formatCurrency(p.value, true)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Insights() {
  const { transactions, setActivePage, setFilter } = useStore()
  const summary = getSummary(transactions)
  const spendingByCategory = getSpendingByCategory(transactions)

  const topCategory = spendingByCategory[0]
  const prevSpend = topCategory ? PREV_MONTH_CATEGORY_SPEND[topCategory.name] : 0
  const pctChange = prevSpend ? Math.round(((topCategory?.value - prevSpend) / prevSpend) * 100) : 0
  const savingsRate = summary.income > 0 ? Math.round((summary.balance / summary.income) * 100) : 0

  const currentMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1]
  const lastMonth = MONTHLY_DATA[MONTHLY_DATA.length - 2]
  const expenseDiff = currentMonth.expenses - lastMonth.expenses
  const comparisonData = MONTHLY_DATA.slice(-3)

  const navigateToCategory = (category) => {
    setFilter('category', category)
    setActivePage('transactions')
  }

  const cards = [
    topCategory && pctChange > 10 && {
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-500',
      badge: 'Spending Alert',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      title: `${topCategory.name} is up ${pctChange}%`,
      description: `Your '${topCategory.name}' spending (${formatCurrency(topCategory.value, true)}) is ${pctChange}% higher than last month.`,
      action: `View ${topCategory.name} Transactions`,
      onAction: () => navigateToCategory(topCategory.name),
    },
    {
      icon: savingsRate >= 20 ? Award : TrendingDown,
      iconBg: savingsRate >= 20 ? 'bg-teal/10' : 'bg-red-50 dark:bg-red-900/20',
      iconColor: savingsRate >= 20 ? 'text-teal' : 'text-red-500',
      badge: savingsRate >= 20 ? 'Great Work!' : 'Low Savings',
      badgeColor: savingsRate >= 20
        ? 'bg-teal/10 text-teal dark:bg-teal/20'
        : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      title: `${savingsRate}% Savings Rate This Month`,
      description: savingsRate >= 20
        ? `You're saving ${savingsRate}% of your income — excellent! Keep it up.`
        : `You're only saving ${savingsRate}% of income. Aim for at least 20%.`,
      action: 'Review Expenses',
      onAction: () => { setFilter('type', 'expense'); setActivePage('transactions') },
    },
    {
      icon: expenseDiff > 0 ? TrendingUp : TrendingDown,
      iconBg: expenseDiff > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: expenseDiff > 0 ? 'text-red-500' : 'text-emerald-600',
      badge: 'Monthly Comparison',
      badgeColor: 'bg-surface text-navy-500 dark:bg-navy-700 dark:text-navy-300',
      title: expenseDiff > 0
        ? `Expenses up ${formatCurrency(expenseDiff, true)} vs last month`
        : `Expenses down ${formatCurrency(Math.abs(expenseDiff), true)} vs last month`,
      description: expenseDiff > 0
        ? `You spent ${formatCurrency(expenseDiff, true)} more than last month. Current total: ${formatCurrency(currentMonth.expenses, true)}.`
        : `Great progress! Reduced spending by ${formatCurrency(Math.abs(expenseDiff), true)} vs last month.`,
      action: 'View All Transactions',
      onAction: () => setActivePage('transactions'),
    },
    {
      icon: PiggyBank,
      iconBg: 'bg-violet-50 dark:bg-violet-900/20',
      iconColor: 'text-violet-500',
      badge: 'Top Category',
      badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      title: topCategory ? `${topCategory.name} is your biggest spend` : 'No spending data yet',
      description: topCategory
        ? `${formatCurrency(topCategory.value, true)} on ${topCategory.name} — ${Math.round((topCategory.value / summary.expenses) * 100)}% of total expenses.`
        : 'Start adding transactions to see your spending patterns.',
      action: topCategory ? `Explore ${topCategory.name}` : null,
      onAction: topCategory ? () => navigateToCategory(topCategory.name) : null,
    },
    {
      icon: Zap,
      iconBg: 'bg-teal/10',
      iconColor: 'text-teal',
      badge: 'Quick Insight',
      badgeColor: 'bg-teal/10 text-teal dark:bg-teal/20',
      title: `${spendingByCategory.length} active spending categories`,
      description: `Spending spread across ${spendingByCategory.length} categories. Focused budgets are easier to manage.`,
      action: 'See Breakdown',
      onAction: () => setActivePage('dashboard'),
    },
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs font-semibold text-navy-400 dark:text-navy-400 uppercase tracking-widest mb-3">
          Your Insights
        </h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cards.map((card, i) => (
            <InsightCard key={i} {...card} />
          ))}
        </motion.div>
      </div>

      {/* Monthly Comparison Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="card p-5"
      >
        <div className="mb-4">
          <h3 className="font-semibold text-navy dark:text-white">3-Month Comparison</h3>
          <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">Income vs Expenses over recent months</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={comparisonData} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D9E2EC" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#627D98' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<MonthlyTooltip />} />
            <Bar dataKey="income" fill="#007C89" radius={[6, 6, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#81E6D9" radius={[6, 6, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category progress bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="card p-5"
      >
        <h3 className="font-semibold text-navy dark:text-white mb-4">Spending by Category</h3>
        <div className="space-y-3">
          {spendingByCategory.map((item, idx) => {
            const pct = Math.round((item.value / summary.expenses) * 100)
            const color = CATEGORY_COLORS[item.name] || '#007C89'
            return (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-xs text-navy-500 dark:text-navy-300 w-32 truncate flex-shrink-0">{item.name}</span>
                <div className="flex-1 bg-surface dark:bg-navy-900 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.75, delay: 0.55 + idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    style={{ background: color }}
                  />
                </div>
                <span className="text-xs font-mono font-medium text-navy dark:text-white w-20 text-right flex-shrink-0">
                  {formatCurrency(item.value, true)}
                </span>
                <span className="text-xs text-navy-400 w-8 text-right flex-shrink-0">{pct}%</span>
              </div>
            )
          })}
          {spendingByCategory.length === 0 && (
            <p className="text-sm text-navy-400 text-center py-8">No spending data to display</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
