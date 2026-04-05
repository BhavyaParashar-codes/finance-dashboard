import React, { useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, AlertTriangle, TrendingUp, Target, CheckCircle, ExternalLink } from 'lucide-react'
import useStore from '../../store/useStore'
import { getSpendingByCategory, formatCurrency, getDaysUntil } from '../../utils/helpers'

export function useAlerts() {
  const { transactions, budgets, goals, dismissedAlerts } = useStore()
  return useMemo(() => {
    const alerts = []
    const spending = getSpendingByCategory(transactions)
    const spendMap = Object.fromEntries(spending.map((s) => [s.name, s.value]))

    // Budget alerts
    Object.entries(budgets).forEach(([cat, limit]) => {
      const spent = spendMap[cat] || 0
      const pct = limit > 0 ? (spent / limit) * 100 : 0
      if (pct >= 100) {
        alerts.push({
          id: `budget-over-${cat}`,
          type: 'error',
          icon: AlertTriangle,
          title: `${cat} budget exceeded`,
          description: `Spent ${formatCurrency(spent, true)} of ${formatCurrency(limit, true)} budget`,
          action: 'View Budget',
          page: 'budget',
        })
      } else if (pct >= 80) {
        alerts.push({
          id: `budget-warn-${cat}`,
          type: 'warning',
          icon: TrendingUp,
          title: `${cat} at ${Math.round(pct)}% of budget`,
          description: `${formatCurrency(limit - spent, true)} remaining this month`,
          action: 'View Budget',
          page: 'budget',
        })
      }
    })

    // Goal alerts
    goals.forEach((goal) => {
      const days = getDaysUntil(goal.deadline)
      const pct = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0
      if (pct >= 100) {
        alerts.push({
          id: `goal-complete-${goal.id}`,
          type: 'success',
          icon: CheckCircle,
          title: `🎉 Goal "${goal.name}" completed!`,
          description: `You've reached your ${formatCurrency(goal.target, true)} target!`,
          action: 'View Goals',
          page: 'goals',
        })
      } else if (days <= 30 && days >= 0) {
        alerts.push({
          id: `goal-urgent-${goal.id}`,
          type: 'warning',
          icon: Target,
          title: `${goal.icon} "${goal.name}" deadline soon`,
          description: `${days} days left — ${formatCurrency(goal.target - goal.saved, true)} still needed`,
          action: 'View Goals',
          page: 'goals',
        })
      }
    })

    return alerts.filter((a) => !dismissedAlerts.includes(a.id))
  }, [transactions, budgets, goals, dismissedAlerts])
}

const TYPE_STYLES = {
  error:   { bg: 'bg-red-50 dark:bg-red-900/20',   border: 'border-red-100 dark:border-red-900/30',   icon: 'text-red-500',    dot: 'bg-red-500' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-900/30', icon: 'text-amber-500', dot: 'bg-amber-500' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-900/30', icon: 'text-emerald-500', dot: 'bg-emerald-500' },
}

export default function AlertsCenter({ open, onClose }) {
  const { dismissAlert, setActivePage } = useStore()
  const alerts = useAlerts()
  const ref = useRef(null)

  // Dismiss every currently visible alert one by one
  const handleClearAll = () => alerts.forEach((a) => dismissAlert(a.id))

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-navy-800 border border-border dark:border-navy-700
                     rounded-2xl shadow-glass z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-navy-700">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-navy-500 dark:text-navy-300" />
              <span className="font-semibold text-sm text-navy dark:text-white">Alerts</span>
              {alerts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                  {alerts.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {alerts.length > 0 && (
                <button onClick={handleClearAll}
                  className="text-xs text-navy-400 hover:text-teal transition-colors">
                  Clear all
                </button>
              )}
              <button onClick={onClose}
                className="p-1 rounded-lg hover:bg-surface dark:hover:bg-navy-700 text-navy-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Alert list */}
          <div className="max-h-80 overflow-y-auto scrollbar-none">
            <AnimatePresence>
              {alerts.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-2 py-10 text-center px-4">
                  <CheckCircle size={28} className="text-emerald-400" />
                  <p className="font-medium text-sm text-navy dark:text-white">All clear!</p>
                  <p className="text-xs text-navy-400">No budget overruns or urgent goals.</p>
                </motion.div>
              ) : (
                alerts.map((alert, i) => {
                  const s = TYPE_STYLES[alert.type]
                  const Icon = alert.icon
                  return (
                    <motion.div key={alert.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16, height: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      className={`px-4 py-3 border-b border-border/50 dark:border-navy-700/50 last:border-0 ${s.bg}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${s.bg} flex-shrink-0 mt-0.5`}>
                          <Icon size={14} className={s.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-navy dark:text-white leading-snug">{alert.title}</p>
                          <p className="text-[11px] text-navy-400 dark:text-navy-400 mt-0.5 leading-relaxed">{alert.description}</p>
                          <button
                            onClick={() => { setActivePage(alert.page); onClose() }}
                            className="mt-1.5 text-[11px] font-medium text-teal hover:text-teal-600 flex items-center gap-1 transition-colors">
                            {alert.action} <ExternalLink size={10} />
                          </button>
                        </div>
                        <button onClick={() => dismissAlert(alert.id)}
                          className="p-0.5 text-navy-400 hover:text-navy dark:hover:text-white transition-colors flex-shrink-0">
                          <X size={12} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}