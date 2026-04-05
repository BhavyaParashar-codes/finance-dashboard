import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, CheckCircle, AlertCircle, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import useStore from '../../store/useStore'
import { parseCSV, formatCurrency, formatDate } from '../../utils/helpers'
import { CATEGORY_COLORS } from '../../data/mockData'

const SAMPLE_CSV = `Date,Description,Category,Type,Amount
2025-06-01,Monthly Salary,Salary,income,85000
2025-06-02,Swiggy Order,Food & Dining,expense,850
2025-06-03,Netflix,Entertainment,expense,649`

function downloadSample() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'fintrak-sample.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function CSVImportModal({ onClose }) {
  const { addTransactions } = useStore()
  const [step, setStep] = useState('upload') // 'upload' | 'preview' | 'success'
  const [parsed, setParsed] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const processFile = useCallback((file) => {
    if (!file) return
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a .csv file')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target.result)
        if (rows.length === 0) { setError('No valid rows found. Check your CSV format.'); return }
        setParsed(rows)
        setSelected(new Set(rows.map((_, i) => i)))
        setError('')
        setStep('preview')
      } catch {
        setError('Could not parse CSV. Please check the format.')
      }
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    processFile(e.dataTransfer.files[0])
  }, [processFile])

  const handleImport = () => {
    const toImport = parsed.filter((_, i) => selected.has(i)).map((tx) => ({
      ...tx,
      amount: tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
    }))
    addTransactions(toImport)
    toast.success(`${toImport.length} transactions imported!`, {
      description: 'They have been added to your transaction list.',
    })
    setStep('success')
  }

  const toggleRow = (i) => {
    const next = new Set(selected)
    next.has(i) ? next.delete(i) : next.add(i)
    setSelected(next)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={onClose} />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white dark:bg-navy-800 rounded-2xl border border-border dark:border-navy-700 shadow-glass w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-navy-700 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-navy dark:text-white">Import Transactions</h2>
            <p className="text-xs text-navy-400 mt-0.5">
              {step === 'upload' && 'Upload a CSV file to bulk import transactions'}
              {step === 'preview' && `${parsed.length} rows found — select which to import`}
              {step === 'success' && 'Import complete!'}
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface dark:hover:bg-navy-700 text-navy-400 hover:text-navy dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
                    ${isDragging
                      ? 'border-teal bg-teal/5 scale-[1.01]'
                      : 'border-border dark:border-navy-600 hover:border-teal hover:bg-teal/3'}`}>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden"
                    onChange={(e) => processFile(e.target.files[0])} />
                  <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-colors
                    ${isDragging ? 'bg-teal/20' : 'bg-surface dark:bg-navy-700'}`}>
                    <Upload size={24} className={isDragging ? 'text-teal' : 'text-navy-400'} />
                  </div>
                  <p className="font-semibold text-navy dark:text-white mb-1">
                    {isDragging ? 'Drop your CSV here' : 'Drag & drop a CSV file'}
                  </p>
                  <p className="text-sm text-navy-400">or click to browse · .csv files only</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                    <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Format guide */}
                <div className="card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy dark:text-white">Expected CSV Format</p>
                    <button onClick={downloadSample}
                      className="flex items-center gap-1.5 text-xs text-teal hover:text-teal-600 font-medium transition-colors">
                      <Download size={13} /> Download sample
                    </button>
                  </div>
                  <div className="bg-navy-900 rounded-xl p-3 overflow-x-auto">
                    <pre className="text-xs text-turquoise font-mono whitespace-pre">{SAMPLE_CSV}</pre>
                  </div>
                  <p className="text-xs text-navy-400 leading-relaxed">
                    Columns: <span className="font-mono text-navy dark:text-navy-200">Date, Description, Category, Type (income/expense), Amount</span>
                    <br />Unrecognized categories will default to "Food & Dining".
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'preview' && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-3">
                {/* Controls */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-navy-400">
                    <span className="font-semibold text-navy dark:text-white">{selected.size}</span> of {parsed.length} rows selected
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setSelected(new Set(parsed.map((_, i) => i)))}
                      className="text-xs text-teal hover:text-teal-600 font-medium transition-colors">Select all</button>
                    <span className="text-navy-300">·</span>
                    <button onClick={() => setSelected(new Set())}
                      className="text-xs text-navy-400 hover:text-navy dark:hover:text-white transition-colors">None</button>
                    <span className="text-navy-300">·</span>
                    <button onClick={() => { setParsed([]); setStep('upload') }}
                      className="text-xs text-navy-400 hover:text-red-500 transition-colors flex items-center gap-1">
                      <Trash2 size={11} /> Re-upload
                    </button>
                  </div>
                </div>

                {/* Preview table */}
                <div className="border border-border dark:border-navy-700 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-surface dark:bg-navy-900/50 border-b border-border dark:border-navy-700">
                        <th className="w-8 px-3 py-2.5" />
                        <th className="px-3 py-2.5 text-left font-semibold text-navy-400 uppercase tracking-wide">Date</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-navy-400 uppercase tracking-wide">Description</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-navy-400 uppercase tracking-wide hidden sm:table-cell">Category</th>
                        <th className="px-3 py-2.5 text-right font-semibold text-navy-400 uppercase tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 dark:divide-navy-700/50">
                      {parsed.map((row, i) => (
                        <tr key={i}
                          onClick={() => toggleRow(i)}
                          className={`cursor-pointer transition-colors ${
                            selected.has(i)
                              ? 'bg-teal/4 dark:bg-teal/8'
                              : 'opacity-40 hover:opacity-60'
                          }`}>
                          <td className="px-3 py-2.5">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              selected.has(i)
                                ? 'bg-teal border-teal'
                                : 'border-border dark:border-navy-600'}`}>
                              {selected.has(i) && <CheckCircle size={10} className="text-white" />}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-navy-500 dark:text-navy-300 font-mono">{row.date}</td>
                          <td className="px-3 py-2.5 font-medium text-navy dark:text-white">{row.description}</td>
                          <td className="px-3 py-2.5 hidden sm:table-cell">
                            <span className="px-1.5 py-0.5 rounded-full text-white text-[10px]"
                              style={{ background: (CATEGORY_COLORS[row.category] || '#007C89') + 'CC' }}>
                              {row.category}
                            </span>
                          </td>
                          <td className={`px-3 py-2.5 text-right font-semibold font-mono ${
                            row.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {row.type === 'income' ? '+' : '−'}₹{Math.abs(row.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-navy dark:text-white">Import Successful!</p>
                  <p className="text-sm text-navy-400 mt-1">Transactions have been added to your account.</p>
                </div>
                <button onClick={onClose} className="btn-primary">Done</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border dark:border-navy-700 flex-shrink-0">
            <button onClick={() => setStep('upload')} className="btn-ghost">← Back</button>
            <button onClick={handleImport}
              disabled={selected.size === 0}
              className={`btn-primary ${selected.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Import {selected.size} Transaction{selected.size !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
