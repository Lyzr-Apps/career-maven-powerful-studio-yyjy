'use client'

import { cn } from '@/lib/utils'
import { FiUser, FiMap, FiMessageSquare, FiClock, FiMenu, FiX } from 'react-icons/fi'
import { useState } from 'react'

interface SidebarProps {
  activeScreen: string
  onNavigate: (screen: string) => void
  hasCareerPlan: boolean
}

const navItems = [
  { id: 'profile', label: 'Profile & Goals', icon: FiUser, description: 'Your background' },
  { id: 'career-plan', label: 'Career Plan', icon: FiMap, description: 'Roadmap & skills' },
  { id: 'mock-interview', label: 'Mock Interview', icon: FiMessageSquare, description: 'Practice sessions' },
  { id: 'history', label: 'Interview History', icon: FiClock, description: 'Past performance' },
]

export default function Sidebar({ activeScreen, onNavigate, hasCareerPlan }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (id: string) => {
    onNavigate(id)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-[hsl(235,25%,12%)] text-white shadow-lg shadow-indigo-900/20 border border-white/10"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-72 flex flex-col transition-transform duration-300',
          'bg-[hsl(235,25%,12%)] border-r border-white/[0.06]',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="px-7 pt-8 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-white text-lg tracking-tight leading-none">CareerPath</h1>
              <p className="text-[13px] text-indigo-300/60 font-medium mt-0.5">AI Career Advisor</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id
            const isDisabled = (item.id === 'career-plan' && !hasCareerPlan)

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && handleNav(item.id)}
                disabled={isDisabled}
                className={cn(
                  'w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white border border-indigo-400/20 shadow-sm shadow-indigo-500/10'
                    : isDisabled
                      ? 'text-white/20 cursor-not-allowed'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                  isActive
                    ? 'bg-indigo-500 shadow-md shadow-indigo-500/30'
                    : isDisabled
                      ? 'bg-white/5'
                      : 'bg-white/[0.06] group-hover:bg-white/10'
                )}>
                  <item.icon className={cn('w-4 h-4', isActive ? 'text-white' : isDisabled ? 'text-white/20' : 'text-white/50 group-hover:text-white/80')} />
                </div>
                <div className="text-left">
                  <span className="block leading-tight">{item.label}</span>
                  <span className={cn(
                    'block text-[11px] mt-0.5 font-normal',
                    isActive ? 'text-indigo-300/60' : isDisabled ? 'text-white/10' : 'text-white/30'
                  )}>
                    {item.description}
                  </span>
                </div>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
                )}
                {isDisabled && (
                  <span className="ml-auto text-[10px] bg-white/5 rounded-full px-2 py-0.5 text-white/20 border border-white/5">locked</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 pb-6">
          <div className="mx-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <p className="text-[11px] text-white/30 font-medium">
              Powered by AI Agents
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
