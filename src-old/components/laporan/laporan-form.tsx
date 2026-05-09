'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiFetch } from '@/lib/api-fetch'
import {
  X, Loader2, Save, Send, CheckCircle, Circle, AlertTriangle,
  School, Users, GraduationCap, Droplets, Building, FileText,
  Camera, Upload, ClipboardCheck,
} from 'lucide-react'

interface LaporanFormProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  editData?: LaporanData | null
  schoolInfo?: { id: string; npsn: string; nama: string; jenjang: string } | null
}

export interface LaporanData {
  id?: string
  schoolId: string
  npsn: string
  namaSekolah: string
  jenjang: string
  bulan: number
  tahun: number
  dataSekolahUpdate: boolean
  dataGuruUpdate: boolean
  dataSiswaUpdate: boolean
  jadwalTersedia: boolean
  absensiTersedia: boolean
  arsipTertata: boolean
  kondisiRuangKelas: string
  airBersih: boolean
  toiletLayak: boolean
  kebutuhanMendesak: string
  jumlahGuru: number
  jumlahSiswa: number
  jumlahRombel: number
  fotoUrl: string
  fileUrl: string
  kendala: string
  keterangan: string
  persentase: number
  status: string
}

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()

const emptyForm: LaporanData = {
  schoolId: '', npsn: '', namaSekolah: '', jenjang: '', bulan: currentMonth, tahun: currentYear,
  dataSekolahUpdate: false, dataGuruUpdate: false, dataSiswaUpdate: false,
  jadwalTersedia: false, absensiTersedia: false, arsipTertata: false,
  kondisiRuangKelas: 'Baik', airBersih: false, toiletLayak: false,
  kebutuhanMendesak: '', jumlahGuru: 0, jumlahSiswa: 0, jumlahRombel: 0,
  fotoUrl: '', fileUrl: '', kendala: '', keterangan: '',
  persentase: 0, status: 'Draft',
}

const checklistItems = [
  { key: 'dataSekolahUpdate' as const, label: 'Data sekolah terupdate', icon: School },
  { key: 'dataGuruUpdate' as const, label: 'Data guru terupdate', icon: Users },
  { key: 'dataSiswaUpdate' as const, label: 'Data siswa terupdate', icon: GraduationCap },
  { key: 'jadwalTersedia' as const, label: 'Jadwal tersedia', icon: ClipboardCheck },
  { key: 'absensiTersedia' as const, label: 'Absensi tersedia', icon: FileText },
  { key: 'arsipTertata' as const, label: 'Arsip administrasi tertata', icon: Building },
]

export default function LaporanForm({ isOpen, onClose, onSaved, editData, schoolInfo }: LaporanFormProps) {
  const [form, setForm] = useState<LaporanData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'checklist' | 'sarana' | 'data' | 'dokumen' | 'catatan'>('checklist')
  const isEdit = !!editData?.id

  useEffect(() => {
    if (editData) {
      setForm({ ...editData, kebutuhanMendesak: editData.kebutuhanMendesak || '', kendala: editData.kendala || '', keterangan: editData.keterangan || '' })
    } else {
      setForm({
        ...emptyForm,
        schoolId: schoolInfo?.id || '',
        npsn: schoolInfo?.npsn || '',
        namaSekolah: schoolInfo?.nama || '',
        jenjang: schoolInfo?.jenjang || '',
      })
    }
    setError('')
    setActiveTab('checklist')
  }, [editData, schoolInfo, isOpen])

  const toggleChecklist = (key: keyof LaporanData) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const calculatePersentase = (f: LaporanData) => {
    const items = [f.dataSekolahUpdate, f.dataGuruUpdate, f.dataSiswaUpdate, f.jadwalTersedia, f.absensiTersedia, f.arsipTertata]
    return Math.round(items.filter(Boolean).length / 6 * 100)
  }

  const currentPersentase = calculatePersentase(form)
  const checklistCount = [form.dataSekolahUpdate, form.dataGuruUpdate, form.dataSiswaUpdate, form.jadwalTersedia, form.absensiTersedia, form.arsipTertata].filter(Boolean).length

  const handleSubmit = async (submitStatus: string) => {
    setError('')
    if (!form.schoolId || !form.npsn || !form.namaSekolah || !form.bulan || !form.tahun) {
      setError('Data sekolah dan periode bulan/tahun wajib diisi')
      return
    }
    setLoading(true)
    try {
      const payload = { ...form, status: submitStatus }
      const res = await apiFetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); setLoading(false); return }
      onSaved()
      onClose()
    } catch { setError('Terjadi kesalahan koneksi'); setLoading(false) }
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all duration-200'
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5'

  const tabs = [
    { id: 'checklist' as const, label: 'Administrasi', icon: ClipboardCheck },
    { id: 'sarana' as const, label: 'Sarana', icon: Building },
    { id: 'data' as const, label: 'Data Bulanan', icon: Users },
    { id: 'dokumen' as const, label: 'Dokumen', icon: Camera },
    { id: 'catatan' as const, label: 'Catatan', icon: FileText },
  ]

  const statusColor = currentPersentase >= 80 ? 'text-emerald-600 bg-emerald-50' : currentPersentase >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
  const statusText = currentPersentase >= 80 ? 'Baik' : currentPersentase >= 50 ? 'Perlu Perhatian' : 'Perlu Tindakan'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-start justify-center pt-6 px-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 px-6 py-5">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/5 rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Laporan' : 'Laporan Bulanan Baru'}</h2>
                  <p className="text-sm text-white/70 mt-0.5">
                    {form.namaSekolah || 'Pilih Sekolah'} &middot; {BULAN[form.bulan]} {form.tahun}
                  </p>
                </div>
                <button onClick={onClose} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Identity Bar */}
            <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Nama Sekolah</label>
                  <p className="text-sm font-semibold text-slate-700 truncate">{form.namaSekolah || '-'}</p>
                </div>
                <div className="min-w-[80px]">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Jenjang</label>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">{form.jenjang || '-'}</span>
                </div>
                <div className="min-w-[100px]">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Bulan</label>
                  <select value={form.bulan} onChange={(e) => setForm({ ...form, bulan: parseInt(e.target.value) })} className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    {BULAN.slice(1).map((b, i) => <option key={i} value={i + 1}>{b}</option>)}
                  </select>
                </div>
                <div className="min-w-[80px]">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Tahun</label>
                  <select value={form.tahun} onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) })} className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Percentage Bar */}
            <div className="mx-6 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={15} className="text-blue-500" />
                  <span className="text-xs font-semibold text-slate-600">Administrasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{statusText}</span>
                  <span className="text-sm font-bold text-slate-800">{checklistCount}/6</span>
                  <span className="text-xs text-slate-400">({currentPersentase}%)</span>
                </div>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentPersentase}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${currentPersentase >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : currentPersentase >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                />
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 mt-4">
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Icon size={13} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 min-h-[320px]">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle size={15} />
                  {error}
                </div>
              )}

              {/* A. Checklist Administrasi */}
              {activeTab === 'checklist' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <p className="text-xs text-slate-500 mb-4">
                    Centang item yang sudah tersedia / terupdate di sekolah Anda. Nilai persentase dihitung otomatis dari checklist ini.
                  </p>
                  {checklistItems.map((item, idx) => {
                    const Icon = item.icon
                    const checked = form[item.key] as boolean
                    return (
                      <button
                        key={item.key}
                        onClick={() => toggleChecklist(item.key)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${checked ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${checked ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                          {checked ? (
                            <CheckCircle size={20} className="text-emerald-600" />
                          ) : (
                            <Circle size={20} className="text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${checked ? 'text-emerald-800' : 'text-slate-600'}`}>{item.label}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {idx + 1}
                        </div>
                      </button>
                    )
                  })}
                </motion.div>
              )}

              {/* B. Sarana & Prasarana */}
              {activeTab === 'sarana' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div>
                    <label className={labelCls}>Kondisi Ruang Kelas</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Baik', 'Rusak Ringan', 'Rusak Berat'].map((val) => (
                        <button
                          key={val}
                          onClick={() => setForm({ ...form, kondisiRuangKelas: val })}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-center ${form.kondisiRuangKelas === val ? (val === 'Baik' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : val === 'Rusak Ringan' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-red-400 bg-red-50 text-red-700') : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setForm({ ...form, airBersih: !form.airBersih })}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${form.airBersih ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.airBersih ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        <Droplets size={18} className={form.airBersih ? 'text-blue-600' : 'text-slate-400'} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${form.airBersih ? 'text-blue-700' : 'text-slate-600'}`}>Air Bersih</p>
                        <p className="text-[11px] text-slate-400">{form.airBersih ? 'Tersedia' : 'Tidak tersedia'}</p>
                      </div>
                      <div className="ml-auto">{form.airBersih ? <CheckCircle size={18} className="text-blue-500" /> : <Circle size={18} className="text-slate-300" />}</div>
                    </button>

                    <button
                      onClick={() => setForm({ ...form, toiletLayak: !form.toiletLayak })}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${form.toiletLayak ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.toiletLayak ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <Building size={18} className={form.toiletLayak ? 'text-emerald-600' : 'text-slate-400'} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${form.toiletLayak ? 'text-emerald-700' : 'text-slate-600'}`}>Toilet Layak</p>
                        <p className="text-[11px] text-slate-400">{form.toiletLayak ? 'Layak pakai' : 'Tidak layak'}</p>
                      </div>
                      <div className="ml-auto">{form.toiletLayak ? <CheckCircle size={18} className="text-emerald-500" /> : <Circle size={18} className="text-slate-300" />}</div>
                    </button>
                  </div>

                  <div>
                    <label className={labelCls}>Kebutuhan Mendesak</label>
                    <textarea
                      value={form.kebutuhanMendesak}
                      onChange={(e) => setForm({ ...form, kebutuhanMendesak: e.target.value })}
                      placeholder="Jelaskan kebutuhan mendesak sekolah..."
                      rows={3}
                      className={inputCls}
                    />
                  </div>
                </motion.div>
              )}

              {/* C. Data Singkat Bulanan */}
              {activeTab === 'data' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <p className="text-xs text-slate-500">Masukkan data terkini bulan ini.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 text-center">
                      <Users size={24} className="text-blue-500 mx-auto mb-2" />
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Jumlah Guru</label>
                      <input
                        type="number"
                        value={form.jumlahGuru || ''}
                        onChange={(e) => setForm({ ...form, jumlahGuru: parseInt(e.target.value) || 0 })}
                        className="w-full text-center text-2xl font-bold text-blue-700 bg-white border border-blue-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        min="0"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">orang</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 text-center">
                      <GraduationCap size={24} className="text-violet-500 mx-auto mb-2" />
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Jumlah Siswa</label>
                      <input
                        type="number"
                        value={form.jumlahSiswa || ''}
                        onChange={(e) => setForm({ ...form, jumlahSiswa: parseInt(e.target.value) || 0 })}
                        className="w-full text-center text-2xl font-bold text-violet-700 bg-white border border-violet-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        min="0"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">orang</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 text-center">
                      <School size={24} className="text-emerald-500 mx-auto mb-2" />
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Jumlah Rombel</label>
                      <input
                        type="number"
                        value={form.jumlahRombel || ''}
                        onChange={(e) => setForm({ ...form, jumlahRombel: parseInt(e.target.value) || 0 })}
                        className="w-full text-center text-2xl font-bold text-emerald-700 bg-white border border-emerald-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        min="0"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">rombel</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* D. Dokumentasi */}
              {activeTab === 'dokumen' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div>
                    <label className={labelCls}>Upload Foto Dokumentasi (opsional)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                      <Camera size={28} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Klik untuk upload foto</p>
                      <p className="text-[11px] text-slate-400 mt-1">JPG, PNG (max 5MB)</p>
                      <input type="file" accept="image/*" className="hidden" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Upload File Laporan (opsional)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                      <Upload size={28} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Klik untuk upload file</p>
                      <p className="text-[11px] text-slate-400 mt-1">PDF, DOCX (max 10MB)</p>
                      <input type="file" accept=".pdf,.docx,.doc" className="hidden" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* E. Catatan */}
              {activeTab === 'catatan' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div>
                    <label className={labelCls}>Kendala Bulan Ini</label>
                    <textarea
                      value={form.kendala}
                      onChange={(e) => setForm({ ...form, kendala: e.target.value })}
                      placeholder="Tuliskan kendala yang dialami bulan ini..."
                      rows={4}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Keterangan Tambahan</label>
                    <textarea
                      value={form.keterangan}
                      onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                      placeholder="Keterangan atau informasi tambahan..."
                      rows={4}
                      className={inputCls}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
                Batal
              </button>
              <div className="flex-1" />
              <button
                onClick={() => handleSubmit('Draft')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan Draft
              </button>
              <button
                onClick={() => handleSubmit('Submitted')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Kirim Laporan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
