'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Edit3, Trash2, Eye, X,
  FileText, ChevronLeft, ChevronRight, Filter, Loader2, AlertTriangle,
  ClipboardCheck, CheckCircle, Clock, Send, CalendarDays, MessageSquare,
} from 'lucide-react'
import LaporanForm, { LaporanData } from './laporan-form'
import LaporanDetailView from './laporan-detail'
import { useAuthStore } from '@/lib/auth-store'
import { apiFetch } from '@/lib/api-fetch'

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

interface LaporanItem {
  id: string
  schoolId: string
  npsn: string
  namaSekolah: string
  jenjang: string
  bulan: number
  tahun: number
  bulanNama: string
  dataSekolahUpdate: boolean
  dataGuruUpdate: boolean
  dataSiswaUpdate: boolean
  jadwalTersedia: boolean
  absensiTersedia: boolean
  arsipTertata: boolean
  kondisiRuangKelas: string
  airBersih: boolean
  toiletLayak: boolean
  kebutuhanMendesak: string | null
  jumlahGuru: number
  jumlahSiswa: number
  jumlahRombel: number
  siswaMasuk: number
  siswaKeluar: number
  siswaL: number
  siswaP: number
  kelas1: number
  kelas2: number
  kelas3: number
  kelas4: number
  kelas5: number
  kelas6: number
  guruPns: number
  guruPppk: number
  guruHonorer: number
  guruGol34: number
  guruGol9: number
  guruUsia2029: number
  guruUsia3039: number
  guruUsia4049: number
  guruUsia5059: number
  guruL: number
  guruP: number
  guruMkKurang5: number
  guruMk5_10: number
  guruMk10_20: number
  guruMkLebih20: number
  guruJabKelas: number
  guruJabMapel: number
  guruJabBK: number
  guruJabLainnya: number
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
  tendikMkKurang5: number
  tendikMk5_10: number
  tendikMk10_20: number
  tendikMkLebih20: number
  tendikJabTU: number
  tendikJabPerpus: number
  tendikJabLab: number
  tendikJabLainnya: number
  fotoUrl: string | null
  fileUrl: string | null
  kendala: string | null
  keterangan: string | null
  adminFeedback: string | null
  persentase: number
  status: string
  submittedAt: string | null
  createdAt: string
}

export default function LaporanBulananPage() {
  const { user, isAuthenticated } = useAuthStore()
  const isAdmin = isAuthenticated && user?.role === 'ADMIN'
  const [laporan, setLaporan] = useState<LaporanItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<LaporanData | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterBulan, setFilterBulan] = useState('')
  const [filterTahun, setFilterTahun] = useState('')
  const [filterJenjang, setFilterJenjang] = useState('')
  const [filterStatus, setFilterStatus] = useState(() => isAuthenticated && user?.role === 'ADMIN' ? 'Submitted' : '')
  const [showFilter, setShowFilter] = useState(false)

  const fetchLaporan = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterBulan) params.set('bulan', filterBulan)
      if (filterTahun) params.set('tahun', filterTahun)
      if (filterJenjang) params.set('jenjang', filterJenjang)
      if (filterStatus) params.set('status', filterStatus)
      if (isAuthenticated && user?.role === 'SEKOLAH' && user?.npsn) {
        params.set('schoolId', user.npsn)
      }
      params.set('limit', '100')

      const res = await apiFetch(`/api/laporan?${params}`)
      const data = await res.json()
      if (data.success) {
        setLaporan(data.data)
        setTotal(data.total)
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [search, filterBulan, filterTahun, filterJenjang, filterStatus, isAuthenticated, user?.npsn, user?.role])

  useEffect(() => { fetchLaporan() }, [fetchLaporan])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await apiFetch(`/api/laporan/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { fetchLaporan(); setDeleteId(null) }
    } catch { /* ignore */ }
  }

  const handleAddNew = () => {
    setEditData(null)
    if (isAuthenticated && user?.role === 'SEKOLAH' && user?.npsn) {
      setShowForm(true)
    } else if (isAuthenticated && user?.role === 'ADMIN') {
      setShowForm(true)
    } else {
      setShowForm(true)
    }
  }

  const handleEdit = (item: LaporanItem) => {
    setEditData({
      id: item.id,
      schoolId: item.schoolId,
      npsn: item.npsn,
      namaSekolah: item.namaSekolah,
      jenjang: item.jenjang,
      bulan: item.bulan,
      tahun: item.tahun,
      dataSekolahUpdate: item.dataSekolahUpdate,
      dataGuruUpdate: item.dataGuruUpdate,
      dataSiswaUpdate: item.dataSiswaUpdate,
      jadwalTersedia: item.jadwalTersedia,
      absensiTersedia: item.absensiTersedia,
      arsipTertata: item.arsipTertata,
      kondisiRuangKelas: item.kondisiRuangKelas,
      airBersih: item.airBersih,
      toiletLayak: item.toiletLayak,
      kebutuhanMendesak: item.kebutuhanMendesak || '',
      jumlahGuru: item.jumlahGuru,
      jumlahSiswa: item.jumlahSiswa,
      jumlahRombel: item.jumlahRombel,
      siswaMasuk: item.siswaMasuk || 0,
      siswaKeluar: item.siswaKeluar || 0,
      siswaL: item.siswaL || 0,
      siswaP: item.siswaP || 0,
      kelas1: item.kelas1 || 0,
      kelas2: item.kelas2 || 0,
      kelas3: item.kelas3 || 0,
      kelas4: item.kelas4 || 0,
      kelas5: item.kelas5 || 0,
      kelas6: item.kelas6 || 0,
      guruPns: item.guruPns || 0,
      guruPppk: item.guruPppk || 0,
      guruHonorer: item.guruHonorer || 0,
      guruGol34: item.guruGol34 || 0,
      guruGol9: item.guruGol9 || 0,
      guruUsia2029: item.guruUsia2029 || 0,
      guruUsia3039: item.guruUsia3039 || 0,
      guruUsia4049: item.guruUsia4049 || 0,
      guruUsia5059: item.guruUsia5059 || 0,
      guruL: item.guruL || 0,
      guruP: item.guruP || 0,
      guruMkKurang5: item.guruMkKurang5 || 0,
      guruMk5_10: item.guruMk5_10 || 0,
      guruMk10_20: item.guruMk10_20 || 0,
      guruMkLebih20: item.guruMkLebih20 || 0,
      guruJabKelas: item.guruJabKelas || 0,
      guruJabMapel: item.guruJabMapel || 0,
      guruJabBK: item.guruJabBK || 0,
      guruJabLainnya: item.guruJabLainnya || 0,
      tendikTotal: item.tendikTotal || 0,
      tendikPns: item.tendikPns || 0,
      tendikPppk: item.tendikPppk || 0,
      tendikHonorer: item.tendikHonorer || 0,
      tendikGol34: item.tendikGol34 || 0,
      tendikGol9: item.tendikGol9 || 0,
      tendikUsia2029: item.tendikUsia2029 || 0,
      tendikUsia3039: item.tendikUsia3039 || 0,
      tendikUsia4049: item.tendikUsia4049 || 0,
      tendikUsia5059: item.tendikUsia5059 || 0,
      tendikL: item.tendikL || 0,
      tendikP: item.tendikP || 0,
      tendikMkKurang5: item.tendikMkKurang5 || 0,
      tendikMk5_10: item.tendikMk5_10 || 0,
      tendikMk10_20: item.tendikMk10_20 || 0,
      tendikMkLebih20: item.tendikMkLebih20 || 0,
      tendikJabTU: item.tendikJabTU || 0,
      tendikJabPerpus: item.tendikJabPerpus || 0,
      tendikJabLab: item.tendikJabLab || 0,
      tendikJabLainnya: item.tendikJabLainnya || 0,
      fotoUrl: item.fotoUrl || '',
      fileUrl: item.fileUrl || '',
      kendala: item.kendala || '',
      keterangan: item.keterangan || '',
      persentase: item.persentase,
      status: item.status,
    })
    setShowForm(true)
  }

  const jenjangBadge: Record<string, string> = {
    TK: 'bg-pink-50 text-pink-700 border-pink-200',
    PAUD: 'bg-violet-50 text-violet-700 border-violet-200',
    SD: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  const statusConfig: Record<string, { badge: string; icon: typeof Clock }> = {
    Draft: { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    Submitted: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Send },
  }

  const clearFilters = () => {
    setFilterBulan('')
    setFilterTahun('')
    setFilterJenjang('')
    setFilterStatus('')
    setSearch('')
  }
  const hasFilters = filterBulan || filterTahun || filterJenjang || filterStatus || search

  // Summary stats
  const submittedCount = laporan.filter((l) => l.status === 'Submitted').length
  const draftCount = laporan.filter((l) => l.status === 'Draft').length
  const avgPersentase = laporan.length > 0 ? Math.round(laporan.reduce((sum, l) => sum + l.persentase, 0) / laporan.length) : 0

  // Detail View
  if (selectedLaporan) {
    return (
      <LaporanDetailView
        laporan={selectedLaporan}
        onBack={() => setSelectedLaporan(null)}
        onEdit={() => handleEdit(selectedLaporan)}
      />
    )
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Laporan Bulanan</h2>
            <p className="text-sm text-slate-500 mt-0.5">{total} laporan tercatat</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Buat Laporan</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{total}</p>
                <p className="text-[11px] text-slate-500">Total Laporan</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Send size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-700">{submittedCount}</p>
                <p className="text-[11px] text-slate-500">Sudah Kirim</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-700">{draftCount}</p>
                <p className="text-[11px] text-slate-500">Draft</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <ClipboardCheck size={18} className="text-violet-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-violet-700">{avgPersentase}%</p>
                <p className="text-[11px] text-slate-500">Rata-rata</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama sekolah, NPSN..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-xl border transition-all ${hasFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-600 bg-white border-slate-200/60 hover:bg-slate-50'}`}
            >
              <Filter size={15} />
              <span>Filter</span>
              {hasFilters && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {[filterBulan, filterTahun, filterJenjang, filterStatus].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
          <AnimatePresence>
            {showFilter && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Bulan</label>
                    <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Semua</option>
                      {BULAN.slice(1).map((b, i) => <option key={i} value={i + 1}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Tahun</label>
                    <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Semua</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Jenjang</label>
                    <select value={filterJenjang} onChange={(e) => setFilterJenjang(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Semua</option>
                      <option value="TK">TK</option>
                      <option value="PAUD">PAUD</option>
                      <option value="SD">SD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Semua</option>
                      <option value="Submitted">Sudah Kirim</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1.5 mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    <X size={12} /> Hapus semua filter
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          {/* Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">No</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nama Sekolah</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Periode</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jenjang</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Administrasi</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Persentase</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Feedback</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12"><Loader2 size={24} className="animate-spin text-slate-400 mx-auto" /><p className="text-sm text-slate-400 mt-2">Memuat data...</p></td></tr>
                ) : laporan.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12"><FileText size={32} className="text-slate-300 mx-auto" /><p className="text-sm text-slate-400 mt-2">Belum ada laporan</p></td></tr>
                ) : laporan.map((l, i) => {
                  const checklistVals = [l.dataSekolahUpdate, l.dataGuruUpdate, l.dataSiswaUpdate, l.jadwalTersedia, l.absensiTersedia, l.arsipTertata]
                  const checkedCount = checklistVals.filter(Boolean).length
                  const sc = statusConfig[l.status] || statusConfig['Draft']
                  const StatusIcon = sc.icon
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-4 py-3 text-sm text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setSelectedLaporan(l)}>{l.namaSekolah}</p>
                        <p className="text-xs text-slate-400">{l.npsn}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-600">{l.bulanNama} {l.tahun}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${jenjangBadge[l.jenjang] || ''}`}>{l.jenjang}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {checklistVals.map((v, ci) => (
                            <div key={ci} className={`w-4 h-4 rounded-full flex items-center justify-center ${v ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                              {v ? <CheckCircle size={11} className="text-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                            </div>
                          ))}
                          <span className="text-[10px] font-semibold text-slate-500 ml-1">{checkedCount}/6</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${l.persentase >= 80 ? 'bg-emerald-400' : l.persentase >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${l.persentase}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${l.persentase >= 80 ? 'text-emerald-600' : l.persentase >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{l.persentase}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${sc.badge}`}>
                          <StatusIcon size={10} />
                          {l.status === 'Submitted' ? 'Dikirim' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {l.adminFeedback ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <MessageSquare size={10} />
                            Diberikan
                          </span>
                        ) : l.status === 'Submitted' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={10} />
                            Menunggu
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setSelectedLaporan(l)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Lihat"><Eye size={15} /></button>
                          <button onClick={() => handleEdit(l)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit"><Edit3 size={15} /></button>
                          <button onClick={() => setDeleteId(l.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Hapus"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="text-center py-12"><Loader2 size={24} className="animate-spin text-slate-400 mx-auto" /><p className="text-sm text-slate-400 mt-2">Memuat...</p></div>
            ) : laporan.length === 0 ? (
              <div className="text-center py-12"><FileText size={32} className="text-slate-300 mx-auto" /><p className="text-sm text-slate-400 mt-2">Belum ada laporan</p></div>
            ) : laporan.map((l) => {
              const checklistVals = [l.dataSekolahUpdate, l.dataGuruUpdate, l.dataSiswaUpdate, l.jadwalTersedia, l.absensiTersedia, l.arsipTertata]
              const checkedCount = checklistVals.filter(Boolean).length
              const sc = statusConfig[l.status] || statusConfig['Draft']
              const StatusIcon = sc.icon
              return (
                <div key={l.id} className="p-4 hover:bg-slate-50/60 transition-colors" onClick={() => setSelectedLaporan(l)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{l.namaSekolah}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{l.npsn} &middot; {l.bulanNama} {l.tahun}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${jenjangBadge[l.jenjang] || ''}`}>{l.jenjang}</span>
                      <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.badge}`}><StatusIcon size={9} />{l.status === 'Submitted' ? 'Dikirim' : 'Draft'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {checklistVals.map((v, ci) => (
                          <div key={ci} className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${v ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                            {v ? <CheckCircle size={9} className="text-emerald-500" /> : <div className="w-1 h-1 rounded-full bg-slate-300" />}
                          </div>
                        ))}
                      </div>
                      <span className={`text-xs font-bold ${l.persentase >= 80 ? 'text-emerald-600' : l.persentase >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{l.persentase}%</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(l) }} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg"><Edit3 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(l.id) }} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {!loading && laporan.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">Menampilkan {laporan.length} dari {total} laporan</p>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><ChevronLeft size={14} /></button>
                <span className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg">1</span>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Laporan Form Modal */}
      <LaporanForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null) }}
        onSaved={fetchLaporan}
        editData={editData}
        schoolInfo={isAuthenticated && user?.role === 'SEKOLAH' ? { id: user.npsn || '', npsn: user.npsn || '', nama: user.name, jenjang: user.jenjang || '' } : null}
      />

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Laporan?</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6">Data laporan yang dihapus tidak dapat dikembalikan.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md shadow-red-500/20 transition-colors">Ya, Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
