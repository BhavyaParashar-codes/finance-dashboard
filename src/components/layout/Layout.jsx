import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar, { IconRail } from './Sidebar'
import Header from './Header'
import useStore from '../../store/useStore'

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { darkMode } = useStore()

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Close drawer on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <div className="flex h-screen overflow-hidden bg-surface dark:bg-navy-900">

      {/* Permanent icon rail — hidden on mobile (xs), visible sm+ */}
      <IconRail onOpen={openDrawer} />

      {/* Slide-in drawer overlay — all screen sizes */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-navy/30 backdrop-blur-sm"
              onClick={closeDrawer}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 h-full z-50"
            >
              <Sidebar onClose={closeDrawer} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={openDrawer} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}