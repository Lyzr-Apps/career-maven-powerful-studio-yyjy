'use client'

import { cn } from '@/lib/utils'
import { FiUser, FiMap, FiMessageSquare, FiClock, FiMenu, FiX, FiCompass } from 'react-icons/fi'
import { useState } from 'react'

interface SidebarProps {
  activeScreen: string
  onNavigate: (screen: string) => void
  hasCareerPlan: boolean
}

const navItems = [
  { id: 'profile', label: 'Profile & Goals', icon: FiUser },
  { id: 'career-plan', label: 'Career Plan', icon: FiMap },
  { id: 'mock-interview', label: 'Mock Interview', icon: FiMessageSquare },
  { id: 'history', label: 'Interview History', icon: FiClock },
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
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl backdrop-blur-md bg-white/75 border border-white/20 shadow-md text-foreground"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 flex flex-col backdrop-blur-md bg-white/75 border-r border-white/20 shadow-md transition-transform duration-300',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <FiCompass className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight text-foreground text-lg leading-none">CareerPath</h1>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">AI Career Assistant</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id
            const isDisabled = (item.id === 'career-plan' && !hasCareerPlan)

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && handleNav(item.id)}
                disabled={isDisabled}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : isDisabled
                      ? 'text-muted-foreground/50 cursor-not-allowed'
                      : 'text-foreground hover:bg-muted/60'
                )}
              >
                <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{item.label}</span>
                {isDisabled && (
                  <span className="ml-auto text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground">locked</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            Powered by AI Agents
          </p>
        </div>
      </aside>
    </>
  )
}
