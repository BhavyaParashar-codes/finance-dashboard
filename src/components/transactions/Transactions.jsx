import React, { useState } from 'react'
import {
  Search, SortAsc, SortDesc, MoreHorizontal,
  Pencil, Trash2, X, ChevronDown, Download,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import useStore from '../../store/useStore'
import { getFilteredTransactions, formatCurrency, formatDate, exportToCSV } from '../../utils/helpers'
import { CATEGORIES, CATEGORY_COLORS } from '../../data/mockData'

function TypeBadge({ type }) {
  return (
    <span className={`tag ${
      type === 'income'
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      {type === 'income' ? '↑ Income' : '↓ Expense'}
    </span>
  )
}

function CategoryBadge({ category }) {
  return (
    <span className="tag text-white text-xs"
      style={{ background: (CATEGORY_COLORS[category] || '#007C89') + 'CC' }}>
      {category}
    </span>
  )
}

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.025, duration: 0.22 } }),
  exit: { opacity: 0, x: 8, transition: { duration: 0.15 } },
}

export default function Transactions() {
  const { transactions, filters, setFilter, resetFilters, role, openModal, deleteTransaction, currency } = useStore()
  const [activeRow, setActiveRow] = useState(null)
  const isAdmin = role === 'admin'

  const filtered = getFilteredTransactions(transactions, filters)
  const hasFilter = filters.search || filters.type !== 'all' || filters.category !== 'all'

  const toggleSort = (field) => {
    if (filters.sortBy === field) {
      setFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setFilter('sortBy', field)
      setFilter('sortDir', 'desc')
    }
  }

  const handleDelete = (tx) => {
    if (!window.confirm(`Delete "${tx.description}"?`)) return
    deleteTransaction(tx.id)
    toast.error('Transaction deleted', { description: `"${tx.description}" removed.` })
  }

  const handleExport = () => {
    exportToCSV(filtered)
    toast.success('CSV exported', { description: `${filtered.length} transactions downloaded.` })
  }

  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field) return <ChevronDown size={13} className="text-navy-300 opacity-60" />
    return filters.sortDir === 'asc'
      ? <SortAsc size={13} className="text-teal" />
      : <SortDesc size={13} className="text-teal" />
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input type="text" placeholder="Search transactions…"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700
                         rounded-xl text-navy dark:text-white placeholder-navy-400
                         focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition" />
            {filters.search && (
              <button onClick={() => setFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)}
              className="px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700
                         rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal">
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}
              className="px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700
                         rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal hidden sm:block">
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={handleExport} title="Export current view as CSV"
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm border border-border dark:border-navy-700
                         rounded-xl text-navy-500 dark:text-navy-300 hover:bg-surface dark:hover:bg-navy-700
                         hover:text-navy dark:hover:text-white transition">
              <Download size={15} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <AnimatePresence>
              {hasFilter && (
                <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={resetFilters}
                  className="px-3 py-2.5 text-sm text-navy-400 hover:text-navy border border-border dark:border-navy-700
                             rounded-xl hover:bg-surface dark:hover:bg-navy-700 transition">
                  <X size={15} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60 dark:border-navy-700/60">
          <p className="text-xs text-navy-400">
            Showing <span className="font-semibold text-navy dark:text-white">{filtered.length}</span> of{' '}
            <span className="font-semibold text-navy dark:text-white">{transactions.length}</span> transactions
            {hasFilter && <span className="ml-1.5 text-teal">(filtered)</span>}
          </p>
          {isAdmin && (
            <button onClick={() => openModal({ type: 'add' })} className="btn-primary text-xs py-1.5">
              + Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-navy-700 bg-surface/60 dark:bg-navy-900/40">
                {[
                  { label: 'Date', field: 'date' },
                  { label: 'Description', field: 'description' },
                  { label: 'Category', field: 'category' },
                  { label: 'Type', field: 'type' },
                  { label: 'Amount', field: 'amount' },
                ].map(({ label, field }) => (
                  <th key={field} onClick={() => toggleSort(field)}
                    className="px-4 py-3 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider cursor-pointer select-none group">
                    <span className="flex items-center gap-1.5 group-hover:text-navy dark:group-hover:text-white transition-colors">
                      {label} <SortIcon field={field} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 dark:divide-navy-700/40">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface dark:bg-navy-800 flex items-center justify-center">
                          <Search size={20} className="text-navy-300 dark:text-navy-500" />
                        </div>
                        <div>
                          <p className="font-medium text-navy dark:text-white">No transactions found</p>
                          <p className="text-xs text-navy-400 mt-0.5">Try adjusting your filters</p>
                        </div>
                        {hasFilter && (
                          <button onClick={resetFilters} className="btn-primary text-xs py-1.5">Clear Filters</button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filtered.map((tx, i) => (
                    <motion.tr key={tx.id} custom={i}
                      variants={rowVariants} initial="hidden" animate="visible" exit="exit" layout
                      className="group"
                      style={{
                        backgroundColor: activeRow === tx.id ? 'rgba(0,124,137,0.04)' : undefined,
                        transition: 'background-color 0.12s',
                      }}
                      onMouseEnter={() => setActiveRow(tx.id)}
                      onMouseLeave={() => setActiveRow(null)}>
                      <td className="px-4 py-3.5 text-navy-500 dark:text-navy-300 font-mono text-xs whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-navy dark:text-white">{tx.description}</span>
                      </td>
                      <td className="px-4 py-3.5"><CategoryBadge category={tx.category} /></td>
                      <td className="px-4 py-3.5"><TypeBadge type={tx.type} /></td>
                      <td className="px-4 py-3.5">
                        <span className={`font-semibold font-mono ${
                          tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                        }`}>
                          {tx.type === 'income' ? '+' : '−'}{formatCurrency(Math.abs(tx.amount), false, currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {isAdmin ? (
                          <div className="flex items-center gap-1 transition-all duration-200"
                            style={{ opacity: activeRow === tx.id ? 1 : 0 }}>
                            <button onClick={() => openModal({ type: 'edit', data: tx })} title="Edit"
                              className="p-1.5 rounded-lg hover:bg-teal/10 text-navy-400 hover:text-teal transition-colors">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(tx)} title="Delete"
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-navy-400 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <MoreHorizontal size={15} className="text-navy-300 transition-opacity duration-200"
                            style={{ opacity: activeRow === tx.id ? 1 : 0 }} />
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
