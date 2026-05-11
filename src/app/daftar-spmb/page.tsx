'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, User, Hash, CalendarDays, MapPin, Phone,
  Send, CheckCircle2, Loader2, AlertTriangle, ChevronRight,
  School, Users, ArrowLeft, Home,
} from 'lucide-react'

interface School {
  id: string
  npsn: string
  nama: string
  jenjang: string
  alamat: string
  desa: string
  kecamatan: string
}

interface FormData {
  namaSiswa: string
  nisn: string
  nik: string
  tanggalLahir: string
  jenisKelamin: string
  asalSekolah: string
  schoolId: string
  alamat: string
  parentName: string
  parentPhone: string
  parentAddress: string
}

interface Preview {
  status: string
  usia: string
  rekomendasi: string
}

const REF_DATE = new Date('2026-07-01')
const CUTOFF_ACCEPTED = new Date('2020-06-30')
const CUTOFF_BATAS = new Date('2020-07-01')

function validateAgePreview(tanggalLahir: string): Preview | null {
  if (!tanggalLahir) return null
  const birthDate = new Date(tanggalLahir)
  if (birthDate <= CUTOFF_ACCEPTED) {
    let years = REF_DATE.getFullYear() - birthDate.getFullYear()
    let months = REF_DATE.getMonth() - birthDate.getMonth()
    if (months < 0) { years--; months += 12 }
    return { status: 'Diterima', usia: `${years} tahun ${months} bulan`, rekomendasi: 'Memenuhi syarat usia minimal 6 tahun per 1 Juli 2026' }
  } else if (
    birthDate.getFullYear() === CUTOFF_BATAS.getFullYear() &&
    birthDate.getMonth() === CUTOFF_BATAS.getMonth() &&
    birthDate.getDate() === CUTOFF_BATAS.getDate()
  ) {
    return { status: 'Batas', usia: '6 tahun 0 bulan', rekomendasi: 'Batas minimum usia — perlu konfirmasi kepala sekolah' }
  } else {
    let years = REF_DATE.getFullYear() - birthDate.getFullYear()
    let months = REF_DATE.getMonth() - birthDate.getMonth()
    if (months < 0) { years--; months += 12 }
    return { status: 'Ditolak', usia: `${years} tahun ${months} bulan`, rekomendasi: 'Belum memenuhi syarat usia minimal' }
  }
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
            ${i < current ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' :
              i === current ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500' :
                'bg-slate-100 text-slate-400'}`}
          >
            {i < current ? <CheckCircle2 size={16} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-12 h-0.5 transition-colors duration-300 ${i < current ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Diterima: 'bg-emerald-100 text-emerald-700',
    Batas: 'bg-amber-100 text-amber-700',
    Ditolak: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

export default function DaftarSpmbPage() {
  const [step, setStep] = useState(0)
  const [schools, setSchools] = useState<School[]>([])
  const [loadingSchools, setLoadingSchools] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)

  const [form, setForm] = useState<FormData>({
    namaSiswa: '', nisn: '', nik: '', tanggalLahir: '',
    jenisKelamin: 'L', asalSekolah: 'PAUD', schoolId: '',
    alamat: '', parentName: '', parentPhone: '', parentAddress: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'terms', string>>>({})

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch('/api/spmb/sekolah-pilihan')
        const data = await res.json()
        if (data.success) setSchools(data.data)
      } catch { /* ignore */ }
      setLoadingSchools(false)
    }
    fetchSchools()
  }, [])

  const selectedSchool = schools.find((s) => s.id === form.schoolId)

  useEffect(() => {
    setPreview(validateAgePreview(form.tanggalLahir))
  }, [form.tanggalLahir])

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateStep = (s: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (s === 0) {
      if (!form.namaSiswa.trim()) newErrors.namaSiswa = 'Nama siswa wajib diisi'
      if (!form.tanggalLahir) newErrors.tanggalLahir = 'Tanggal lahir wajib diisi'
    }

    if (s === 1) {
      if (!form.schoolId) newErrors.schoolId = 'Pilih sekolah tujuan'
    }

    if (s === 2) {
      if (!form.parentName.trim()) newErrors.parentName = 'Nama orang tua/wali wajib diisi'
      if (!form.parentPhone.trim()) newErrors.parentPhone = 'No. HP/WA wajib diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 2))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    if (!validateStep(2)) return
    if (!selectedSchool) { setError('Sekolah tujuan tidak valid'); return }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/spmb/daftar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          npsn: selectedSchool.npsn,
          namaSekolah: selectedSchool.nama,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError(data.message || 'Gagal mendaftarkan. Silakan coba lagi.')
      }
    } catch {
      setError('Terjadi kesalahan. Periksa koneksi internet Anda.')
    }

    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-lg mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h1>
            <p className="text-slate-500 mb-6">
              Data siswa <strong className="text-slate-700">{form.namaSiswa.toUpperCase()}</strong> telah terdaftar di{' '}
              <strong className="text-slate-700">{selectedSchool?.nama}</strong>.
            </p>
            {preview && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 ${
                preview.status === 'Diterima' ? 'bg-emerald-50 text-emerald-700' :
                preview.status === 'Batas' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
              }`}>
                <span className="text-sm font-semibold">Status Usia:</span>
                <StatusBadge status={preview.status} />
              </div>
            )}
            <p className="text-xs text-slate-400 mb-8">
              Status pendaftaran akan dikonfirmasi lebih lanjut oleh pihak sekolah.
            </p>
            <div className="flex flex-col gap-3">
              <a href="/daftar-spmb"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Send size={16} /> Daftarkan Siswa Lain
              </a>
              <a href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                <Home size={16} /> Kembali ke Beranda
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Top decoration */}
      <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Pendaftaran SPMB 2026/2027</h1>
          <p className="text-slate-500 mt-1">Sistem Penerimaan Murid Baru — Kabupaten Cirebon</p>
          <p className="text-xs text-slate-400 mt-1">Usia minimal 6 tahun per 1 Juli 2026</p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator current={step} total={3} />

        {/* Form Card */}
        <motion.div layout className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><User size={16} className="text-emerald-600" /></div>
                  <h2 className="text-sm font-bold text-slate-800">Data Siswa</h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap Siswa <span className="text-red-400">*</span></label>
                  <input type="text" value={form.namaSiswa} onChange={(e) => updateField('namaSiswa', e.target.value)}
                    placeholder="Nama lengkap sesuai akta/KK"
                    className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all
                      ${errors.namaSiswa ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-400'}`}
                  />
                  {errors.namaSiswa && <p className="text-xs text-red-500 mt-1">{errors.namaSiswa}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">NISN</label>
                    <input type="text" value={form.nisn} onChange={(e) => updateField('nisn', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Nomor Induk Siswa Nasional"
                      className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK</label>
                    <input type="text" value={form.nik} onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="16 digit NIK (opsional)"
                      className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Lahir <span className="text-red-400">*</span></label>
                    <input type="date" value={form.tanggalLahir} onChange={(e) => updateField('tanggalLahir', e.target.value)}
                      className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all
                        ${errors.tanggalLahir ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-400'}`}
                    />
                    {errors.tanggalLahir && <p className="text-xs text-red-500 mt-1">{errors.tanggalLahir}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Kelamin <span className="text-red-400">*</span></label>
                    <select value={form.jenisKelamin} onChange={(e) => updateField('jenisKelamin', e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Asal Sekolah (PAUD/TK/RA)</label>
                  <select value={form.asalSekolah} onChange={(e) => updateField('asalSekolah', e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  >
                    <option value="PAUD">PAUD</option>
                    <option value="TK">TK</option>
                    <option value="RA">RA</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Age Preview */}
                {preview && (
                  <div className={`p-4 rounded-xl border ${
                    preview.status === 'Diterima' ? 'bg-emerald-50 border-emerald-200' :
                    preview.status === 'Batas' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays size={14} className="text-slate-500" />
                      <StatusBadge status={preview.status} />
                      <span className="text-xs font-medium text-slate-600">Usia: {preview.usia}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{preview.rekomendasi}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alamat Siswa</label>
                  <input type="text" value={form.alamat} onChange={(e) => updateField('alamat', e.target.value)}
                    placeholder="Jl. / RT / RW / Desa / Kecamatan"
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><School size={16} className="text-emerald-600" /></div>
                  <h2 className="text-sm font-bold text-slate-800">Pilih Sekolah Tujuan</h2>
                </div>

                {loadingSchools ? (
                  <div className="flex items-center justify-center py-12"><Loader2 size={24} className="text-emerald-500 animate-spin" /></div>
                ) : schools.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <School size={40} className="text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500">Belum ada data sekolah</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {schools.map((s) => {
                      const isSelected = form.schoolId === s.id
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { updateField('schoolId', s.id); setErrors((prev) => ({ ...prev, schoolId: '' })) }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-500/10'
                              : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                            }`}>
                              {isSelected && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800">{s.nama}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {s.jenjang} — {s.desa ? `${s.desa}, ` : ''}Kec. {s.kecamatan || '-'}
                              </p>
                            </div>
                            <span className="text-xs font-mono text-slate-400">{s.npsn}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
                {errors.schoolId && <p className="text-xs text-red-500">{errors.schoolId}</p>}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><Users size={16} className="text-emerald-600" /></div>
                  <h2 className="text-sm font-bold text-slate-800">Data Orang Tua / Wali</h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Orang Tua / Wali <span className="text-red-400">*</span></label>
                  <input type="text" value={form.parentName} onChange={(e) => updateField('parentName', e.target.value)}
                    placeholder="Nama ayah/ibu/wali"
                    className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all
                      ${errors.parentName ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-400'}`}
                  />
                  {errors.parentName && <p className="text-xs text-red-500 mt-1">{errors.parentName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">No. HP / WhatsApp <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" value={form.parentPhone} onChange={(e) => updateField('parentPhone', e.target.value.replace(/\D/g, ''))}
                      placeholder="0812xxxxxxxx"
                      className={`w-full pl-9 pr-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all
                        ${errors.parentPhone ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-400'}`}
                    />
                  </div>
                  {errors.parentPhone && <p className="text-xs text-red-500 mt-1">{errors.parentPhone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alamat Orang Tua</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                    <textarea value={form.parentAddress} onChange={(e) => updateField('parentAddress', e.target.value)}
                      placeholder="Alamat lengkap orang tua/wali"
                      rows={3}
                      className="w-full pl-9 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-600">Ringkasan Pendaftaran</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <span className="text-slate-500">Siswa:</span>
                    <span className="font-medium text-slate-700 text-right">{form.namaSiswa.toUpperCase() || '-'}</span>
                    <span className="text-slate-500">Lahir:</span>
                    <span className="font-medium text-slate-700 text-right">{form.tanggalLahir || '-'}</span>
                    <span className="text-slate-500">Sekolah:</span>
                    <span className="font-medium text-slate-700 text-right">{selectedSchool?.nama || '-'}</span>
                    <span className="text-slate-500">Status Usia:</span>
                    <span className="text-right">{preview && <StatusBadge status={preview.status} />}</span>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={16} /> Kembali
              </button>
            ) : (
              <div />
            )}
            {step < 2 ? (
              <button onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all"
              >
                Lanjut <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {submitting ? 'Mengirim...' : 'Daftarkan'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Informasi lebih lanjut hubungi Dinas Pendidikan Kabupaten Cirebon
          </p>
        </motion.div>
      </div>
    </div>
  )
}
