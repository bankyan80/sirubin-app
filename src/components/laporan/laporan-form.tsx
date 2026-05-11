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
  // ===== DATA SISWA =====
  jumlahSiswa: number
  jumlahRombel: number
  siswaMasuk: number
  siswaKeluar: number
  siswaL: number
  siswaP: number
  // Per Kelas
  kelas1: number
  kelas2: number
  kelas3: number
  kelas4: number
  kelas5: number
  kelas6: number
  // ===== DATA GURU =====
  jumlahGuru: number
  guruPns: number
  guruPppk: number
  guruHonorer: number
  guruGol34: number   // Guru PNS Gol III & IV
  guruGol9: number    // Guru PPPK Gol IX
  guruUsia2029: number
  guruUsia3039: number
  guruUsia4049: number
  guruUsia5059: number
  guruL: number
  guruP: number
  // Masa Kerja Guru
  guruMkKurang5: number
  guruMk5_10: number
  guruMk10_20: number
  guruMkLebih20: number
  // Jenis Jabatan Guru
  guruJabKelas: number
  guruJabMapel: number
  guruJabBK: number
  guruJabLainnya: number
  // ===== DATA PEGAWAI (Tenaga Kependidikan) =====
  tendikTotal: number
  tendikPns: number
  tendikPppk: number
  tendikHonorer: number
  tendikGol34: number
  tendikGol9: number
  tendikUsia2029: number
  tendikUsia3039: number
  tendikUsia4049: number
  tendikUsia5059: number
  tendikL: number
  tendikP: number
  // Masa Kerja Pegawai
  tendikMkKurang5: number
  tendikMk5_10: number
  tendikMk10_20: number
  tendikMkLebih20: number
  // Jenis Jabatan Pegawai
  tendikJabTU: number
  tendikJabPerpus: number
  tendikJabLab: number
  tendikJabLainnya: number
  // ===== DOKUMEN & CATATAN =====
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
  kebutuhanMendesak: '',
  // Siswa
  jumlahSiswa: 0, jumlahRombel: 0, siswaMasuk: 0, siswaKeluar: 0, siswaL: 0, siswaP: 0,
  kelas1: 0, kelas2: 0, kelas3: 0, kelas4: 0, kelas5: 0, kelas6: 0,
  // Guru
  jumlahGuru: 0, guruPns: 0, guruPppk: 0, guruHonorer: 0, guruGol34: 0, guruGol9: 0,
  guruUsia2029: 0, guruUsia3039: 0, guruUsia4049: 0, guruUsia5059: 0, guruL: 0, guruP: 0,
  guruMkKurang5: 0, guruMk5_10: 0, guruMk10_20: 0, guruMkLebih20: 0,
  guruJabKelas: 0, guruJabMapel: 0, guruJabBK: 0, guruJabLainnya: 0,
  // Pegawai
  tendikTotal: 0, tendikPns: 0, tendikPppk: 0, tendikHonorer: 0, tendikGol34: 0, tendikGol9: 0,
  tendikUsia2029: 0, tendikUsia3039: 0, tendikUsia4049: 0, tendikUsia5059: 0, tendikL: 0, tendikP: 0,
  tendikMkKurang5: 0, tendikMk5_10: 0, tendikMk10_20: 0, tendikMkLebih20: 0,
  tendikJabTU: 0, tendikJabPerpus: 0, tendikJabLab: 0, tendikJabLainnya: 0,
  // Dokumen & catatan
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

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-100 text-blue-700 focus:ring-blue-500/20',
  indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700 focus:ring-indigo-500/20',
  violet: 'bg-violet-50 border-violet-100 text-violet-700 focus:ring-violet-500/20',
  emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700 focus:ring-emerald-500/20',
  teal: 'bg-teal-50 border-teal-100 text-teal-700 focus:ring-teal-500/20',
  cyan: 'bg-cyan-50 border-cyan-100 text-cyan-700 focus:ring-cyan-500/20',
  amber: 'bg-amber-50 border-amber-100 text-amber-700 focus:ring-amber-500/20',
  orange: 'bg-orange-50 border-orange-100 text-orange-700 focus:ring-orange-500/20',
  pink: 'bg-pink-50 border-pink-100 text-pink-700 focus:ring-pink-500/20',
  slate: 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-slate-500/20',
}

function NumCard({ label, color, value, onChange, hint, error }: { label: string; color: string; value: number; onChange: (v: number) => void; hint?: string; error?: boolean }) {
  const cls = colorMap[color] || colorMap.slate
  return (
    <div className={`p-3 rounded-xl border text-center ${error ? 'bg-red-50 border-red-200' : cls.split(' ').slice(0,2).join(' ')}`}>
      <label className={`block text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${error ? 'text-red-600' : 'text-slate-500'}`}>{label}</label>
      <input type="number" min="0" value={value || ''}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className={`w-full text-center text-xl font-bold bg-white border rounded-lg py-1.5 focus:outline-none focus:ring-2 ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' : cls.split(' ').slice(2).join(' ')}`}
      />
      {hint && <p className="text-[9px] text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-[9px] text-red-500 mt-1 font-medium">Wajib diisi</p>}
    </div>
  )
}

function SectionCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50/60 border-blue-100',
    emerald: 'bg-emerald-50/60 border-emerald-100',
    violet: 'bg-violet-50/60 border-violet-100',
    amber: 'bg-amber-50/60 border-amber-100',
    indigo: 'bg-indigo-50/60 border-indigo-100',
  }
  const textColor: Record<string, string> = {
    blue: 'text-blue-700',
    emerald: 'text-emerald-700',
    violet: 'text-violet-700',
    amber: 'text-amber-700',
    indigo: 'text-indigo-700',
  }
  const borderCls = colorMap[color] || 'bg-slate-50/60 border-slate-100'
  const textCls = textColor[color] || 'text-slate-700'
  return (
    <div className={`rounded-xl p-4 space-y-3 border ${borderCls}`}>
      <p className={`text-xs font-bold ${textCls}`}>{title}</p>
      {children}
    </div>
  )
}

export default function LaporanForm({ isOpen, onClose, onSaved, editData, schoolInfo }: LaporanFormProps) {
   const [form, setForm] = useState<LaporanData>(emptyForm)
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')
   const [validationErrors, setValidationErrors] = useState<string[]>([])
   const [fotoFile, setFotoFile] = useState<File | null>(null)
   const [laporanFile, setLaporanFile] = useState<File | null>(null)
   const [activeTab, setActiveTab] = useState<'checklist' | 'sarana' | 'data' | 'dokumen' | 'catatan'>('checklist')
   const [dataSubTab, setDataSubTab] = useState<'siswa' | 'guru' | 'pegawai'>('siswa')
   const [notif, setNotif] = useState<string | null>(null)
   const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
   const isEdit = !!editData?.id

  // Determine if this is PAUD/TK (non-SD) for per-kelas fields
  const isPaudTk = form.jenjang === 'PAUD' || form.jenjang === 'TK'
  const isSd = form.jenjang === 'SD'
  // Sekolah swasta: PNS/PPPK/Golongan tidak perlu diisi
  // Auto-detect: jika nama sekolah mengandung "NEGERI" maka negeri, sisanya swasta
  const detectSwasta = (nama: string) => {
    if (!nama) return false
    return !nama.toUpperCase().includes('NEGERI')
  }
  const [isSwasta, setIsSwasta] = useState(false)

  useEffect(() => {
    if (editData) {
      setForm({ ...editData, kebutuhanMendesak: editData.kebutuhanMendesak || '', kendala: editData.kendala || '', keterangan: editData.keterangan || '' })
      setIsSwasta(detectSwasta(editData.namaSekolah))
    } else {
      setForm({
        ...emptyForm,
        schoolId: schoolInfo?.id || '',
        npsn: schoolInfo?.npsn || '',
        namaSekolah: schoolInfo?.nama || '',
        jenjang: schoolInfo?.jenjang || '',
      })
      setIsSwasta(detectSwasta(schoolInfo?.nama || ''))
    }
    setError('')
    setActiveTab('checklist')
    setDataSubTab('siswa')
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

  // Fungsi validasi data
  const validateForm = (f: LaporanData, isSubmit: boolean): string[] => {
    const errors: string[] = []
    
    // Validasi dasar (selalu)
    if (!f.schoolId) errors.push('ID Sekolah wajib diisi')
    if (!f.npsn) errors.push('NPSN wajib diisi')
    if (!f.namaSekolah) errors.push('Nama sekolah wajib diisi')
    if (!f.bulan || f.bulan < 1 || f.bulan > 12) errors.push('Bulan harus antara 1-12')
    if (!f.tahun || f.tahun < 2020 || f.tahun > 2030) errors.push('Tahun tidak valid')
    
    // Validasi hanya untuk Submit (bukan Draft)
    if (isSubmit) {
      // Validasi Data Siswa
      if (f.jumlahSiswa <= 0) errors.push('Total siswa harus lebih dari 0')
      if (f.jumlahRombel <= 0) errors.push('Jumlah rombel harus lebih dari 0')
      if (f.siswaL + f.siswaP !== f.jumlahSiswa) {
        errors.push(`Total siswa L+P (${f.siswaL + f.siswaP}) tidak sama dengan total siswa (${f.jumlahSiswa})`)
      }
      
      // Validasi per kelas (hanya untuk SD)
      if (isSd) {
        const totalPerKelas = f.kelas1 + f.kelas2 + f.kelas3 + f.kelas4 + f.kelas5 + f.kelas6
        if (totalPerKelas !== f.jumlahSiswa) {
          errors.push(`Total per kelas (${totalPerKelas}) tidak sama dengan total siswa (${f.jumlahSiswa})`)
        }
      } else if (isPaudTk) {
        const totalPerKelas = f.kelas1 + f.kelas2
        if (totalPerKelas !== f.jumlahSiswa) {
          errors.push(`Total per kelompok (${totalPerKelas}) tidak sama dengan total siswa (${f.jumlahSiswa})`)
        }
      }
      
      // Validasi Data Guru
      if (f.jumlahGuru <= 0) errors.push('Total guru harus lebih dari 0')
      if (f.guruPns + f.guruPppk + f.guruHonorer !== f.jumlahGuru) {
        errors.push(`Total guru berdasarkan status (${f.guruPns + f.guruPppk + f.guruHonorer}) tidak sama dengan total guru (${f.jumlahGuru})`)
      }
      if (f.guruL + f.guruP !== f.jumlahGuru) {
        errors.push(`Total guru L+P (${f.guruL + f.guruP}) tidak sama dengan total guru (${f.jumlahGuru})`)
      }
      
      // Validasi golongan guru (hanya untuk sekolah negeri)
      if (!isSwasta) {
        if (f.guruPns > 0 && f.guruGol34 <= 0) errors.push('Guru PNS Gol III & IV harus diisi untuk sekolah negeri')
        if (f.guruPppk > 0 && f.guruGol9 <= 0) errors.push('Guru PPPK Gol IX harus diisi untuk sekolah negeri')
      }
      
      // Validasi Data Pegawai
      if (f.tendikTotal <= 0) errors.push('Total tenaga kependidikan harus lebih dari 0')
      if (f.tendikPns + f.tendikPppk + f.tendikHonorer !== f.tendikTotal) {
        errors.push(`Total tendik berdasarkan status (${f.tendikPns + f.tendikPppk + f.tendikHonorer}) tidak sama dengan total tendik (${f.tendikTotal})`)
      }
      if (f.tendikL + f.tendikP !== f.tendikTotal) {
        errors.push(`Total tendik L+P (${f.tendikL + f.tendikP}) tidak sama dengan total tendik (${f.tendikTotal})`)
      }
      
      // Validasi golongan tendik (hanya untuk sekolah negeri)
      if (!isSwasta) {
        if (f.tendikPns > 0 && f.tendikGol34 <= 0) errors.push('Tendik PNS Gol III & IV harus diisi untuk sekolah negeri')
        if (f.tendikPppk > 0 && f.tendikGol9 <= 0) errors.push('Tendik PPPK Gol IX harus diisi untuk sekolah negeri')
      }
    }
    
    return errors
  }

   const handleSubmit = async (submitStatus: string) => {
     setError('')
     const isSubmit = submitStatus === 'Submitted'
     
     // Validasi form
     const errors = validateForm(form, isSubmit)
     if (errors.length > 0) {
       setValidationErrors(errors)
       setError(errors[0]) // Tampilkan error pertama di UI
       // Scroll ke bagian error
       const errorElement = document.querySelector('.error-message')
       if (errorElement) {
         errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
       }
       return
     }
     
     setLoading(true)
     try {
       const payload: Record<string, any> = { ...form, status: submitStatus }
       let res
       if (fotoFile || laporanFile) {
         const formData = new FormData()
         Object.keys(payload).forEach(key => {
           if (payload[key] !== undefined && payload[key] !== null) {
             formData.append(key, String(payload[key]))
           }
         })
         if (fotoFile) formData.append('foto', fotoFile)
         if (laporanFile) formData.append('dokumen', laporanFile)
         res = await apiFetch('/api/laporan', { method: 'POST', body: formData })
       } else {
         res = await apiFetch('/api/laporan', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload),
         })
       }
       const data = await res.json()
       if (!data.success) {
         setError(data.message || 'Gagal menyimpan laporan')
         alert(data.message || 'Gagal menyimpan laporan')
         setLoading(false)
         return
       }
       alert('Laporan berhasil dikirim!')
       onSaved()
       onClose()
     } catch {
       setError('Terjadi kesalahan koneksi')
       alert('Terjadi kesalahan koneksi')
       setLoading(false)
     }
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
    <>
      {notif && (
        <div className="fixed top-5 right-5 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg z-50">
          {notif}
        </div>
      )}
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

          {/* Sekolah Swasta Toggle */}
          {form.jenjang && (
            <div className="mx-6 mt-3 flex items-center justify-end gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Sekolah Swasta</span>
              <button
                onClick={() => setIsSwasta(!isSwasta)}
                className={`relative w-10 h-5 rounded-full transition-colors ${isSwasta ? 'bg-blue-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isSwasta ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              {isSwasta && <span className="text-[10px] text-amber-600 font-medium">(PNS/PPPK/Golongan tidak perlu diisi)</span>}
            </div>
          )}

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
            <div className="p-6 min-h-[320px] max-h-[60vh] overflow-y-auto">
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

              {/* C. Data Bulanan - 3 Sub Tabs: Data Siswa, Data Guru, Data Pegawai */}
              {activeTab === 'data' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Sub-tab nav - 3 tabs */}
                  <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
                    <button onClick={() => setDataSubTab('siswa')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${dataSubTab === 'siswa' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      👨‍🎓 Data Siswa
                    </button>
                    <button onClick={() => setDataSubTab('guru')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${dataSubTab === 'guru' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      👩‍🏫 Data Guru
                    </button>
                    <button onClick={() => setDataSubTab('pegawai')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${dataSubTab === 'pegawai' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      👷 Data Pegawai
                    </button>
                  </div>

                  {/* ======================== SUB TAB: DATA SISWA ======================== */}
                  {dataSubTab === 'siswa' && (
                    <div className="space-y-4">
                      <SectionCard title="Jumlah Siswa" color="violet">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <NumCard label="Total Siswa" color="violet" value={form.jumlahSiswa}
                            onChange={v => setForm({ ...form, jumlahSiswa: v })} />
                          <NumCard label="Rombel" color="emerald" value={form.jumlahRombel}
                            onChange={v => setForm({ ...form, jumlahRombel: v })} />
                        </div>
                      </SectionCard>

                      <SectionCard title="Jenis Kelamin" color="blue">
                        <div className="grid grid-cols-2 gap-3">
                          <NumCard label="Laki-laki" color="blue" value={form.siswaL}
                            onChange={v => setForm({ ...form, siswaL: v })} />
                          <NumCard label="Perempuan" color="pink" value={form.siswaP}
                            onChange={v => setForm({ ...form, siswaP: v })} />
                        </div>
                      </SectionCard>

                      <SectionCard title={isPaudTk ? "Jumlah Siswa per Kelompok" : "Jumlah Siswa per Kelas"} color="indigo">
                        <div className="grid grid-cols-2 gap-3">
                          {isPaudTk ? (
                            <>
                              <NumCard label="Kelompok A" color="indigo" value={form.kelas1}
                                onChange={v => setForm({ ...form, kelas1: v })} />
                              <NumCard label="Kelompok B" color="indigo" value={form.kelas2}
                                onChange={v => setForm({ ...form, kelas2: v })} />
                            </>
                          ) : (
                            <>
                              <NumCard label="Kelas 1" color="indigo" value={form.kelas1}
                                onChange={v => setForm({ ...form, kelas1: v })} />
                              <NumCard label="Kelas 2" color="indigo" value={form.kelas2}
                                onChange={v => setForm({ ...form, kelas2: v })} />
                              <NumCard label="Kelas 3" color="indigo" value={form.kelas3}
                                onChange={v => setForm({ ...form, kelas3: v })} />
                              <NumCard label="Kelas 4" color="indigo" value={form.kelas4}
                                onChange={v => setForm({ ...form, kelas4: v })} />
                              <NumCard label="Kelas 5" color="indigo" value={form.kelas5}
                                onChange={v => setForm({ ...form, kelas5: v })} />
                              <NumCard label="Kelas 6" color="indigo" value={form.kelas6}
                                onChange={v => setForm({ ...form, kelas6: v })} />
                            </>
                          )}
                        </div>
                      </SectionCard>

                      <SectionCard title="Mutasi (opsional)" color="amber">
                        <div className="grid grid-cols-2 gap-3">
                          <NumCard label="Siswa Masuk" color="cyan" value={form.siswaMasuk}
                            onChange={v => setForm({ ...form, siswaMasuk: v })} hint="pindahan dari luar" />
                          <NumCard label="Siswa Keluar" color="orange" value={form.siswaKeluar}
                            onChange={v => setForm({ ...form, siswaKeluar: v })} hint="pindah ke sekolah lain" />
                        </div>
                      </SectionCard>
                    </div>
                  )}

                  {/* ======================== SUB TAB: DATA GURU ======================== */}
                  {dataSubTab === 'guru' && (
                    <div className="space-y-4">
                      <SectionCard title="Total Guru" color="blue">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <NumCard label="Total Guru" color="blue" value={form.jumlahGuru}
                            onChange={v => setForm({ ...form, jumlahGuru: v })} />
                          <NumCard label="Guru PNS" color="indigo" value={form.guruPns}
                            onChange={v => setForm({ ...form, guruPns: v })} />
                          <NumCard label="Guru PPPK" color="violet" value={form.guruPppk}
                            onChange={v => setForm({ ...form, guruPppk: v })} />
                          <NumCard label="Guru Honorer" color="amber" value={form.guruHonorer}
                            onChange={v => setForm({ ...form, guruHonorer: v })} />
                        </div>
                      </SectionCard>

                      <SectionCard title="Jenis Kelamin" color="blue">
                        <div className="grid grid-cols-2 gap-3">
                          <NumCard label="Laki-laki" color="blue" value={form.guruL}
                            onChange={v => setForm({ ...form, guruL: v })} />
                          <NumCard label="Perempuan" color="pink" value={form.guruP}
                            onChange={v => setForm({ ...form, guruP: v })} />
                        </div>
                      </SectionCard>

                      {!isSwasta && (
                        <SectionCard title="Golongan" color="indigo">
                          <div className="grid grid-cols-2 gap-3">
                            <NumCard label="Gol III & IV (PNS)" color="indigo" value={form.guruGol34}
                              onChange={v => setForm({ ...form, guruGol34: v })} hint="Guru PNS" />
                            <NumCard label="Gol IX (PPPK)" color="violet" value={form.guruGol9}
                              onChange={v => setForm({ ...form, guruGol9: v })} hint="Guru PPPK" />
                          </div>
                        </SectionCard>
                      )}

                      <SectionCard title="Usia Guru" color="slate">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <NumCard label="20–29 th" color="slate" value={form.guruUsia2029}
                            onChange={v => setForm({ ...form, guruUsia2029: v })} />
                          <NumCard label="30–39 th" color="slate" value={form.guruUsia3039}
                            onChange={v => setForm({ ...form, guruUsia3039: v })} />
                          <NumCard label="40–49 th" color="slate" value={form.guruUsia4049}
                            onChange={v => setForm({ ...form, guruUsia4049: v })} />
                          <NumCard label="50–59 th" color="slate" value={form.guruUsia5059}
                            onChange={v => setForm({ ...form, guruUsia5059: v })} />
                        </div>
                      </SectionCard>

                      <SectionCard title="Masa Kerja Guru" color="amber">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <NumCard label="< 5 thn" color="amber" value={form.guruMkKurang5}
                            onChange={v => setForm({ ...form, guruMkKurang5: v })} />
                          <NumCard label="5–10 thn" color="amber" value={form.guruMk5_10}
                            onChange={v => setForm({ ...form, guruMk5_10: v })} />
                          <NumCard label="10–20 thn" color="amber" value={form.guruMk10_20}
                            onChange={v => setForm({ ...form, guruMk10_20: v })} />
                          <NumCard label="> 20 thn" color="amber" value={form.guruMkLebih20}
                            onChange={v => setForm({ ...form, guruMkLebih20: v })} />
                        </div>
                      </SectionCard>

                      <SectionCard title="Jenis Jabatan Guru" color="teal">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <NumCard label="Guru Kelas" color="teal" value={form.guruJabKelas}
                            onChange={v => setForm({ ...form, guruJabKelas: v })} />
                          <NumCard label="Guru Mapel" color="cyan" value={form.guruJabMapel}
                            onChange={v => setForm({ ...form, guruJabMapel: v })} />
                          <NumCard label="Guru BK" color="emerald" value={form.guruJabBK}
                            onChange={v => setForm({ ...form, guruJabBK: v })} />
                          <NumCard label="Lainnya" color="slate" value={form.guruJabLainnya}
                            onChange={v => setForm({ ...form, guruJabLainnya: v })} />
                        </div>
                      </SectionCard>
                    </div>
                  )}

                  {/* ======================== SUB TAB: DATA PEGAWAI ======================== */}
                  {dataSubTab === 'pegawai' && (
                    <div className="space-y-4">
                      <SectionCard title="Total Tenaga Kependidikan" color="emerald">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <NumCard label="Total Tendik" color="emerald" value={form.tendikTotal}
                            onChange={v => setForm({ ...form, tendikTotal: v })} />
                          <NumCard label="Tendik PNS" color="teal" value={form.tendikPns}
                            onChange={v => setForm({ ...form, tendikPns: v })} />
                          <NumCard label="Tendik PPPK" color="cyan" value={form.tendikPppk}
                            onChange={v => setForm({ ...form, tendikPppk: v })} />
                          <NumCard label="Tendik Honorer" color="amber" value={form.tendikHonorer}
                            onChange={v => setForm({ ...form, tendikHonorer: v })} />
                        </div>
                      </SectionCard>

                      <SectionCard title="Jenis Kelamin" color="emerald">
                        <div className="grid grid-cols-2 gap-3">
                          <NumCard label="Laki-laki" color="blue" value={form.tendikL}
                            onChange={v => setForm({ ...form, tendikL: v })} />
                          <NumCard label="Perempuan" color="pink" value={form.tendikP}
                            onChange={v => setForm({ ...form, tendikP: v })} />
                        </div>
                      </SectionCard>

                      {!isSwasta && (
                        <SectionCard title="Golongan" color="teal">
                          <div className="grid grid-cols-2 gap-3">
                            <NumCard label="Gol III & IV (PNS)" color="teal" value={form.tendikGol34}
                              onChange={v => setForm({ ...form, tendikGol34: v })} hint="Tendik PNS" />
                            <NumCard label="Gol IX (PPPK)" color="cyan" value={form.tendikGol9}
                              onChange={v => setForm({ ...form, tendikGol9: v })} hint="Tendik PPPK" />
                          </div>
                        </SectionCard>
                      )}

                      <SectionCard title="Usia Pegawai" color="slate">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <NumCard label="20–29 th" color="slate" value={form.tendikUsia2029}
                            onChange={v => setForm({ ...form, tendikUsia2029: v })} />
                          <NumCard label="30–39 th" color="slate" value={form.tendikUsia3039}
                            onChange={v => setForm({ ...form, tendikUsia3039: v })} />
                          <NumCard label="40–49 th" color="slate" value={form.tendikUsia4049}
                            onChange={v => setForm({ ...form, tendikUsia4049: v })} />
                          <NumCard label="50–59 th" color="slate" value={form.tendikUsia5059}
                            onChange={v => setForm({ ...form, tendikUsia5059: v })} />
                        </div>
                      </SectionCard>

                      <SectionCard title="Masa Kerja Pegawai" color="amber">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <NumCard label="< 5 thn" color="amber" value={form.tendikMkKurang5}
                            onChange={v => setForm({ ...form, tendikMkKurang5: v })} />
                          <NumCard label="5–10 thn" color="amber" value={form.tendikMk5_10}
                            onChange={v => setForm({ ...form, tendikMk5_10: v })} />
                          <NumCard label="10–20 thn" color="amber" value={form.tendikMk10_20}
                            onChange={v => setForm({ ...form, tendikMk10_20: v })} />
                          <NumCard label="> 20 thn" color="amber" value={form.tendikMkLebih20}
                            onChange={v => setForm({ ...form, tendikMkLebih20: v })} />
                        </div>
                      </SectionCard>

                      <SectionCard title="Jenis Jabatan Pegawai" color="emerald">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <NumCard label="Tata Usaha" color="emerald" value={form.tendikJabTU}
                            onChange={v => setForm({ ...form, tendikJabTU: v })} />
                          <NumCard label="Perpustakaan" color="teal" value={form.tendikJabPerpus}
                            onChange={v => setForm({ ...form, tendikJabPerpus: v })} />
                          <NumCard label="Laboratorium" color="cyan" value={form.tendikJabLab}
                            onChange={v => setForm({ ...form, tendikJabLab: v })} />
                          <NumCard label="Lainnya" color="slate" value={form.tendikJabLainnya}
                            onChange={v => setForm({ ...form, tendikJabLainnya: v })} />
                        </div>
                      </SectionCard>

                      <p className="text-[11px] text-slate-400 italic">* Untuk sekolah swasta, isi sesuai status kepegawaian yang berlaku.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* D. Dokumentasi */}
              {activeTab === 'dokumen' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div>
                    <label className={labelCls}>Upload Foto Dokumentasi (opsional)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                      <Camera size={28} className="text-slate-300 mx-auto mb-2" />
                      <label htmlFor="upload-foto" className="text-sm text-slate-500 cursor-pointer">Klik untuk upload foto</label>
                      <p className="text-[11px] text-slate-400 mt-1">JPG, PNG (max 5MB)</p>
                      <input id="upload-foto" type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setFotoFile(file) }} />
                    </div>
                    {fotoFile && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <Camera size={14} className="text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-emerald-800 truncate flex-1">{fotoFile.name}</span>
                        <span className="text-[11px] text-emerald-600 flex-shrink-0">({Math.round(fotoFile.size / 1024)} KB)</span>
                        <button onClick={() => setFotoFile(null)} className="p-1 text-emerald-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Upload File Laporan (opsional)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                      <Upload size={28} className="text-slate-300 mx-auto mb-2" />
                      <label htmlFor="upload-file" className="text-sm text-slate-500 cursor-pointer">Klik untuk upload file</label>
                      <p className="text-[11px] text-slate-400 mt-1">PDF, DOCX (max 10MB)</p>
                      <input id="upload-file" type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setLaporanFile(file) }} />
                    </div>
                    {laporanFile && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <FileText size={14} className="text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-emerald-800 truncate flex-1">{laporanFile.name}</span>
                        <span className="text-[11px] text-emerald-600 flex-shrink-0">({Math.round(laporanFile.size / 1024)} KB)</span>
                        <button onClick={() => setLaporanFile(null)} className="p-1 text-emerald-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    )}
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
    </>
  )
}