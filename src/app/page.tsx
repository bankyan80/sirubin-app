'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import LoginModal from '@/components/auth/login-modal'
import Sidebar from '@/components/dashboard/sidebar'
import Topbar from '@/components/dashboard/topbar'
import StatusGrid from '@/components/dashboard/status-grid'
import RekapTable from '@/components/dashboard/rekap-table'
import SplashScreen from '@/components/dashboard/splash-screen'
import DataSekolahPage from '@/components/sekolah/data-sekolah-page'
import LaporanBulananPage from '@/components/laporan/laporan-bulanan-page'
import RekapitulasiPage from '@/components/rekapitulasi/rekapitulasi-page'
import PengaturanPage from '@/components/pengaturan/pengaturan-page'
import SpmbPage from '@/components/spmb/spmb-page'

function DashboardView() {
  return <RekapTable />
}

export default function Home() {
  const { isAuthenticated, user } = useAuthStore()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  const isAdmin = isAuthenticated && user?.role === 'ADMIN'
  const isPengguna = isAuthenticated && user?.role === 'PENGGUNA'

  // Splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      {!showSplash && (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
          {isAuthenticated && (
            <Sidebar
              activeMenu={activeMenu}
              onMenuChange={setActiveMenu}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              mobileOpen={mobileMenuOpen}
              onMobileClose={() => setMobileMenuOpen(false)}
            />
          )}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Topbar
              onMobileMenuToggle={() => setMobileMenuOpen(true)}
              onLoginClick={() => setShowLogin(true)}
            />

            <main className="flex-1 overflow-y-auto">
              <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1440px] mx-auto">
                {/* Pengguna banner */}
                {isPengguna && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-600 text-sm font-bold">!</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-800">Akses Terbatas</h3>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Akun Anda belum memiliki hak akses penuh. Silakan hubungi Admin untuk mendapatkan role yang sesuai (Admin / Sekolah).
                      </p>
                    </div>
                  </motion.div>
                )}

                {(activeMenu === 'dashboard' || !isAuthenticated) && <DashboardView />}
                {isAuthenticated && activeMenu === 'sekolah' && isAdmin && <DataSekolahPage />}
                {isAuthenticated && activeMenu === 'laporan' && !isPengguna && <LaporanBulananPage />}
                {isAuthenticated && activeMenu === 'rekapitulasi' && <RekapitulasiPage />}
                {isAuthenticated && activeMenu === 'pengaturan' && !isPengguna && <PengaturanPage />}
                {isAuthenticated && activeMenu === 'spmb' && !isPengguna && <SpmbPage />}

                {isAuthenticated && activeMenu === 'sekolah' && !isAdmin && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <CalendarDays size={32} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-600">Akses Terbatas</h2>
                    <p className="text-sm text-slate-400 mt-1">Halaman ini hanya untuk Admin</p>
                  </motion.div>
                )}

                {isPengguna && ['laporan', 'pengaturan', 'spmb'].includes(activeMenu) && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <CalendarDays size={32} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-600">Akses Terbatas</h2>
                    <p className="text-sm text-slate-400 mt-1">Hubungi Admin untuk mendapatkan hak akses penuh</p>
                  </motion.div>
                )}
              </div>
            </main>
          </div>

          <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
      )}
    </>
  )
}
