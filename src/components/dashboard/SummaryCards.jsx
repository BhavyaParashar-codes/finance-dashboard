import React from 'react'
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCountUp } from '../../hooks/useCountUp'
import { formatCurrency, convertAmount } from '../../utils/helpers'
import useStore from '../../store/useStore'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.10 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
}

function StatCard({ title, value, icon: Icon, color, trend, trendLabel, currency }) {
  const converted = convertAmount(Math.abs(value), currency)
  const animated = useCountUp(Math.round(converted), 1400)

  const sym = { INR: '₹', USD: '$', EUR: '€' }[currency] || '₹'

  return (
    <motion.div variants={cardVariants}
      className="card p-5 hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color.bg}`}>
          <Icon size={20} className={color.icon} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend >= 0
              ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <ArrowUpRight size={12} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-navy-400 dark:text-navy-300 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-navy dark:text-white font-mono tracking-tight">
          {value < 0 ? '−' : ''}{sym}{animated.toLocaleString('en-IN')}
        </p>
        {trendLabel && (
          <p className="text-xs text-navy-400 dark:text-navy-400 mt-1">{trendLabel}</p>
        )}
      </div>
    </motion.div>
  )
}

export default function SummaryCards({ summary }) {
  const { currency } = useStore()

  const cards = [
    {
      title: 'Total Balance',
      value: summary.balance,
      icon: Wallet,
      color: { bg: 'bg-teal/10', icon: 'text-teal' },
      trend: 12,
      trendLabel: 'vs. last month',
    },
    {
      title: 'Total Income',
      value: summary.income,
      icon: TrendingUp,
      color: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600' },
      trend: 8,
      trendLabel: 'vs. last month',
    },
    {
      title: 'Total Expenses',
      value: summary.expenses,
      icon: TrendingDown,
      color: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-500' },
      trend: -3,
      trendLabel: 'vs. last month',
    },
  ]

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => (
        <StatCard key={card.title} {...card} currency={currency} />
      ))}
    </motion.div>
  )
}
