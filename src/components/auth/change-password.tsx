'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { apiFetch } from '@/lib/api-fetch'

interface ChangePasswordProps {
  isOpen: boolean
  onClose: () => void
  onSkip?: () => void
}

export default function ChangePassword({ isOpen, onClose, onSkip }: ChangePasswordProps) {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Semua field wajib diisi')
      return
    }

    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }

    if (currentPassword === newPassword) {
      setError('Password baru harus berbeda dari password saat ini')
      return
    }

    setLoading(true)

    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Gagal mengubah password')
        setLoading(false)
        return
      }

      setSuccess(true)
      updateUser({ mustChangePassword: false })

      setTimeout(() => {
        onClose()
        // Reset form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setError('')
        setSuccess(false)
      }, 1500)
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-300/50 border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 px-6 py-5">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Ubah Password</h2>
                    <p className="text-xs text-white/70">Amankan akun Anda dengan password baru</p>
                  </div>
                </div>
                {onSkip && (
                  <button
                    onClick={onSkip}
                    className="text-xs text-white/60 hover:text-white/90 transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
                  >
                    Lewati
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                      className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4"
                    >
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-slate-800">Berhasil!</h3>
                    <p className="text-sm text-slate-500 mt-1">Password Anda telah berhasil diubah</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
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
                          <p className="text-xs text-red-700">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Current password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Masukkan password saat ini"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Password Baru
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Konfirmasi Password Baru
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi password baru"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <span>Simpan Password</span>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
