'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import LoginModal from '@/components/auth/login-modal'
import ChangePassword from '@/components/auth/change-password'
import Sidebar from '@/components/dashboard/sidebar'
import Topbar from '@/components/dashboard/topbar'
import StatusGrid from '@/components/dashboard/status-grid'
import DataSekolahPage from '@/components/sekolah/data-sekolah-page'
import LaporanBulananPage from '@/components/laporan/laporan-bulanan-page'
import RekapitulasiPage from '@/components/rekapitulasi/rekapitulasi-page'
import PengaturanPage from '@/components/pengaturan/pengaturan-page'
import SpmbPage from '@/components/spmb/spmb-page'

function DashboardView() {
  return <StatusGrid />
}

const ADMIN_MENUS = ['dashboard', 'sekolah', 'laporan', 'rekapitulasi', 'pengaturan', 'spmb']
const SEKOLAH_MENUS = ['dashboard', 'laporan', 'pengaturan', 'spmb']

function getAllowedMenus(role: string): string[] {
  if (role === 'ADMIN') return ADMIN_MENUS
  if (role === 'SEKOLAH') return SEKOLAH_MENUS
  return []
}

export default function Home() {
  const { isAuthenticated, user } = useAuthStore()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showForcePassword, setShowForcePassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.mustChangePassword) {
      const timer = setTimeout(() => { setShowForcePassword(true) }, 600)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, user?.mustChangePassword])

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onChangePassword={() => setShowChangePassword(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          onChangePassword={() => setShowChangePassword(true)}
          onLoginClick={() => setShowLogin(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1440px] mx-auto">
            {activeMenu === 'dashboard' && <DashboardView />}
            {activeMenu === 'sekolah' && user?.role === 'ADMIN' && <DataSekolahPage />}
            {activeMenu === 'laporan' && <LaporanBulananPage />}
            {activeMenu === 'rekapitulasi' && user?.role === 'ADMIN' && <RekapitulasiPage />}
            {activeMenu === 'pengaturan' && <PengaturanPage />}
            {activeMenu === 'spmb' && <SpmbPage />}

            {(['sekolah', 'rekapitulasi'].includes(activeMenu) && user?.role !== 'ADMIN') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                  <span className="text-3xl">&#128274;</span>
                </div>
                <h2 className="text-lg font-bold text-slate-600">Akses Ditolak</h2>
                <p className="text-sm text-slate-400 mt-1">Halaman ini hanya untuk Admin</p>
              </motion.div>
            )}

            {!['dashboard', 'sekolah', 'laporan', 'rekapitulasi', 'pengaturan', 'spmb'].includes(activeMenu) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <CalendarDays size={32} className="text-slate-300" />
                </div>
                <h2 className="text-lg font-bold text-slate-600">Menu dalam Pengembangan</h2>
                <p className="text-sm text-slate-400 mt-1">Halaman ini sedang disiapkan</p>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
      <ChangePassword isOpen={showForcePassword} onClose={() => setShowForcePassword(false)} onSkip={() => setShowForcePassword(false)} />
    </div>
  )
}