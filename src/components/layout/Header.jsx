import React, { useState } from 'react'
import { Menu, Moon, Sun, Download, Plus, Bell, Upload, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import useStore from '../../store/useStore'
import { exportToCSV, getFilteredTransactions } from '../../utils/helpers'
import AlertsCenter, { useAlerts } from '../alerts/AlertsCenter'
import CSVImportModal from '../import/CSVImportModal'

const PAGE_TITLES = {
  dashboard: 'Overview',
  transactions: 'Transactions',
  insights: 'Insights',
  budget: 'Budget Planner',
  goals: 'Goals & Savings',
  networth: 'Net Worth',
}

const CURRENCIES = ['INR', 'USD', 'EUR']

export default function Header({ onMenuClick }) {
  const { role, setRole, darkMode, toggleDarkMode, transactions, filters,
    openModal, activePage, currency, setCurrency } = useStore()
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const alerts = useAlerts()
  const isAdmin = role === 'admin'

  const handleExport = () => {
    const toExport = activePage === 'transactions'
      ? getFilteredTransactions(transactions, filters)
      : transactions
    exportToCSV(toExport)
    toast.success('CSV downloaded', {
      description: `${toExport.length} transaction${toExport.length !== 1 ? 's' : ''} exported.`,
    })
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-border/60 dark:border-navy-700/60">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            {/* Hamburger: on mobile (no rail) always show; on sm+ rail handles it so hide */}
            <button onClick={onMenuClick}
              className="sm:hidden p-2 rounded-xl hover:bg-surface dark:hover:bg-navy-700 text-navy-500 hover:text-navy dark:hover:text-white transition-colors">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-navy dark:text-white leading-tight">
                {PAGE_TITLES[activePage] || 'Dashboard'}
              </h1>
              <p className="text-xs text-navy-400 hidden sm:block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Role toggle */}
            <div className="segmented-control">
              {['viewer', 'admin'].map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  className={`segmented-btn capitalize ${role === r ? 'active' : ''}`}>
                  {r}
                </button>
              ))}
            </div>

            {/* Currency picker */}
            <div className="relative">
              <button onClick={() => { setCurrencyOpen(!currencyOpen); setAlertsOpen(false) }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-border dark:hover:bg-navy-700
                           text-navy-500 dark:text-navy-300 hover:text-navy dark:hover:text-white transition-colors text-sm font-medium"
                title="Change currency">
                <Globe size={15} />
                <span className="hidden sm:inline">{currency}</span>
              </button>
              <AnimatePresence>
                {currencyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 bg-white dark:bg-navy-800 border border-border dark:border-navy-700 rounded-xl shadow-glass z-50 overflow-hidden py-1 min-w-[80px]">
                    {CURRENCIES.map((c) => (
                      <button key={c} onClick={() => { setCurrency(c); setCurrencyOpen(false); toast.success(`Currency changed to ${c}`) }}
                        className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors
                          ${c === currency
                            ? 'text-teal bg-teal/5'
                            : 'text-navy-500 dark:text-navy-300 hover:bg-surface dark:hover:bg-navy-700 hover:text-navy dark:hover:text-white'}`}>
                        {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark mode */}
            <button onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-border text-navy-400 hover:text-navy dark:hover:bg-navy-700 dark:hover:text-white transition-colors"
              title="Toggle dark mode">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Export */}
            <button onClick={handleExport}
              className="p-2 rounded-xl hover:bg-border text-navy-400 hover:text-navy dark:hover:bg-navy-700 dark:hover:text-white transition-colors hidden sm:flex"
              title="Export CSV">
              <Download size={18} />
            </button>

            {/* CSV Import (admin only) */}
            {isAdmin && (
              <button
                onClick={() => setImportOpen(true)}
                className="p-2 rounded-xl hover:bg-border text-navy-400 hover:text-navy dark:hover:bg-navy-700 dark:hover:text-white transition-colors hidden sm:flex"
                title="Import CSV">
                <Upload size={18} />
              </button>
            )}

            {/* Alerts bell */}
            <div className="relative">
              <button
                onClick={() => { setAlertsOpen(!alertsOpen); setCurrencyOpen(false) }}
                className="relative p-2 rounded-xl hover:bg-border text-navy-400 hover:text-navy dark:hover:bg-navy-700 dark:hover:text-white transition-colors"
                title="Alerts">
                <Bell size={18} />
                <AnimatePresence>
                  {alerts.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {alerts.length > 9 ? '9+' : alerts.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <AlertsCenter open={alertsOpen} onClose={() => setAlertsOpen(false)} />
            </div>

            {/* Add transaction (admin only) */}
            <div className="transition-all duration-300"
              style={{
                opacity: isAdmin ? 1 : 0,
                pointerEvents: isAdmin ? 'auto' : 'none',
                transform: isAdmin ? 'scale(1)' : 'scale(0.9)',
              }}>
              <button onClick={() => openModal({ type: 'add' })} className="btn-primary">
                <Plus size={16} />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CSV Import modal */}
      <AnimatePresence>
        {importOpen && <CSVImportModal onClose={() => setImportOpen(false)} />}
      </AnimatePresence>
    </>
  )
}