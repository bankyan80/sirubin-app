'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hash, Search, RotateCcw, CheckCircle2, XCircle, MapPin, AlertTriangle } from 'lucide-react'
import DomisiliChecker, { KECAMATAN_OPTIONS } from './DomisiliChecker'

interface NikValidation {
  valid: boolean
  length: number
  message: string
  provinsi?: string
  kabupaten?: string
  kecamatanCode?: string
}

function validateNik(nik: string): NikValidation {
  const cleaned = nik.replace(/\D/g, '')
  if (cleaned.length === 0) return { valid: false, length: 0, message: 'NIK wajib diisi' }
  if (cleaned.length < 16) return { valid: false, length: cleaned.length, message: `NIK kurang ${16 - cleaned.length} digit (saat ini ${cleaned.length} digit)` }
  if (cleaned.length > 16) return { valid: false, length: cleaned.length, message: `NIK terlalu panjang (${cleaned.length} digit, maksimal 16)` }

  // Basic format check: first 2 digits = province code (10-99)
  const provCode = parseInt(cleaned.substring(0, 2))
  if (provCode < 10 || provCode > 99) {
    return { valid: false, length: 16, message: 'Kode provinsi tidak valid' }
  }

  return {
    valid: true,
    length: 16,
    message: 'NIK valid — 16 digit',
    provinsi: cleaned.substring(0, 2),
    kabupaten: cleaned.substring(0, 4),
    kecamatanCode: cleaned.substring(0, 6),
  }
}

export default function NikChecker() {
  const [nik, setNik] = useState('')
  const [alamat, setAlamat] = useState('')
  const [kecamatan, setKecamatan] = useState('')
  const [desa, setDesa] = useState('')
  const [nikResult, setNikResult] = useState<NikValidation | null>(null)
  const [checked, setChecked] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNikChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16)
    setNik(cleaned)
    setNikResult(null)
    setChecked(false)
    setErrors(prev => ({ ...prev, nik: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!nik) newErrors.nik = 'NIK wajib diisi'
    if (!kecamatan) newErrors.kecamatan = 'Kecamatan wajib dipilih'
    return newErrors
  }

  const handleCheck = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setNikResult(validateNik(nik))
    setChecked(true)
  }

  const handleReset = () => {
    setNik('')
    setAlamat('')
    setKecamatan('')
    setDesa('')
    setNikResult(null)
    setChecked(false)
    setErrors({})
  }

  const nikLen = nik.length

  return (
    <div className="space-y-5">
      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <Hash size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Cek NIK & Domisili</h3>
            <p className="text-xs text-slate-500">Validasi NIK dan zona domisili siswa</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* NIK Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              NIK Siswa <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={nik}
                onChange={e => handleNikChange(e.target.value)}
                placeholder="Masukkan 16 digit NIK"
                maxLength={16}
                className={`w-full px-4 py-3 pr-16 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-mono tracking-wider
                  ${errors.nik ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:ring-violet-500/20 focus:border-violet-400'}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className={`text-xs font-mono font-bold ${nikLen === 16 ? 'text-emerald-500' : nikLen > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {nikLen}/16
                </span>
              </div>
            </div>
            {errors.nik && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertTriangle size={11} /> {errors.nik}
              </motion.p>
            )}
            {/* NIK progress bar */}
            {nikLen > 0 && (
              <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${(nikLen / 16) * 100}%` }}
                  className={`h-full rounded-full transition-colors ${nikLen === 16 ? 'bg-emerald-500' : nikLen >= 12 ? 'bg-amber-400' : 'bg-red-400'}`}
                />
              </div>
            )}
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Domisili</label>
            <input
              type="text"
              value={alamat}
              onChange={e => setAlamat(e.target.value)}
              placeholder="Jl. / RT / RW / No."
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
            />
          </div>

          {/* Kecamatan & Desa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Kecamatan <span className="text-red-400">*</span>
              </label>
              <select
                value={kecamatan}
                onChange={e => { setKecamatan(e.target.value); setErrors(prev => ({ ...prev, kecamatan: '' })); setChecked(false) }}
                className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all
                  ${errors.kecamatan ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:ring-violet-500/20 focus:border-violet-400'}`}
              >
                <option value="">Pilih Kecamatan</option>
                {KECAMATAN_OPTIONS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              {errors.kecamatan && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={11} /> {errors.kecamatan}
                </motion.p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Desa / Kelurahan</label>
              <input
                type="text"
                value={desa}
                onChange={e => setDesa(e.target.value)}
                placeholder="Nama desa/kelurahan"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCheck}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
            >
              <Search size={16} />
              Cek NIK & Domisili
            </button>
            {checked && (
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

      {/* Results */}
      <AnimatePresence>
        {checked && nikResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* NIK Result Card */}
            <div className={`rounded-2xl border p-5 ${nikResult.valid ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${nikResult.valid ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {nikResult.valid ? <CheckCircle2 size={20} className="text-emerald-500" /> : <XCircle size={20} className="text-red-500" />}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Status NIK</p>
                  <p className={`text-lg font-bold ${nikResult.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                    {nikResult.valid ? 'NIK Valid' : 'NIK Tidak Valid'}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className={`inline-flex px-3 py-1 text-xs font-bold text-white rounded-full ${nikResult.valid ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {nikResult.length} digit
                  </span>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-3 border border-white/80 mb-3">
                <p className="text-xs text-slate-500 mb-1">NIK yang dimasukkan</p>
                <p className="text-sm font-mono font-bold text-slate-800 tracking-widest">
                  {nik.replace(/(\d{6})(\d{6})(\d{4})/, '$1 $2 $3')}
                </p>
              </div>

              <p className={`text-xs font-medium flex items-center gap-1.5 ${nikResult.valid ? 'text-emerald-600' : 'text-red-600'}`}>
                {nikResult.valid ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {nikResult.message}
              </p>

              {!nikResult.valid && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-red-100/50 rounded-xl border border-red-200">
                  <p className="text-xs text-red-700 font-semibold">⚠ NIK tidak valid</p>
                  <p className="text-xs text-red-600 mt-0.5">Pastikan NIK terdiri dari tepat 16 digit angka sesuai KK/KTP.</p>
                </motion.div>
              )}
            </div>

            {/* Domisili Result */}
            {nikResult.valid && kecamatan && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-violet-500" />
                  <h4 className="text-sm font-bold text-slate-800">Hasil Cek Domisili</h4>
                </div>
                <DomisiliChecker kecamatan={kecamatan} desa={desa} />
              </div>
            )}

            {/* Out of zone alert */}
            {nikResult.valid && kecamatan === 'Lainnya' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">Di luar zona prioritas</p>
                  <p className="text-xs text-amber-600 mt-0.5">Kecamatan tidak termasuk dalam zona prioritas SPMB. Siswa dapat mendaftar namun tidak mendapat prioritas zonasi.</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
