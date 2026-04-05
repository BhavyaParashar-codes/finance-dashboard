import React, { useState, useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/mockData'

function FieldError({ msg }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="text-xs text-red-500 mt-1"
        >
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

export default function TransactionModal() {
  const { modal, closeModal, addTransaction, updateTransaction } = useStore()
  const isEdit = modal?.type === 'edit'
  const tx = modal?.data

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: CATEGORIES[0],
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (modal) {
      if (isEdit && tx) {
        setForm({
          description: tx.description,
          amount: Math.abs(tx.amount).toString(),
          category: tx.category,
          type: tx.type,
          date: tx.date,
        })
      } else {
        setForm({
          description: '',
          amount: '',
          category: CATEGORIES[0],
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
        })
      }
      setErrors({})
      setTouched({})
    }
  }, [modal?.type, tx?.id])

  const validate = (f = form) => {
    const e = {}
    if (!f.description.trim()) e.description = 'Description is required'
    if (!f.amount || isNaN(Number(f.amount)) || Number(f.amount) <= 0)
      e.amount = 'Enter a valid positive amount'
    if (!f.date) e.date = 'Date is required'
    return e
  }

  const isFormValid = Object.keys(validate()).length === 0

  const touch = (key) => setTouched((t) => ({ ...t, [key]: true }))

  const handleChange = (key, value) => {
    const next = { ...form, [key]: value }
    setForm(next)
    if (touched[key]) {
      setErrors(validate(next))
    }
  }

  const handleSubmit = () => {
    setTouched({ description: true, amount: true, date: true })
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const payload = {
      ...form,
      amount: form.type === 'expense'
        ? -Math.abs(Number(form.amount))
        : Math.abs(Number(form.amount)),
    }

    if (isEdit) {
      updateTransaction(tx.id, payload)
      toast.success('Transaction updated', {
        description: `"${form.description}" has been saved.`,
        icon: <CheckCircle size={16} />,
      })
    } else {
      addTransaction(payload)
      toast.success('Transaction added', {
        description: `"${form.description}" — ${form.type === 'expense' ? '−' : '+'}₹${Number(form.amount).toLocaleString('en-IN')}`,
        icon: <CheckCircle size={16} />,
      })
    }
    closeModal()
  }

  const inputClass = (key) =>
    `w-full px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border rounded-xl
     text-navy dark:text-white placeholder-navy-400
     focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition
     ${errors[key] && touched[key] ? 'border-red-400' : 'border-border dark:border-navy-700'}`

  if (!modal) return null

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="absolute inset-0 bg-navy/30 dark:bg-navy-900/60 backdrop-blur-sm"
          onClick={closeModal}
        />

        <motion.div
          key="modal-panel"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white dark:bg-navy-800 rounded-2xl shadow-glass w-full max-w-md border border-border dark:border-navy-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-navy-700">
            <div>
              <h2 className="font-semibold text-navy dark:text-white">
                {isEdit ? 'Edit Transaction' : 'New Transaction'}
              </h2>
              <p className="text-xs text-navy-400 dark:text-navy-400 mt-0.5">
                {isEdit ? 'Update the transaction details below' : 'Fill in all fields to continue'}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg hover:bg-surface dark:hover:bg-navy-700 text-navy-400 hover:text-navy dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-4">
            {/* Type toggle */}
            <div>
              <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-1.5">Type</label>
              <div className="segmented-control w-full">
                {['expense', 'income'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleChange('type', t)}
                    className={`segmented-btn flex-1 capitalize ${form.type === t ? 'active' : ''}`}
                  >
                    <span className={form.type === t
                      ? t === 'expense' ? 'text-red-500' : 'text-emerald-600'
                      : ''}>
                      {t === 'expense' ? '↓ ' : '↑ '}{t}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Swiggy Order"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onBlur={() => touch('description')}
                className={inputClass('description')}
              />
              <FieldError msg={touched.description && errors.description} />
            </div>

            {/* Amount + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-1.5">
                  Amount (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  onBlur={() => touch('amount')}
                  className={inputClass('amount')}
                />
                <FieldError msg={touched.amount && errors.amount} />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-1.5">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  onBlur={() => touch('date')}
                  className={inputClass('date')}
                />
                <FieldError msg={touched.date && errors.date} />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-navy-500 dark:text-navy-300 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface dark:bg-navy-900 border border-border dark:border-navy-700 rounded-xl
                           text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Form validity hint */}
            {!isFormValid && Object.keys(touched).length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-navy-400 dark:text-navy-400 text-center"
              >
                Please fill in all required fields to continue
              </motion.p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border dark:border-navy-700">
            <button onClick={closeModal} className="btn-ghost">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid && Object.keys(touched).length > 0}
              className={`btn-primary transition-all duration-200 ${
                !isFormValid && Object.keys(touched).length > 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
