'use client'

import { Search, Bell, Menu, LogIn, LogOut, ChevronDown, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/auth-store'

interface TopbarProps {
  onMobileMenuToggle: () => void
  onLoginClick: () => void
}

export default function Topbar({ onMobileMenuToggle, onLoginClick }: TopbarProps) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role === 'ADMIN'
  const isPengguna = user?.role === 'PENGGUNA'

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const gradientColors = isAdmin
    ? 'from-blue-500 to-violet-600'
    : isPengguna
    ? 'from-slate-500 to-slate-600'
    : 'from-emerald-500 to-teal-600'

  const roleLabel = isAdmin ? 'Super Admin' : isPengguna ? 'Pengguna' : (user?.jenjang || 'Sekolah')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Mobile menu button + Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari sekolah, laporan..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notification */}
          <button className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200">
            <Bell size={18} />
            {isAuthenticated && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          <div className="w-px h-8 bg-slate-200 mx-1" />

          {isAuthenticated ? (
            /* ---- Logged in: Profile Dropdown ---- */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 pl-1 pr-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-white shadow-md"
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                    <span className="text-white text-xs font-bold">{initials}</span>
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-slate-400 leading-tight">{roleLabel}</p>
                </div>
                <ChevronDown size={14} className={`hidden sm:block text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
                  >
                    <div className={`px-4 py-3 bg-gradient-to-r ${gradientColors}`}>
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-[11px] text-white/70">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut size={16} />
                        Keluar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ---- Not logged in: Login button ---- */
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 active:scale-[0.97]"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
