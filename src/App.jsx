import React from 'react'
import { Toaster } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import Dashboard from './components/dashboard/Dashboard'
import Transactions from './components/transactions/Transactions'
import TransactionModal from './components/transactions/TransactionModal'
import Insights from './components/insights/Insights'
import BudgetPlanner from './components/budget/BudgetPlanner'
import GoalsSavings from './components/goals/GoalsSavings'
import NetWorth from './components/networth/NetWorth'
import useStore from './store/useStore'

export default function App() {
  const { activePage, darkMode } = useStore()

  const pages = {
    dashboard: <Dashboard />,
    transactions: <Transactions />,
    insights: <Insights />,
    budget: <BudgetPlanner />,
    goals: <GoalsSavings />,
    networth: <NetWorth />,
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <div key={activePage}>
          {pages[activePage] || <Dashboard />}
        </div>
      </AnimatePresence>
      <TransactionModal />
      <Toaster
        position="bottom-right"
        theme={darkMode ? 'dark' : 'light'}
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: '"DM Sans", system-ui, sans-serif',
            borderRadius: '14px',
            fontSize: '13px',
          },
        }}
      />
    </Layout>
  )
}
