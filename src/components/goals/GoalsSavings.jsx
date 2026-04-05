import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Target, Clock, Zap, CheckCircle2, X, Calendar, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import useStore from '../../store/useStore'
import { formatCurrency, getDaysUntil, getMonthsUntil } from '../../utils/helpers'

const GOAL_ICONS = ['🎯', '✈️', '🛡️', '💻', '🏠', '🚗', '💍', '📚', '🎓', '💰', '🌴', '🏋️']
const GOAL_COLORS = ['#007C89', '#AB47BC', '#F6A623', '#43A047', '#EF5350', '#5C6BC0', '#26A69A', '#E05C5C']

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

// Format number string with Indian commas as you type
function formatInputWithCommas(val) {
  const num = val.replace(/,/g, '')
  if (!num || isNaN(Number(num))) return val
  return Number(num).toLocaleString('en-IN')
}

function stripCommas(val) {
  return val.replace(/,/g, '')
}

function GoalCard({ goal, currency, onDelete, onContribute, onUpdateDeadline, isAdmin }) {
  const pct = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0
  const remaining = goal.target - goal.saved
  const daysLeft = getDaysUntil(goal.deadline)
  const monthsLeft = getMonthsUntil(goal.deadline)
  const monthlyNeeded = monthsLeft > 0 ? remaining / monthsLeft : remaining
  const isComplete = pct >= 100
  const isUrgent = daysLeft <= 30 && daysLeft >= 0 && !isComplete
  const [editingDeadline, setEditingDeadline] = useState(false)
  const [deadlineVal, setDeadlineVal] = useState(goal.deadline)

  const MILESTONES = [25, 50, 75, 100]

  const handleDeadlineSave = () => {
    if (!deadlineVal) return
    onUpdateDeadline(goal.id, deadlineVal)
    setEditingDeadline(false)
    toast.success('Deadline updated', {
      description: `${goal.icon} ${goal.name} → ${new Date(deadlineVal).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    })
  }

  return (
    <motion.div variants={cardVariants}
      className={`card p-5 hover:shadow-card-hover transition-shadow duration-200 relative overflow-hidden
        ${isComplete ? 'ring-1 ring-emerald-200 dark:ring-emerald-800/50' : ''}
        ${isUrgent ? 'ring-1 ring-amber-200 dark:ring-amber-800/50' : ''}`}>

      {isComplete && (
        <div className="absolute top-3 right-12">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={10} /> Complete!
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: goal.color + '22' }}>
          {goal.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-navy dark:text-white truncate">{goal.name}</h3>

          {/* Editable deadline row */}
          {editingDeadline ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input type="date" value={deadlineVal}
                onChange={(e) => setDeadlineVal(e.target.value)}
                className="text-xs px-2 py-1 bg-surface dark:bg-navy-900 border border-teal rounded-lg text-navy dark:text-white focus:outline-none focus:ring-1 focus:ring-teal"
                autoFocus
              />
              <button onClick={handleDeadlineSave}
                className="p-1 rounded-lg bg-teal text-white hover:bg-teal-600 transition-colors">
                <CheckCircle2 size={12} />
              </button>
              <button onClick={() => { setEditingDeadline(false); setDeadlineVal(goal.deadline) }}
                className="p-1 rounded-lg hover:bg-surface dark:hover:bg-navy-700 text-navy-400 transition-colors">
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5 group/deadline">
              <Clock size={11} className={isUrgent ? 'text-amber-500' : daysLeft < 0 ? 'text-red-400' : 'text-navy-400'} />
              <span className={`text-xs ${
                isUrgent ? 'text-amber-500 font-medium'
                : daysLeft < 0 ? 'text-red-400'
                : 'text-navy-400 dark:text-navy-400'
              }`}>
                {daysLeft < 0 ? 'Deadline passed' : daysLeft === 0 ? 'Due today!' : `${daysLeft} days left`}
              </span>
              {isAdmin && (
                <button
                  onClick={() => setEditingDeadline(true)}
                  title="Edit deadline"
                  className="opacity-0 group-hover/deadline:opacity-100 transition-opacity p-0.5 rounded hover:bg-surface dark:hover:bg-navy-700 text-navy-400 hover:text-teal">
                  <Edit2 size={10} />
                </button>
              )}
            </div>
          )}
        </div>
        {isAdmin && (
          <button onClick={() => onDelete(goal.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-navy-400 hover:text-red-500 transition-colors flex-shrink-0">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Amount display */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-2xl font-bold font-mono text-navy dark:text-white">
            {formatCurrency(goal.saved, true, currency)}
          </p>
          <p className="text-xs text-navy-400 dark:text-navy-400 mt-0.5">
            of {formatCurrency(goal.target, true, currency)} goal
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold" style={{ color: goal.color }}>{pct.toFixed(1)}%</p>
          {!isComplete && (
            <p className="text-xs text-navy-400">{formatCurrency(remaining, true, currency)} to go</p>
          )}
        </div>
      </div>

      {/* Progress bar with milestones */}
      <div className="relative mb-4">
        <div className="h-3 bg-border dark:bg-navy-700 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: `linear-gradient(90deg, ${goal.color}99, ${goal.color})` }}
          />
        </div>
        {MILESTONES.map((m) => (
          <div key={m} className="absolute top-0 h-3 flex items-center"
            style={{ left: `${m}%`, transform: 'translateX(-50%)' }}>
            <div className={`w-0.5 h-3 ${pct >= m ? 'bg-white/60' : 'bg-navy-300 dark:bg-navy-600'}`} />
          </div>
        ))}
      </div>

      {/* Milestone badges */}
      <div className="flex gap-1.5 mb-4">
        {MILESTONES.map((m) => (
          <div key={m}
            className={`flex-1 text-center py-1 rounded-lg text-[10px] font-semibold transition-all duration-300
              ${pct >= m ? 'text-white' : 'bg-surface dark:bg-navy-900 text-navy-400 dark:text-navy-500'}`}
            style={pct >= m ? { background: goal.color } : {}}>
            {m}%
          </div>
        ))}
      </div>

      {/* Monthly target hint */}
      {!isComplete && monthsLeft > 0 && (
        <div className="bg-surface dark:bg-navy-900/60 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-teal flex-shrink-0" />
            <p className="text-xs text-navy-500 dark:text-navy-300">
              Save <span className="font-semibold text-navy dark:text-white">{formatCurrency(monthlyNeeded, true, currency)}/mo</span> to reach your goal on time
            </p>
          </div>
        </div>
      )}

      {/* Contribute button */}
      {isAdmin && !isComplete && (
        <button onClick={() => onContribute(goal)}
          className="w-full btn-primary justify-center text-xs py-2"
          style={{ background: goal.color }}>
          + Add Contribution
        </button>
      )}
    </motion.div>
  )
}

function AddGoalModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '', target: '', saved: '0', icon: '🎯', color: GOAL_COLORS[0],
    deadline: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  })
  const valid = form.name.trim() && Number(stripCommas(form.target)) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white dark:bg-navy-800 rounded-2xl border border-border dark:border-navy-700 shadow-glass w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-navy-700">
          <h2 className="font-semibold text-navy dark:text-white">New Goal</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface dark:hover:bg-navy-700 text-navy-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          {/* Icon picker */}
          <div>
            <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((ic) => (
                <button key={ic} onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                  className={`w-9 h-9 rounded-xl text-lg transition-all ${form.icon === ic ? 'ring-2 ring-teal bg-teal/10 scale-110' : 'hover:bg-surface dark:hover:bg-navy-700'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-2">Color</label>
            <div className="flex gap-2">
              {GOAL_COLORS.map((c) => (
                <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-navy-800' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-1.5">Goal Name</label>
            <input type="text" placeholder="e.g. Emergency Fund"
              value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-1.5">Target Amount (₹)</label>
              <input type="text" inputMode="numeric" placeholder="e.g. 1,00,000"
                value={form.target}
                onChange={(e) => setForm((f) => ({ ...f, target: formatInputWithCommas(e.target.value) }))}
                className="w-full px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-1.5">Already Saved (₹)</label>
              <input type="text" inputMode="numeric" placeholder="0"
                value={form.saved}
                onChange={(e) => setForm((f) => ({ ...f, saved: formatInputWithCommas(e.target.value) }))}
                className="w-full px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-1.5 flex items-center gap-1.5">
              <Calendar size={12} /> Target Date
            </label>
            <input type="date" value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-border dark:border-navy-700">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button
            onClick={() => valid && onAdd({
              ...form,
              target: Number(stripCommas(form.target)),
              saved: Number(stripCommas(form.saved)) || 0,
            })}
            disabled={!valid}
            className={`btn-primary flex-1 justify-center ${!valid ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Create Goal
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function ContributeModal({ goal, currency, onClose, onConfirm }) {
  const [displayVal, setDisplayVal] = useState('')

  const numericVal = Number(stripCommas(displayVal))
  const valid = !isNaN(numericVal) && numericVal > 0

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, '')
    if (raw === '' || /^\d+$/.test(raw)) {
      setDisplayVal(raw === '' ? '' : Number(raw).toLocaleString('en-IN'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-navy-800 rounded-2xl border border-border dark:border-navy-700 shadow-glass w-full max-w-sm p-6">
        <h3 className="font-semibold text-navy dark:text-white mb-1">Add Contribution</h3>
        <p className="text-xs text-navy-400 mb-4">{goal.icon} {goal.name}</p>

        <div className="relative mb-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm font-medium select-none">₹</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={displayVal}
            onChange={handleChange}
            autoFocus
            className="w-full pl-7 pr-4 py-3 text-lg font-semibold font-mono bg-surface dark:bg-navy-900 border border-border dark:border-navy-700
                       rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>

        {/* Live formatted preview */}
        {valid && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="text-xs text-navy-400 mb-4 text-center">
            {formatCurrency(numericVal, false, currency)}
            {goal.target > 0 && (
              <span className="ml-1">
                · {Math.min(((goal.saved + numericVal) / goal.target * 100), 100).toFixed(1)}% of goal
              </span>
            )}
          </motion.p>
        )}

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={() => valid && onConfirm(numericVal)}
            disabled={!valid}
            className={`btn-primary flex-1 justify-center ${!valid ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={valid ? { background: goal.color } : {}}>
            Add {valid ? formatCurrency(numericVal, true, currency) : '₹0'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function GoalsSavings() {
  const { goals, addGoal, deleteGoal, contributeToGoal, updateGoal, role, currency } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [contributeTarget, setContributeTarget] = useState(null)
  const isAdmin = role === 'admin'

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target, 0)
  const completed = goals.filter((g) => g.saved >= g.target).length

  const handleAdd = (data) => {
    addGoal(data)
    toast.success('Goal created!', {
      description: `${data.icon} ${data.name} — target ${formatCurrency(data.target, true, currency)}`,
    })
    setShowAdd(false)
  }

  const handleDelete = (id) => {
    const g = goals.find((g) => g.id === id)
    deleteGoal(id)
    toast.error('Goal deleted', { description: g?.name })
  }

  const handleContribute = (amount) => {
    const goal = goals.find((g) => g.id === contributeTarget.id)
    contributeToGoal(contributeTarget.id, amount)
    const newSaved = (goal?.saved || 0) + amount
    const isNowComplete = newSaved >= (goal?.target || Infinity)
    toast.success(isNowComplete ? '🎉 Goal completed!' : 'Contribution added!', {
      description: `+${formatCurrency(amount, true, currency)} to ${contributeTarget.name}`,
    })
    setContributeTarget(null)
  }

  const handleUpdateDeadline = (id, deadline) => {
    updateGoal(id, { deadline })
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Saved', value: formatCurrency(totalSaved, true, currency), color: 'text-teal' },
          { label: 'Total Target', value: formatCurrency(totalTarget, true, currency), color: 'text-navy dark:text-white' },
          { label: 'Goals Completed', value: `${completed} / ${goals.length}`, color: completed > 0 ? 'text-emerald-500' : 'text-navy dark:text-white' },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-xs text-navy-400 mb-1">{item.label}</p>
            <p className={`text-xl font-bold font-mono ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-navy-400 uppercase tracking-widest">Your Goals</h2>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-1.5">
            <Plus size={14} /> New Goal
          </button>
        )}
      </div>

      {goals.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <Target size={32} className="text-navy-300 dark:text-navy-600" />
          <p className="font-medium text-navy dark:text-white">No goals yet</p>
          <p className="text-sm text-navy-400">Switch to Admin and create your first goal</p>
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
          variants={containerVariants} initial="hidden" animate="visible">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} currency={currency}
              onDelete={handleDelete}
              onContribute={setContributeTarget}
              onUpdateDeadline={handleUpdateDeadline}
              isAdmin={isAdmin} />
          ))}
        </motion.div>
      )}

      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {contributeTarget && (
        <ContributeModal goal={contributeTarget} currency={currency}
          onClose={() => setContributeTarget(null)} onConfirm={handleContribute} />
      )}
    </div>
  )
}
