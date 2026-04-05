import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { INITIAL_TRANSACTIONS } from '../data/mockData'

const DEFAULT_BUDGETS = {
  'Food & Dining': 8000,
  'Shopping': 10000,
  'Transportation': 2000,
  'Healthcare': 5000,
  'Entertainment': 3000,
  'Utilities': 4000,
  'Rent': 30000,
}

const DEFAULT_GOALS = [
  { id: 'g1', name: 'Emergency Fund', target: 200000, saved: 45000, icon: '🛡️', color: '#007C89', deadline: '2026-12-31' },
  { id: 'g2', name: 'Vacation — Bali', target: 80000, saved: 22000, icon: '✈️', color: '#AB47BC', deadline: '2026-10-01' },
  { id: 'g3', name: 'New Laptop', target: 120000, saved: 60000, icon: '💻', color: '#F6A623', deadline: '2026-08-15' },
]

const DEFAULT_ASSETS = [
  { id: 'a1', name: 'Savings Account', value: 180000, category: 'cash' },
  { id: 'a2', name: 'Mutual Funds', value: 95000, category: 'investment' },
  { id: 'a3', name: 'Fixed Deposit', value: 250000, category: 'investment' },
  { id: 'a4', name: 'Gold', value: 55000, category: 'physical' },
]

const DEFAULT_LIABILITIES = [
  { id: 'l1', name: 'Credit Card', value: 15000, category: 'credit' },
  { id: 'l2', name: 'Personal Loan', value: 80000, category: 'loan' },
]

const DEFAULT_NET_WORTH_HISTORY = [
  { month: 'Jan', netWorth: 380000, assets: 520000, liabilities: 140000 },
  { month: 'Feb', netWorth: 395000, assets: 535000, liabilities: 140000 },
  { month: 'Mar', netWorth: 412000, assets: 550000, liabilities: 138000 },
  { month: 'Apr', netWorth: 430000, assets: 568000, liabilities: 138000 },
  { month: 'May', netWorth: 448000, assets: 583000, liabilities: 135000 },
  { month: 'Jun', netWorth: 485000, assets: 580000, liabilities: 95000 },
]

const useStore = create(
  persist(
    (set, get) => ({
      // Role
      role: 'viewer',
      setRole: (role) => set({ role }),

      // Dark mode
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      // Currency
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),

      // Transactions
      transactions: INITIAL_TRANSACTIONS,
      addTransaction: (tx) =>
        set((s) => ({ transactions: [{ ...tx, id: Date.now() }, ...s.transactions] })),
      addTransactions: (txList) =>
        set((s) => ({
          transactions: [
            ...txList.map((tx, i) => ({ ...tx, id: Date.now() + i })),
            ...s.transactions,
          ],
        })),
      updateTransaction: (id, updates) =>
        set((s) => ({
          transactions: s.transactions.map((t) => t.id === id ? { ...t, ...updates } : t),
        })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      // Filters
      filters: { search: '', category: 'all', type: 'all', sortBy: 'date', sortDir: 'desc' },
      setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
      resetFilters: () =>
        set({ filters: { search: '', category: 'all', type: 'all', sortBy: 'date', sortDir: 'desc' } }),

      // Cross-filters
      selectedCategory: null,
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      selectedMonth: null,
      setSelectedMonth: (month) => set({ selectedMonth: month }),

      // Navigation
      activePage: 'dashboard',
      setActivePage: (page) => set({ activePage: page }),

      // Modal
      modal: null,
      openModal: (modal) => set({ modal }),
      closeModal: () => set({ modal: null }),

      // Budgets
      budgets: DEFAULT_BUDGETS,
      setBudget: (category, amount) =>
        set((s) => ({ budgets: { ...s.budgets, [category]: amount } })),
      resetBudgets: () => set({ budgets: DEFAULT_BUDGETS }),

      // Goals
      goals: DEFAULT_GOALS,
      addGoal: (goal) =>
        set((s) => ({ goals: [...s.goals, { ...goal, id: `g${Date.now()}` }] })),
      updateGoal: (id, updates) =>
        set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, ...updates } : g) })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      contributeToGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g
          ),
        })),

      // Net Worth
      assets: DEFAULT_ASSETS,
      liabilities: DEFAULT_LIABILITIES,
      netWorthHistory: DEFAULT_NET_WORTH_HISTORY,
      addAsset: (asset) =>
        set((s) => ({ assets: [...s.assets, { ...asset, id: `a${Date.now()}` }] })),
      updateAsset: (id, updates) =>
        set((s) => ({ assets: s.assets.map((a) => a.id === id ? { ...a, ...updates } : a) })),
      deleteAsset: (id) =>
        set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
      addLiability: (liability) =>
        set((s) => ({ liabilities: [...s.liabilities, { ...liability, id: `l${Date.now()}` }] })),
      updateLiability: (id, updates) =>
        set((s) => ({ liabilities: s.liabilities.map((l) => l.id === id ? { ...l, ...updates } : l) })),
      deleteLiability: (id) =>
        set((s) => ({ liabilities: s.liabilities.filter((l) => l.id !== id) })),

      // Alerts dismissed state
      dismissedAlerts: [],
      dismissAlert: (id) =>
        set((s) => ({ dismissedAlerts: [...s.dismissedAlerts, id] })),
      clearDismissedAlerts: () => set({ dismissedAlerts: [] }),
    }),
    {
      name: 'fintrak-storage',
      partialState: (state) => ({
        transactions: state.transactions,
        darkMode: state.darkMode,
        role: state.role,
        budgets: state.budgets,
        goals: state.goals,
        assets: state.assets,
        liabilities: state.liabilities,
        netWorthHistory: state.netWorthHistory,
        currency: state.currency,
        dismissedAlerts: state.dismissedAlerts,
      }),
    }
  )
)

export default useStore
