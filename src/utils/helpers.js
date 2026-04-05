// Currency conversion rates (approximate, relative to INR)
export const CURRENCY_RATES = { INR: 1, USD: 0.012, EUR: 0.011 }
export const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€' }
export const CURRENCY_LOCALES = { INR: 'en-IN', USD: 'en-US', EUR: 'de-DE' }

export function convertAmount(amountInr, currency) {
  return amountInr * CURRENCY_RATES[currency]
}

export function formatCurrency(amountInr, compact = false, currency = 'INR') {
  const amount = convertAmount(Math.abs(amountInr), currency)
  const sym = CURRENCY_SYMBOLS[currency]
  if (compact) {
    if (currency === 'INR') {
      if (amount >= 100000) return `${sym}${(amount / 100000).toFixed(1)}L`
      if (amount >= 1000) return `${sym}${(amount / 1000).toFixed(1)}K`
      return `${sym}${Math.round(amount).toLocaleString('en-IN')}`
    } else {
      if (amount >= 1000000) return `${sym}${(amount / 1000000).toFixed(1)}M`
      if (amount >= 1000) return `${sym}${(amount / 1000).toFixed(1)}K`
      return `${sym}${amount.toFixed(0)}`
    }
  }
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function getFilteredTransactions(transactions, filters) {
  let result = [...transactions]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (t) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    )
  }
  if (filters.category !== 'all') result = result.filter((t) => t.category === filters.category)
  if (filters.type !== 'all') result = result.filter((t) => t.type === filters.type)
  result.sort((a, b) => {
    let valA = a[filters.sortBy], valB = b[filters.sortBy]
    if (filters.sortBy === 'amount') { valA = Math.abs(valA); valB = Math.abs(valB) }
    if (valA < valB) return filters.sortDir === 'asc' ? -1 : 1
    if (valA > valB) return filters.sortDir === 'asc' ? 1 : -1
    return 0
  })
  return result
}

export function getSpendingByCategory(transactions) {
  const map = {}
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    map[t.category] = (map[t.category] || 0) + Math.abs(t.amount)
  })
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

export function getSummary(transactions) {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
  return { income, expenses, balance: income - expenses }
}

export function exportToCSV(transactions) {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount']
  const rows = transactions.map((t) => [t.date, `"${t.description}"`, t.category, t.type, t.amount])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'fintrak-transactions.csv'; a.click()
  URL.revokeObjectURL(url)
}

export function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))
  return lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim().replace(/"/g, ''))
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return {
      date: obj.date || new Date().toISOString().split('T')[0],
      description: obj.description || obj.desc || obj.name || 'Imported',
      category: obj.category || 'Food & Dining',
      type: (obj.type || '').toLowerCase().includes('income') ? 'income' : 'expense',
      amount: parseFloat(obj.amount || '0') || 0,
    }
  }).filter((t) => t.description && !isNaN(t.amount))
}

export function getDaysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getMonthsUntil(dateStr) {
  const now = new Date()
  const target = new Date(dateStr)
  return Math.max(0, (target.getFullYear() - now.getFullYear()) * 12 + target.getMonth() - now.getMonth())
}
