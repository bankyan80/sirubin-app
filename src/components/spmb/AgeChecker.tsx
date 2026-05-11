'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck, Search, RotateCcw } from 'lucide-react'
import EligibilityResult from './EligibilityResult'

function validateAge(tanggalLahir: string): { status: 'Diterima' | 'Batas' | 'Ditolak'; usia: string; rekomendasi: string } {
  const refDate = new Date('2026-07-01')
  const birthDate = new Date(tanggalLahir)
  const cutoffAccepted = new Date('2020-06-30')
  const cutoffBatas = new Date('2020-07-01')

  let years = refDate.getFullYear() - birthDate.getFullYear()
  let months = refDate.getMonth() - birthDate.getMonth()
  if (months < 0) { years--; months += 12 }
  const usia = `${years} tahun ${months} bulan`

  if (birthDate <= cutoffAccepted) {
    return { status: 'Diterima', usia, rekomendasi: 'Memenuhi syarat usia minimal 6 tahun per 1 Juli 2026' }
  } else if (
    birthDate.getFullYear() === cutoffBatas.getFullYear() &&
    birthDate.getMonth() === cutoffBatas.getMonth() &&
    birthDate.getDate() === cutoffBatas.getDate()
  ) {
    return { status: 'Batas', usia: '6 tahun 0 bulan', rekomendasi: 'Batas minimum usia — perlu konfirmasi kepala sekolah' }
  } else {
    return { status: 'Ditolak', usia, rekomendasi: 'Tidak memenuhi syarat usia minimal 6 tahun per 1 Juli 2026' }
  }
}

export default function AgeChecker() {
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [result, setResult] = useState<ReturnType<typeof validateAge> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheck = () => {
    setError('')
    if (!tanggalLahir) {
      setError('Tanggal lahir wajib diisi')
      return
    }
    setLoading(true)
    setResult(null)
    // Simulate brief loading for UX
    setTimeout(() => {
      setResult(validateAge(tanggalLahir))
      setLoading(false)
    }, 400)
  }

  const handleReset = () => {
    setTanggalLahir('')
    setResult(null)
    setError('')
  }

  return (
    <div className="space-y-5">
      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <CalendarCheck size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Cek Kelayakan Usia</h3>
            <p className="text-xs text-slate-500">Usia minimal 6 tahun per 1 Juli 2026</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tanggal Lahir Siswa
            </label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={e => { setTanggalLahir(e.target.value); setError(''); setResult(null) }}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5">
                {error}
              </motion.p>
            )}
          </div>

          {/* Progress indicator */}
          {tanggalLahir && !result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-slate-500">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                ))}
              </div>
              <span>Tanggal lahir dipilih — klik Cek Kelayakan</span>
            </motion.div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCheck}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Cek Kelayakan
            </button>
            {result && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <EligibilityResult
            status={result.status}
            usia={result.usia}
            rekomendasi={result.rekomendasi}
            tanggalLahir={tanggalLahir}
          />
        )}
      </AnimatePresence>

      {/* Info Card */}
      {!result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4">
          <p className="text-xs font-semibold text-blue-700 mb-2">Ketentuan Usia SPMB SD 2026/2027</p>
          <ul className="space-y-1.5 text-xs text-blue-600">
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />Lahir ≤ 30 Juni 2020 → <strong>Diterima</strong> (≥ 6 tahun)</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />Lahir 1 Juli 2020 → <strong>Batas Minimum</strong> (tepat 6 tahun)</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />Lahir &gt; 1 Juli 2020 → <strong>Belum Memenuhi Syarat</strong> (&lt; 6 tahun)</li>
          </ul>
        </motion.div>
      )}
    </div>
  )
}
