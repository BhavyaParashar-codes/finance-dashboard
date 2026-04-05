import React from 'react'
import { LayoutDashboard, ArrowLeftRight, Lightbulb, TrendingUp, X, Target, PiggyBank, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import { useAlerts } from '../alerts/AlertsCenter'

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Overview',        icon: LayoutDashboard },
  { id: 'transactions',  label: 'Transactions',    icon: ArrowLeftRight },
  { id: 'budget',        label: 'Budget Planner',  icon: BarChart3 },
  { id: 'goals',         label: 'Goals & Savings', icon: Target },
  { id: 'networth',      label: 'Net Worth',       icon: PiggyBank },
  { id: 'insights',      label: 'Insights',        icon: Lightbulb },
]

export default function Sidebar({ mobile = false, onClose }) {
  const { activePage, setActivePage } = useStore()
  const alerts = useAlerts()

  const handleNav = (id) => {
    setActivePage(id)
    onClose?.()
  }

  return (
    <aside className={`glass-sidebar flex flex-col h-full z-40 ${mobile ? 'w-72' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-teal rounded-xl flex items-center justify-center shadow-sm">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-display text-xl text-navy dark:text-white tracking-tight">Fintrak</span>
        </div>
        {mobile && (
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface text-navy-400 hover:text-navy transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-none">
        <p className="px-3 py-2 text-xs font-medium text-navy-400 uppercase tracking-widest">Menu</p>
        {NAV_ITEMS.map(({ id, label, icon: Icon }, i) => {
          const active = activePage === id
          const isBudget = id === 'budget'
          const alertCount = isBudget ? alerts.filter((a) => a.page === 'budget').length : 0

          return (
            <motion.button
              key={id}
              onClick={() => handleNav(id)}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.055 + 0.08, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${active
                  ? 'bg-teal text-white shadow-sm'
                  : 'text-navy-500 hover:bg-surface hover:text-navy dark:text-navy-200 dark:hover:bg-navy-700'}`}
            >
              <Icon size={17} className={active ? 'text-white' : 'text-navy-400'} />
              <span className="flex-1 text-left">{label}</span>
              {alertCount > 0 && !active && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                  {alertCount}
                </span>
              )}
              {active && (
                <motion.span layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-turquoise flex-shrink-0" />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Footer hint */}
      <div className="px-4 pb-5 flex-shrink-0">
        <div className="bg-teal/8 border border-teal/20 rounded-xl p-3.5">
          <p className="text-xs font-semibold text-teal mb-1">Pro Tip</p>
          <p className="text-xs text-navy-500 dark:text-navy-300 leading-relaxed">
            Click chart elements to cross-filter data instantly.
          </p>
        </div>
      </div>
    </aside>
  )
}
