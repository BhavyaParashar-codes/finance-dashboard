import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, X, TrendingUp, TrendingDown, Landmark, CreditCard } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts'
import { toast } from 'sonner'
import useStore from '../../store/useStore'
import { formatCurrency } from '../../utils/helpers'
import { useCountUp } from '../../hooks/useCountUp'

const ASSET_CATEGORIES = ['cash', 'investment', 'physical', 'property', 'other']
const LIABILITY_CATEGORIES = ['credit', 'loan', 'mortgage', 'other']

const ASSET_COLORS = { cash: '#007C89', investment: '#43A047', physical: '#F6A623', property: '#5C6BC0', other: '#78909C' }
const LIABILITY_COLORS = { credit: '#E05C5C', loan: '#EF5350', mortgage: '#AB47BC', other: '#78909C' }

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } }

function NetWorthDisplay({ value, currency }) {
  const animated = useCountUp(Math.abs(value), 1200)
  return (
    <span className={`text-4xl font-bold font-mono tracking-tight ${value >= 0 ? 'text-teal' : 'text-red-500'}`}>
      {value < 0 ? '−' : ''}₹{animated.toLocaleString('en-IN')}
    </span>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-800 border border-border dark:border-navy-700 rounded-xl shadow-glass p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-navy dark:text-white mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-navy-400 capitalize text-xs">{p.dataKey}:</span>
          <span className="font-medium text-navy dark:text-white ml-auto pl-2 text-xs font-mono">
            {formatCurrency(p.value, true)}
          </span>
        </div>
      ))}
    </div>
  )
}

function ItemRow({ item, colors, onEdit, onDelete, isAdmin }) {
  const color = colors[item.category] || '#78909C'
  return (
    <motion.div variants={itemVariants}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface dark:hover:bg-navy-700/50 group transition-colors">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-sm text-navy dark:text-white flex-1 truncate">{item.name}</span>
      <span className="text-xs text-navy-400 dark:text-navy-400 capitalize hidden sm:block">{item.category}</span>
      <span className="text-sm font-semibold font-mono text-navy dark:text-white">
        {formatCurrency(item.value, true)}
      </span>
      {isAdmin && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)}
            className="p-1 rounded-lg hover:bg-teal/10 text-navy-400 hover:text-teal transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(item.id)}
            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-navy-400 hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </motion.div>
  )
}

function ItemModal({ type, item, onClose, onSave }) {
  const isEdit = !!item
  const categories = type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES
  const [form, setForm] = useState({
    name: item?.name || '',
    value: item?.value?.toString() || '',
    category: item?.category || categories[0],
  })
  const valid = form.name.trim() && Number(form.value) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white dark:bg-navy-800 rounded-2xl border border-border dark:border-navy-700 shadow-glass w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy dark:text-white capitalize">
            {isEdit ? 'Edit' : 'Add'} {type}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface dark:hover:bg-navy-700 text-navy-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <input type="text" placeholder="Name (e.g. Savings Account)" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input type="number" placeholder="Value (₹)" value={form.value} min="0"
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal capitalize">
            {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={() => valid && onSave({ ...form, value: Number(form.value) })}
            disabled={!valid}
            className={`btn-primary flex-1 justify-center ${!valid ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isEdit ? 'Save' : 'Add'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function NetWorth() {
  const { assets, liabilities, netWorthHistory, addAsset, updateAsset, deleteAsset,
    addLiability, updateLiability, deleteLiability, role, currency } = useStore()
  const [modal, setModal] = useState(null)

  const totalAssets = assets.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0)
  const netWorth = totalAssets - totalLiabilities
  const prevNetWorth = netWorthHistory[netWorthHistory.length - 2]?.netWorth || 0
  const change = netWorth - prevNetWorth
  const changePct = prevNetWorth > 0 ? ((change / prevNetWorth) * 100).toFixed(1) : 0
  const isAdmin = role === 'admin'

  const handleSave = (data) => {
    const { type, item } = modal
    const isEdit = !!item
    if (type === 'asset') {
      if (isEdit) { updateAsset(item.id, data); toast.success('Asset updated') }
      else { addAsset(data); toast.success('Asset added', { description: data.name }) }
    } else {
      if (isEdit) { updateLiability(item.id, data); toast.success('Liability updated') }
      else { addLiability(data); toast.success('Liability added', { description: data.name }) }
    }
    setModal(null)
  }

  const handleDelete = (type, id) => {
    if (type === 'asset') { deleteAsset(id); toast.error('Asset removed') }
    else { deleteLiability(id); toast.error('Liability removed') }
  }

  return (
    <div className="space-y-5">
      {/* Big net worth number */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-br from-white to-teal/3 dark:from-navy-800 dark:to-teal/5">
        <p className="text-sm text-navy-400 dark:text-navy-300 mb-2">Net Worth</p>
        <NetWorthDisplay value={netWorth} currency={currency} />
        <div className="flex items-center gap-2 mt-2">
          {change >= 0
            ? <TrendingUp size={14} className="text-emerald-500" />
            : <TrendingDown size={14} className="text-red-500" />}
          <span className={`text-sm font-medium ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{formatCurrency(change, true)} ({changePct}%)
          </span>
          <span className="text-xs text-navy-400">vs last month</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-border dark:border-navy-700">
          <div>
            <p className="text-xs text-navy-400 mb-1">Total Assets</p>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalAssets, true, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-navy-400 mb-1">Total Liabilities</p>
            <p className="text-xl font-bold font-mono text-red-500 dark:text-red-400">
              {formatCurrency(totalLiabilities, true, currency)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Net Worth History Chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="card p-5">
        <h3 className="font-semibold text-navy dark:text-white mb-1">Net Worth Trend</h3>
        <p className="text-xs text-navy-400 mb-4">Assets vs Liabilities over 6 months</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={netWorthHistory} barCategoryGap="30%" barGap={3}>
            <defs>
              <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007C89" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#007C89" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#D9E2EC" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#627D98' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="assets" fill="#43A047" radius={[4, 4, 0, 0]} opacity={0.8} name="Assets" />
            <Bar dataKey="liabilities" fill="#EF5350" radius={[4, 4, 0, 0]} opacity={0.8} name="Liabilities" />
            <Bar dataKey="netWorth" fill="#007C89" radius={[4, 4, 0, 0]} name="Net Worth" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Assets + Liabilities side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Assets */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                <Landmark size={16} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy dark:text-white text-sm">Assets</h3>
                <p className="text-xs text-navy-400">{formatCurrency(totalAssets, true, currency)}</p>
              </div>
            </div>
            {isAdmin && (
              <button onClick={() => setModal({ type: 'asset', item: null })}
                className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 transition-colors">
                <Plus size={16} />
              </button>
            )}
          </div>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-1">
            {assets.map((a) => (
              <ItemRow key={a.id} item={a} colors={ASSET_COLORS} isAdmin={isAdmin}
                onEdit={(item) => setModal({ type: 'asset', item })}
                onDelete={(id) => handleDelete('asset', id)} />
            ))}
            {assets.length === 0 && <p className="text-sm text-navy-400 text-center py-6">No assets yet</p>}
          </motion.div>
        </motion.div>

        {/* Liabilities */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20">
                <CreditCard size={16} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-navy dark:text-white text-sm">Liabilities</h3>
                <p className="text-xs text-navy-400">{formatCurrency(totalLiabilities, true, currency)}</p>
              </div>
            </div>
            {isAdmin && (
              <button onClick={() => setModal({ type: 'liability', item: null })}
                className="p-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors">
                <Plus size={16} />
              </button>
            )}
          </div>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-1">
            {liabilities.map((l) => (
              <ItemRow key={l.id} item={l} colors={LIABILITY_COLORS} isAdmin={isAdmin}
                onEdit={(item) => setModal({ type: 'liability', item })}
                onDelete={(id) => handleDelete('liability', id)} />
            ))}
            {liabilities.length === 0 && <p className="text-sm text-navy-400 text-center py-6">No liabilities</p>}
          </motion.div>
        </motion.div>
      </div>

      {modal && (
        <ItemModal type={modal.type} item={modal.item}
          onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  )
}
