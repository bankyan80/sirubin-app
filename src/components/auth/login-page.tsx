'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, LogIn, Loader2, AlertCircle, School, Shield } from 'lucide-react'
import { useAuthStore, AuthUser } from '@/lib/auth-store'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const setAuthLoading = useAuthStore((s) => s.setLoading)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi')
      return
    }

    setLoading(true)
    setAuthLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Login gagal')
        setLoading(false)
        setAuthLoading(false)
        return
      }

      login(data.user as AuthUser)
    } catch {
      setError('Terjadi kesalahan koneksi')
      setLoading(false)
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#0c1527] via-[#111d35] to-[#0a1e3d]">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[80px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <span className="text-white font-bold text-xl">SR</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">SIRUBIN</h1>
                <p className="text-sm text-blue-300/60 tracking-[0.2em] uppercase">Sistem Rutin Bulanan</p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Monitoring{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Laporan Bulanan
              </span>
              <br />Sekolah
            </h2>

            <p className="text-lg text-slate-400 leading-relaxed max-w-md mb-10">
              Platform digital untuk memantau dan mengelola laporan rutin bulanan sekolah TK, PAUD, dan SD secara efisien dan terintegrasi.
            </p>

            {/* Feature cards */}
            <div className="space-y-4">
              {[
                { icon: School, title: '22 Sekolah Terdaftar', desc: 'TK, PAUD, dan SD dalam satu platform' },
                { icon: Shield, title: 'Aman & Terintegrasi', desc: 'Data terproteksi dengan sistem keamanan modern' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                  className="flex items-start gap-4 bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative bottom text */}
        <div className="absolute bottom-6 left-12">
          <p className="text-[11px] text-slate-600">&copy; 2025 SIRUBIN. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100/30 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet-100/30 rounded-full blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">SR</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">SIRUBIN</h1>
              <p className="text-[10px] text-blue-500/60 tracking-[0.2em] uppercase">Sistem Rutin Bulanan</p>
            </div>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Masuk ke Akun</h2>
              <p className="text-sm text-slate-500 mt-2">Silakan masuk untuk mengakses dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl"
                  >
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Username / NPSN
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau NPSN"
                  className="w-full px-4 py-3 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 focus:bg-white transition-all duration-200"
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full px-4 py-3 pr-11 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 focus:bg-white transition-all duration-200"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-600 to-violet-600 hover:from-blue-700 hover:via-blue-700 hover:to-violet-700 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Masuk</span>
                  </>
                )}
              </button>
            </form>

            {/* Help text */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="space-y-3">
                
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <School size={10} className="text-violet-500" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-600">Sekolah:</span> username = NPSN sekolah / password default <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[11px]">nisn.la</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
