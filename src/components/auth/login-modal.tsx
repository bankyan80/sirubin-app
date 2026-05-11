'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, Loader2, AlertCircle, X, School, Shield } from 'lucide-react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { useAuthStore, AuthUser } from '@/lib/auth-store'
import { getFirebaseClientAuth, getGoogleProvider } from '@/lib/firebase-client'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)

  const handleClose = () => {
    setError('')
    setLoading(false)
    onClose()
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const auth = getFirebaseClientAuth()
      const provider = getGoogleProvider()
      const result = await signInWithPopup(auth, provider)
      const credential = GoogleAuthProvider.credentialFromResult(result)

      if (!credential?.idToken) {
        setError('Gagal mendapatkan token autentikasi')
        setLoading(false)
        return
      }

      // Send ID token to server for verification
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credential.idToken }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Login gagal')
        setLoading(false)
        return
      }

      login(data.user as AuthUser)
      handleClose()
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login dibatalkan')
      } else {
        setError(error.message || 'Terjadi kesalahan koneksi')
      }
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
                  <p className="text-xs text-slate-400 mt-0.5">Gunakan Akun Google Anda</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 pt-5">
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl mb-4"
                  >
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    <span>Masuk dengan Google</span>
                  </>
                )}
              </button>

              {/* Help text */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <School size={10} className="text-violet-500" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      <span className="font-semibold text-slate-600">Sekolah:</span> Gunakan email yang terdaftar di sistem
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield size={10} className="text-blue-500" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Hanya email yang terdaftar oleh admin yang dapat mengakses sistem
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
