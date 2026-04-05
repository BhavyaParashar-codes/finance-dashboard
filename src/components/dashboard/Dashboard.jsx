import React from 'react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import SummaryCards from './SummaryCards'
import BalanceTrend from './BalanceTrend'
import SpendingBreakdown from './SpendingBreakdown'
import RecentTransactions from './RecentTransactions'
import { getSummary, getSpendingByCategory } from '../../utils/helpers'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function Dashboard() {
  const { transactions } = useStore()
  const summary = getSummary(transactions)
  const spendingData = getSpendingByCategory(transactions)

  return (
    <div className="space-y-5">
      {/* Summary cards — staggered via SummaryCards internal variants */}
      <SummaryCards summary={summary} />

      {/* Charts row */}
      <motion.div
        custom={0.15}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-5 gap-5"
      >
        <div className="lg:col-span-3">
          <BalanceTrend />
        </div>
        <div className="lg:col-span-2">
          <SpendingBreakdown data={spendingData} />
        </div>
      </motion.div>

      {/* Recent transactions */}
      <motion.div
        custom={0.25}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <RecentTransactions transactions={transactions} />
      </motion.div>
    </div>
  )
}
