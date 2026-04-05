import React from 'react'
import { ArrowRight, Calendar, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { CATEGORY_COLORS, MONTHLY_DATA } from '../../data/mockData'

const MONTH_MAP = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

export default function RecentTransactions({ transactions }) {
  const { setActivePage, selectedMonth, setSelectedMonth, currency } = useStore()

  const filtered = selectedMonth
    ? transactions.filter((tx) => new Date(tx.date).getMonth() === MONTH_MAP[selectedMonth])
    : transactions

  const displayed = filtered.slice(0, 6)
  const monthData = selectedMonth ? MONTHLY_DATA.find((m) => m.month === selectedMonth) : null

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-navy dark:text-white">
            {selectedMonth ? `${selectedMonth} Transactions` : 'Recent Transactions'}
          </h3>
          <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">
            {selectedMonth
              ? `${filtered.length} transaction${filtered.length !== 1 ? 's' : ''} in ${selectedMonth}`
              : 'Latest activity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedMonth && (
            <button onClick={() => setSelectedMonth(null)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-teal/10 text-teal hover:bg-teal/20 transition-colors font-medium">
              <Calendar size={12} />{selectedMonth}<X size={11} />
            </button>
          )}
          <button onClick={() => setActivePage('transactions')}
            className="text-xs text-teal hover:text-teal-600 font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {monthData && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-2 p-3 bg-surface dark:bg-navy-900/50 rounded-xl">
              {[
                { label: 'Income', value: monthData.income, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Expenses', value: monthData.expenses, color: 'text-red-500 dark:text-red-400' },
                { label: 'Balance', value: monthData.balance, color: 'text-teal' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-navy-400 dark:text-navy-400">{label}</p>
                  <p className={`text-sm font-semibold font-mono ${color}`}>
                    {formatCurrency(value, true, currency)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {displayed.length === 0 ? (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-navy-400 py-8 text-sm">
              No transactions {selectedMonth ? `in ${selectedMonth}` : 'yet'}
            </motion.p>
          ) : (
            displayed.map((tx, i) => (
              <motion.div key={tx.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.18, delay: i * 0.03 }}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface dark:hover:bg-navy-700/50 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ background: CATEGORY_COLORS[tx.category] || '#007C89', opacity: 0.85 }}>
                  {tx.category[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy dark:text-white truncate">{tx.description}</p>
                  <p className="text-xs text-navy-400 dark:text-navy-400">{formatDate(tx.date)}</p>
                </div>
                <span className={`text-sm font-semibold font-mono flex-shrink-0 ${
                  tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                }`}>
                  {tx.type === 'income' ? '+' : '−'}{formatCurrency(Math.abs(tx.amount), true, currency)}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
