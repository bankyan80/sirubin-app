'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, LogIn, Loader2, AlertCircle, X, School, Shield } from 'lucide-react'
import { useAuthStore, AuthUser } from '@/lib/auth-store'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)

  const resetForm = () => {
    setUsername('')
    setPassword('')
    setShowPassword(false)
    setError('')
    setLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi')
      return
    }

    setLoading(true)

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
        return
      }

      login(data.user as AuthUser)
      resetForm()
      onClose()
    } catch {
      setError('Terjadi kesalahan koneksi')
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-400/30 border border-slate-100 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X size={18} />
            </button>

            {/* Header gradient */}
            <div className="relative bg-gradient-to-r from-[#0c1527] via-[#111d35] to-[#0a1e3d] px-6 py-6 overflow-hidden">
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-blue-500/15 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-violet-500/10 rounded-full" />

              <div className="relative z-10 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/30">
                  <span className="text-white font-bold text-lg">SR</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Masuk ke Akun</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Silakan masuk untuk mengakses fitur lengkap</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 pt-5">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl"
                    >
                      <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Username / NPSN
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username atau NPSN"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 focus:bg-white transition-all duration-200"
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 focus:bg-white transition-all duration-200"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-600 to-violet-600 hover:from-blue-700 hover:via-blue-700 hover:to-violet-700 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      <span>Masuk</span>
                    </>
                  )}
                </button>
              </form>

              {/* Help text */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield size={10} className="text-blue-500" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      <span className="font-semibold text-slate-600">Admin:</span> username <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">admin</code> / password <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">admin456</code>
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <School size={10} className="text-violet-500" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      <span className="font-semibold text-slate-600">Sekolah:</span> username = NPSN / password default <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">nisn.la</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
