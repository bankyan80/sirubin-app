'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  School,
  FileText,
  BarChart3,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

interface SidebarProps {
  activeMenu: string
  onMenuChange: (menu: string) => void
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
  onChangePassword: () => void
}

const allMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SEKOLAH'] },
  { id: 'sekolah', label: 'Data Sekolah', icon: School, roles: ['ADMIN', 'SEKOLAH'] },
  { id: 'laporan', label: 'Laporan Bulanan', icon: FileText, roles: ['ADMIN', 'SEKOLAH'] },
  { id: 'rekapitulasi', label: 'Rekapitulasi', icon: BarChart3, roles: ['ADMIN'] },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings, roles: ['ADMIN', 'SEKOLAH'] },
  { id: 'spmb', label: 'SPMB 2026/2027', icon: GraduationCap, roles: ['ADMIN', 'SEKOLAH'] },
]

export default function Sidebar({
  activeMenu,
  onMenuChange,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  onChangePassword,
}: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuthStore()

  const isAdmin = isAuthenticated && user?.role === 'ADMIN'
  const userRole = user?.role || ''

  // Filter menu items by role
  const menuItems = allMenuItems.filter((item) => {
    if (!isAuthenticated) return false
    return item.roles.includes(userRole)
  })

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : null

  const gradientColors = isAdmin
    ? 'from-blue-500 to-violet-500'
    : 'from-emerald-500 to-teal-500'

  const handleLogout = () => {
    logout()
    onMobileClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-gradient-to-b from-[#0c1527] via-[#111d35] to-[#0a1225]
          border-r border-white/[0.06]
          lg:relative lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo Section */}
        <div className="flex items-center h-16 px-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-lg shadow-blue-500/25">
              <img src="/logo.png" alt="SIRUBIN" className="w-full h-full object-cover" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="text-white font-bold text-lg tracking-tight">SIRUBIN</h1>
                  <p className="text-[10px] text-blue-300/60 -mt-1 tracking-widest uppercase">Rutin Bulanan</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.length === 0 && (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-slate-600">Silakan login untuk melihat menu</p>
          </div>
        )}
        {menuItems.map((item) => {
            const isActive = activeMenu === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  onMenuChange(item.id)
                  onMobileClose()
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/15 to-cyan-500/10 border border-blue-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className={`relative z-10 flex items-center gap-3 w-full ${collapsed ? 'justify-center' : ''}`}>
                  <Icon
                    size={20}
                    className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`text-sm font-medium overflow-hidden whitespace-nowrap ${
                          isActive ? 'text-white' : ''
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Collapse Button (desktop only) */}
        <div className="hidden lg:block px-3 pb-4">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all duration-200"
          >
            {collapsed ? <ChevronRight size={18} /> : (
              <>
                <ChevronLeft size={18} />
                <span className="text-sm">Tutup Sidebar</span>
              </>
            )}
          </button>
        </div>

        {/* User section at bottom */}
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            {isAuthenticated && initials ? (
              <>
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap flex-1"
                    >
                      <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {isAdmin ? 'Super Admin' : user?.jenjang || 'Sekolah'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 ml-auto"
                    >
                      <button
                        onClick={onChangePassword}
                        className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-white/[0.05] rounded-lg transition-all duration-200"
                        title="Ubah Password"
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        onClick={handleLogout}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/[0.05] rounded-lg transition-all duration-200"
                        title="Keluar"
                      >
                        <LogOut size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <span className="text-slate-500 text-xs">
                    <School size={14} />
                  </span>
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      <p className="text-sm font-medium text-slate-400">Belum Login</p>
                      <p className="text-[11px] text-slate-600">Klik Login di atas</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}
