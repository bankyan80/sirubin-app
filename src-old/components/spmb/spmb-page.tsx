'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Loader2,
  Download,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Shield,
  Eye,
  Filter,
  Save,
  RefreshCw,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { apiFetch } from '@/lib/api-fetch'

// ==================== TYPES ====================
interface PendaftarItem {
  id: string
  schoolId: string
  npsn: string
  namaSekolah: string
  namaSiswa: string
  nisn: string | null
  tanggalLahir: string
  jenisKelamin: string
  asalSekolah: string
  statusUsia: string
  noUrut: number
  catatan: string | null
  createdAt: string
}

interface KuotaItem {
  id: string
  schoolId: string
  npsn: string
  namaSekolah: string
  rombel: number
  kuota: number
}

interface RekapItem {
  schoolId: string
  npsn: string
  namaSekolah: string
  jenjang: string
  rombel: number
  kuota: number
  totalPendaftar: number
  diterima: number
  batas: number
  ditolak: number
  keterangan: string
}

interface MonitoringData {
  belumInput: string[]
  belumPenuh: { namaSekolah: string; diterima: number; kuota: number; sisa: number }[]
  melebihiKuota: { namaSekolah: string; diterima: number; kuota: number; lembur: number }[]
}

// ==================== TABS ====================
const tabs = [
  { id: 'pendaftar', label: 'Data Pendaftar', icon: ClipboardList },
  { id: 'kuota', label: 'Kuota Sekolah', icon: Users },
  { id: 'rekap', label: 'Rekap SPMB', icon: GraduationCap },
  { id: 'monitoring', label: 'Monitoring', icon: AlertTriangle },
]

// ==================== MAIN ====================
export default function SpmbPage() {
  const [activeTab, setActiveTab] = useState('pendaftar')
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isAdmin = isAuthenticated && user?.role === 'ADMIN'

  if (!isAuthenticated) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Shield size={32} className="text-slate-300" />
        </div>
        <h2 className="text-lg font-bold text-slate-600">Akses Ditolak</h2>
        <p className="text-sm text-slate-400 mt-1">Silakan login terlebih dahulu</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              SPMB{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">2026/2027</span>
            </h1>
            <p className="text-sm text-slate-500">Sistem Penerimaan Murid Baru — Usia minimal 6 tahun per 1 Juli 2026</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-1.5"
      >
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            // School can only see pendaftar tab
            if (!isAdmin && tab.id !== 'pendaftar') return null
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
          {activeTab === 'pendaftar' && <PendaftarTab />}
          {activeTab === 'kuota' && <KuotaTab />}
          {activeTab === 'rekap' && <RekapTab />}
          {activeTab === 'monitoring' && <MonitoringTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ==================== PENDAFTAR TAB ====================
function PendaftarTab() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'

  const [pendaftar, setPendaftar] = useState<PendaftarItem[]>([])
  const [schools, setSchools] = useState<{ id: string; npsn: string; nama: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSchool, setFilterSchool] = useState('')

  // Modal
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [selected, setSelected] = useState<PendaftarItem | null>(null)

  // Add form
  const [form, setForm] = useState({
    namaSiswa: '', nisn: '', tanggalLahir: '', jenisKelamin: 'L', asalSekolah: 'PAUD', schoolId: '', catatan: '',
  })
  // Edit form
  const [editForm, setEditForm] = useState({
    namaSiswa: '', nisn: '', tanggalLahir: '', jenisKelamin: 'L', asalSekolah: 'PAUD', catatan: '',
  })

  // Preview validation
  const [preview, setPreview] = useState<{ status: string; usia: string; rekomendasi: string } | null>(null)

  // Fetch schools (for admin to pick, or auto-select for school user)
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await apiFetch('/api/sekolah')
        const data = await res.json()
        if (data.success) {
          const list = data.data.map((s: { id: string; npsn: string; nama: string }) => ({ id: s.id, npsn: s.npsn, nama: s.nama }))
          setSchools(list)
          // Auto-select for school user
          if (!isAdmin && user?.npsn) {
            const mySchool = list.find(s => s.npsn === user.npsn)
            if (mySchool) setForm(f => ({ ...f, schoolId: mySchool.id }))
          }
        }
      } catch { /* ignore */ }
    }
    fetchSchools()
  }, [isAdmin, user?.npsn])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterStatus) params.set('statusUsia', filterStatus)
      if (!isAdmin && user?.npsn) params.set('npsn', user.npsn)
      else if (filterSchool) params.set('npsn', filterSchool)

      const res = await apiFetch(`/api/spmb/pendaftar?${params}`)
      const data = await res.json()
      if (data.success) setPendaftar(data.data)
    } catch { /* ignore */ }
    setLoading(false)
  }, [search, filterStatus, filterSchool, isAdmin, user?.npsn])

  useEffect(() => { fetchData() }, [fetchData])

  // Preview age validation
  useEffect(() => {
    if (form.tanggalLahir) {
      setPreview(validateAgePreview(form.tanggalLahir))
    } else {
      setPreview(null)
    }
  }, [form.tanggalLahir])

  // Add
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.namaSiswa || !form.tanggalLahir || !form.schoolId) return
    setModalLoading(true)
    try {
      const school = schools.find(s => s.id === form.schoolId)
      const res = await apiFetch('/api/spmb/pendaftar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          npsn: school?.npsn || '',
          namaSekolah: school?.nama || '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowAdd(false)
        setForm({ namaSiswa: '', nisn: '', tanggalLahir: '', jenisKelamin: 'L', asalSekolah: 'PAUD', schoolId: isAdmin ? '' : (user?.npsn ? form.schoolId : ''), catatan: '' })
        fetchData()
      } else {
        alert(data.message || 'Gagal menambah data')
      }
    } catch { alert('Terjadi kesalahan') }
    setModalLoading(false)
  }

  // Edit
  const openEdit = (p: PendaftarItem) => {
    setSelected(p)
    setEditForm({ namaSiswa: p.namaSiswa, nisn: p.nisn || '', tanggalLahir: p.tanggalLahir, jenisKelamin: p.jenisKelamin, asalSekolah: p.asalSekolah, catatan: p.catatan || '' })
    setShowEdit(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setModalLoading(true)
    try {
      const res = await apiFetch(`/api/spmb/pendaftar/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (data.success) {
        setShowEdit(false)
        fetchData()
      } else { alert(data.message || 'Gagal mengubah') }
    } catch { alert('Terjadi kesalahan') }
    setModalLoading(false)
  }

  // Delete
  const openDelete = (p: PendaftarItem) => { setSelected(p); setShowDelete(true) }
  const handleDelete = async () => {
    if (!selected) return
    setModalLoading(true)
    try {
      const res = await apiFetch(`/api/spmb/pendaftar/${selected.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { setShowDelete(false); fetchData() }
      else alert(data.message || 'Gagal menghapus')
    } catch { alert('Terjadi kesalahan') }
    setModalLoading(false)
  }

  // Export
  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (!isAdmin && user?.npsn) params.set('npsn', user.npsn)
      const res = await apiFetch(`/api/spmb/pendaftar?${params}`)
      const data = await res.json()
      if (data.success && data.data.length > 0) {
        const XLSX = await import('xlsx')
        const exportData = data.data.map((p: PendaftarItem, i: number) => ({
          'No': i + 1,
          'Nama Siswa': p.namaSiswa,
          'NISN': p.nisn || '-',
          'Tanggal Lahir': p.tanggalLahir,
          'Jenis Kelamin': p.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          'Asal Sekolah': p.asalSekolah,
          'Sekolah Tujuan': p.namaSekolah,
          'Status Usia': p.statusUsia,
          'No Urut': p.noUrut,
        }))
        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Pendaftar')
        XLSX.writeFile(wb, `spmb-pendaftar-${new Date().toISOString().split('T')[0]}.xlsx`)
      } else {
        alert('Tidak ada data untuk diexport')
      }
    } catch { alert('Gagal export') }
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-1">
        <span className="text-xs text-emerald-700 flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Usia acuan: per 1 Juli 2026</span>
        <span className="text-xs text-emerald-700 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Diterima: lahir ≤ 30 Juni 2020</span>
        <span className="text-xs text-emerald-700 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Batas: lahir = 1 Juli 2020</span>
        <span className="text-xs text-emerald-700 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Ditolak: lahir &gt; 1 Juli 2020</span>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari nama siswa, NISN..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Semua Sekolah</option>
                {schools.map(s => <option key={s.id} value={s.npsn}>{s.nama}</option>)}
              </select>
            )}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua Status</option>
              <option value="Diterima">Diterima</option>
              <option value="Batas">Batas</option>
              <option value="Ditolak">Ditolak</option>
            </select>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20"
            >
              <Plus size={16} /> Tambah Siswa
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"
            >
              <Download size={14} /> Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={24} className="text-emerald-500 animate-spin" /></div>
          ) : pendaftar.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipboardList size={40} className="text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Belum ada data pendaftar</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">No</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nama Siswa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">NISN</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tgl Lahir</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">JK</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Asal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendaftar.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{p.namaSiswa}</p>
                      {!isAdmin && <p className="text-xs text-slate-400 md:hidden">No. {p.nisn || '-'}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell"><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{p.nisn || '-'}</code></td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDate(p.tanggalLahir)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.jenisKelamin === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                        {p.jenisKelamin === 'L' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{p.asalSekolah}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.statusUsia} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={14} /></button>
                        <button onClick={() => openDelete(p)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">Total: {pendaftar.length} pendaftar</p>
        </div>
      </div>

      {/* ===== ADD MODAL ===== */}
      <AnimatePresence>
        {showAdd && (
          <Modal onClose={() => setShowAdd(false)} title="Tambah Pendaftar" icon={Plus}>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Siswa *</label>
                <input type="text" value={form.namaSiswa} onChange={e => setForm({ ...form, namaSiswa: e.target.value })} placeholder="Nama lengkap siswa"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">NISN</label>
                  <input type="text" value={form.nisn} onChange={e => setForm({ ...form, nisn: e.target.value })} placeholder="Opsional"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Lahir *</label>
                  <input type="date" value={form.tanggalLahir} onChange={e => setForm({ ...form, tanggalLahir: e.target.value })} max="2020-07-01"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Kelamin *</label>
                  <select value={form.jenisKelamin} onChange={e => setForm({ ...form, jenisKelamin: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Asal Sekolah</label>
                  <select value={form.asalSekolah} onChange={e => setForm({ ...form, asalSekolah: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="PAUD">PAUD</option>
                    <option value="TK">TK</option>
                    <option value="RA">RA</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sekolah Tujuan *</label>
                  <select value={form.schoolId} onChange={e => setForm({ ...form, schoolId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">-- Pilih Sekolah --</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catatan</label>
                <input type="text" value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} placeholder="Opsional"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              {/* Age Preview */}
              {preview && (
                <div className={`p-3 rounded-xl border ${preview.status === 'Diterima' ? 'bg-emerald-50 border-emerald-200' : preview.status === 'Batas' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={preview.status} />
                    <span className="text-xs font-semibold text-slate-700">Usia: {preview.usia}</span>
                  </div>
                  <p className="text-xs text-slate-600">{preview.rekomendasi}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Batal</button>
                <button type="submit" disabled={modalLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md disabled:opacity-60">
                  {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Tambah
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===== EDIT MODAL ===== */}
      <AnimatePresence>
        {showEdit && selected && (
          <Modal onClose={() => setShowEdit(false)} title="Edit Pendaftar" icon={Edit3}>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Siswa</label>
                <input type="text" value={editForm.namaSiswa} onChange={e => setEditForm({ ...editForm, namaSiswa: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">NISN</label>
                  <input type="text" value={editForm.nisn} onChange={e => setEditForm({ ...editForm, nisn: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Lahir</label>
                  <input type="date" value={editForm.tanggalLahir} onChange={e => setEditForm({ ...editForm, tanggalLahir: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Kelamin</label>
                  <select value={editForm.jenisKelamin} onChange={e => setEditForm({ ...editForm, jenisKelamin: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Asal Sekolah</label>
                  <select value={editForm.asalSekolah} onChange={e => setEditForm({ ...editForm, asalSekolah: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="PAUD">PAUD</option>
                    <option value="TK">TK</option>
                    <option value="RA">RA</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catatan</label>
                <input type="text" value={editForm.catatan} onChange={e => setEditForm({ ...editForm, catatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Batal</button>
                <button type="submit" disabled={modalLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md disabled:opacity-60">
                  {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Simpan
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===== DELETE MODAL ===== */}
      <AnimatePresence>
        {showDelete && selected && (
          <Modal onClose={() => setShowDelete(false)} title="Hapus Data" icon={Trash2}>
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3"><AlertTriangle size={28} className="text-red-500" /></div>
                <p className="text-sm text-slate-600 text-center">Hapus data <strong>{selected.namaSiswa}</strong>?</p>
                <p className="text-xs text-red-500 mt-1">Tindakan ini tidak dapat dibatalkan</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDelete(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Batal</button>
                <button onClick={handleDelete} disabled={modalLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl shadow-md disabled:opacity-60">
                  {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Hapus
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== KUOTA TAB (ADMIN ONLY) ====================
function KuotaTab() {
  const [kuotas, setKuotas] = useState<KuotaItem[]>([])
  const [schools, setSchools] = useState<{ id: string; npsn: string; nama: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [editRombel, setEditRombel] = useState<Record<string, string>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [kuotaRes, schoolRes] = await Promise.all([
        apiFetch('/api/spmb/kuota'),
        apiFetch('/api/sekolah'),
      ])
      const kuotaData = await kuotaRes.json()
      const schoolData = await schoolRes.json()
      if (kuotaData.success) setKuotas(kuotaData.data)
      if (schoolData.success) setSchools(schoolData.data.map((s: { id: string; npsn: string; nama: string }) => ({ id: s.id, npsn: s.npsn, nama: s.nama })))
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Init kuota for all schools
  const initAllKuota = async () => {
    try {
      for (const s of schools) {
        const exists = kuotas.find(k => k.schoolId === s.id)
        if (!exists) {
          await apiFetch('/api/spmb/kuota', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId: s.id, npsn: s.npsn, namaSekolah: s.nama, rombel: 1 }),
          })
        }
      }
      fetchData()
    } catch { /* ignore */ }
  }

  // Inline edit rombel
  const handleRombelChange = (id: string, value: string) => {
    setEditRombel(prev => ({ ...prev, [id]: value }))
  }

  const saveRombel = async (item: KuotaItem) => {
    const newRombel = parseInt(editRombel[item.id] || String(item.rombel))
    if (isNaN(newRombel) || newRombel < 1) return
    setSavingId(item.id)
    try {
      const res = await apiFetch(`/api/spmb/kuota/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rombel: newRombel }),
      })
      const data = await res.json()
      if (data.success) {
        setKuotas(prev => prev.map(k => k.id === item.id ? { ...k, rombel: newRombel, kuota: newRombel * 40 } : k))
        setEditRombel(prev => { const n = { ...prev }; delete n[item.id]; return n })
      }
    } catch { /* ignore */ }
    setSavingId(null)
  }

  const displayKuotas = kuotas.length > 0 ? kuotas : []

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Kuota Penerimaan per Sekolah</h3>
            <p className="text-xs text-slate-500 mt-0.5">Kuota = Rombel × 40 siswa. Edit rombel untuk mengubah kuota.</p>
          </div>
          {schools.length > 0 && kuotas.length === 0 && (
            <button onClick={initAllKuota}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md"
            >
              <RefreshCw size={16} /> Inisialisasi Semua Sekolah
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={24} className="text-emerald-500 animate-spin" /></div>
          ) : displayKuotas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users size={40} className="text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Belum ada data kuota</p>
              <p className="text-xs text-slate-400">Klik &quot;Inisialisasi&quot; untuk membuat kuota dari data sekolah</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">No</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nama Sekolah</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Rombel</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Kuota (R × 40)</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayKuotas.map((k, i) => {
                  const isEditing = editRombel[k.id] !== undefined
                  return (
                    <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{k.namaSekolah}</td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input type="number" min="1" max="20" value={editRombel[k.id]} onChange={e => handleRombelChange(k.id, e.target.value)}
                            className="w-20 px-2 py-1 text-sm text-center bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            autoFocus onBlur={() => saveRombel(k)} onKeyDown={e => { if (e.key === 'Enter') saveRombel(k); if (e.key === 'Escape') { setEditRombel(prev => { const n = { ...prev }; delete n[k.id]; return n }) } }}
                          />
                        ) : (
                          <button onClick={() => setEditRombel(prev => ({ ...prev, [k.id]: String(k.rombel) }))}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            {k.rombel} <Edit3 size={12} />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-lg ${k.kuota > 100 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {k.kuota}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {savingId === k.id ? (
                          <Loader2 size={16} className="text-emerald-500 animate-spin mx-auto" />
                        ) : isEditing ? (
                          <button onClick={() => saveRombel(k)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                            <Save size={16} />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Klik rombel untuk edit</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">{displayKuotas.length} sekolah</p>
        </div>
      </div>
    </div>
  )
}

// ==================== REKAP TAB (ADMIN ONLY) ====================
function RekapTab() {
  const [rekap, setRekap] = useState<RekapItem[]>([])
  const [totals, setTotals] = useState({ totalSekolah: 0, totalPendaftar: 0, totalDiterima: 0, totalBatas: 0, totalDitolak: 0 })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/spmb/rekap')
      const data = await res.json()
      if (data.success) {
        setRekap(data.data.rekap)
        setTotals(data.data.totals)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleExport = async () => {
    try {
      const XLSX = await import('xlsx')
      const exportData = rekap.map((r, i) => ({
        'No': i + 1,
        'Nama Sekolah': r.namaSekolah,
        'Jenjang': r.jenjang,
        'Rombel': r.rombel,
        'Kuota': r.kuota,
        'Total Pendaftar': r.totalPendaftar,
        'Diterima': r.diterima,
        'Batas': r.batas,
        'Ditolak': r.ditolak,
        'Keterangan': r.keterangan,
      }))
      exportData.push({
        'No': '', 'Nama Sekolah': 'TOTAL', 'Jenjang': '', 'Rombel': '', 'Kuota': '', 'Total Pendaftar': totals.totalPendaftar,
        'Diterima': totals.totalDiterima, 'Batas': totals.totalBatas, 'Ditolak': totals.totalDitolak, 'Keterangan': '',
      } as Record<string, unknown>)
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap SPMB')
      XLSX.writeFile(wb, `spmb-rekap-${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch { alert('Gagal export') }
  }

  return (
    <div className="space-y-4">
      {/* Total Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            <span className="text-xs text-slate-500">Sekolah:</span>
            <span className="text-sm font-bold text-slate-800">{totals.totalSekolah}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-500">Pendaftar:</span>
            <span className="text-sm font-bold text-slate-800">{totals.totalPendaftar}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-500">Diterima:</span>
            <span className="text-sm font-bold text-emerald-700">{totals.totalDiterima}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-xs text-slate-500">Batas:</span>
            <span className="text-sm font-bold text-amber-700">{totals.totalBatas}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-500">Ditolak:</span>
            <span className="text-sm font-bold text-red-700">{totals.totalDitolak}</span>
          </div>
        </div>
      </div>

      {/* Rekap Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Rekap SPMB per Sekolah</h3>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"
          >
            <Download size={14} /> Export Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={24} className="text-emerald-500 animate-spin" /></div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">No</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Sekolah</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Rombel</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Pendaftar</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Diterima</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Batas</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Ditolak</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Kuota</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rekap.map((r, i) => (
                  <tr key={r.schoolId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{r.namaSekolah}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600 hidden md:table-cell">{r.rombel}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{r.totalPendaftar}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${r.diterima > 0 ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400'}`}>
                        {r.diterima}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${r.batas > 0 ? 'bg-amber-100 text-amber-700' : 'text-slate-400'}`}>
                        {r.batas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${r.ditolak > 0 ? 'bg-red-100 text-red-700' : 'text-slate-400'}`}>
                        {r.ditolak}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{r.kuota}</td>
                    <td className="px-4 py-3 text-center">
                      <RekapBadge keterangan={r.keterangan} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">{rekap.length} sekolah</p>
        </div>
      </div>
    </div>
  )
}

// ==================== MONITORING TAB (ADMIN ONLY) ====================
function MonitoringTab() {
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/spmb/rekap')
      const data = await res.json()
      if (data.success) setMonitoring(data.data.monitoring)
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 size={24} className="text-emerald-500 animate-spin" /></div>

  return (
    <div className="space-y-4">
      {/* Belum Input */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center"><XCircle size={16} className="text-red-500" /></div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Sekolah Belum Input Pendaftar</h3>
            <p className="text-xs text-slate-500">{monitoring?.belumInput.length || 0} sekolah</p>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {monitoring?.belumInput.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-slate-400">Semua sekolah sudah melakukan input</div>
          ) : (
            monitoring?.belumInput.map((nama, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50">
                <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-500">{i + 1}</span>
                <span className="text-sm text-slate-700">{nama}</span>
                <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600 rounded-full">Belum input</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Belum Penuh */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><AlertTriangle size={16} className="text-amber-500" /></div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Sekolah Kuota Belum Terpenuhi</h3>
            <p className="text-xs text-slate-500">{monitoring?.belumPenuh.length || 0} sekolah</p>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {monitoring?.belumPenuh.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-slate-400">Tidak ada sekolah dengan kuota belum terpenuhi</div>
          ) : (
            monitoring?.belumPenuh.map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50">
                <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-500">{i + 1}</span>
                <span className="text-sm font-medium text-slate-700 flex-1">{item.namaSekolah}</span>
                <span className="text-xs text-slate-500">{item.diterima}/{item.kuota}</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-600 rounded-full">Sisa {item.sisa}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Melebihi Kuota */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><AlertTriangle size={16} className="text-orange-500" /></div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Sekolah Melebihi Kuota</h3>
            <p className="text-xs text-slate-500">{monitoring?.melebihiKuota.length || 0} sekolah</p>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {monitoring?.melebihiKuota.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-slate-400">Tidak ada sekolah yang melebihi kuota</div>
          ) : (
            monitoring?.melebihiKuota.map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50">
                <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-500">{i + 1}</span>
                <span className="text-sm font-medium text-slate-700 flex-1">{item.namaSekolah}</span>
                <span className="text-xs text-slate-500">{item.diterima}/{item.kuota}</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-orange-50 text-orange-600 rounded-full">+{item.lembur} lembur</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== HELPER COMPONENTS ====================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    Diterima: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
    Batas: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertTriangle },
    Ditolak: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  }
  const c = config[status] || config.Diterima
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${c.bg} ${c.text}`}>
      <Icon size={12} /> {status}
    </span>
  )
}

function RekapBadge({ keterangan }: { keterangan: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    Penuh: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    'Belum penuh': { bg: 'bg-amber-100', text: 'text-amber-700' },
    'Melebihi kuota': { bg: 'bg-red-100', text: 'text-red-700' },
    'Belum input': { bg: 'bg-slate-100', text: 'text-slate-500' },
  }
  const c = config[keterangan] || config['Belum input']
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${c.bg} ${c.text}`}>
      {keterangan}
    </span>
  )
}

function Modal({ children, onClose, title, icon: Icon }: {
  children: React.ReactNode
  onClose: () => void
  title: string
  icon: React.ElementType
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-slate-300/50 border border-slate-100 overflow-hidden max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center"><Icon size={18} className="text-white" /></div>
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}

// ==================== UTILITIES ====================

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

function validateAgePreview(tanggalLahir: string): { status: string; usia: string; rekomendasi: string } {
  const refDate = new Date('2026-07-01')
  const birthDate = new Date(tanggalLahir)
  const cutoffAccepted = new Date('2020-06-30')
  const cutoffBatas = new Date('2020-07-01')

  if (birthDate <= cutoffAccepted) {
    let years = refDate.getFullYear() - birthDate.getFullYear()
    let months = refDate.getMonth() - birthDate.getMonth()
    if (months < 0) { years--; months += 12 }
    return { status: 'Diterima', usia: `${years} tahun ${months} bulan`, rekomendasi: 'Memenuhi syarat usia minimal 6 tahun per 1 Juli 2026' }
  } else if (
    birthDate.getFullYear() === cutoffBatas.getFullYear() &&
    birthDate.getMonth() === cutoffBatas.getMonth() &&
    birthDate.getDate() === cutoffBatas.getDate()
  ) {
    return { status: 'Batas', usia: '6 tahun 0 bulan', rekomendasi: 'Batas minimum usia — perlu konfirmasi kepala sekolah' }
  } else {
    let years = refDate.getFullYear() - birthDate.getFullYear()
    let months = refDate.getMonth() - birthDate.getMonth()
    if (months < 0) { years--; months += 12 }
    return { status: 'Ditolak', usia: `${years} tahun ${months} bulan`, rekomendasi: 'Tidak memenuhi syarat usia minimal 6 tahun per 1 Juli 2026' }
  }
}
