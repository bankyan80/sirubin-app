'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Loader2,
  ChevronDown,
  FileText,
  Users,
  GraduationCap,
  AlertTriangle,
  Eye,
  CalendarDays,
  BarChart3,
  MapPin,
  School,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { apiFetch } from '@/lib/api-fetch'

// ==================== CONSTANTS ====================
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
const BULAN_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

type StatusType = 'sudah' | 'belum' | 'belum_waktu'

interface MonthStatus {
  status: StatusType
  persentase: number
  laporanId: string | null
}

interface SchoolStatus {
  schoolId: string
  npsn: string
  nama: string
  jenjang: string
  kecamatan: string
  monthlyStatus: MonthStatus[]
  totalSudah: number
  totalBulan: number
  persentase: number
}

interface FilterOptions {
  kecamatan: string[]
  jenjang: string[]
}

interface SelectedCell {
  school: SchoolStatus
  bulanIndex: number
  monthData: MonthStatus
}

interface LaporanDetail {
  id: string
  namaSekolah: string
  jenjang: string
  bulan: number
  tahun: number
  persentase: number
  dataSekolahUpdate: boolean
  dataGuruUpdate: boolean
  dataSiswaUpdate: boolean
  jadwalTersedia: boolean
  absensiTersedia: boolean
  arsipTertata: boolean
  jumlahGuru: number
  jumlahSiswa: number
  jumlahRombel: number
  kendala: string | null
  keterangan: string | null
  submittedAt: string
}

// ==================== MAIN COMPONENT ====================
export default function StatusGrid() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isAdmin = isAuthenticated && user?.role === 'ADMIN'

  const [data, setData] = useState<SchoolStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ kecamatan: [], jenjang: [] })

  // Filters
  const [tahun, setTahun] = useState(2026)
  const [jenjang, setJenjang] = useState('')
  const [kecamatan, setKecamatan] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Detail modal
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [laporanDetail, setLaporanDetail] = useState<LaporanDetail | null>(null)

  // Filter dropdowns
  const [showJenjangDrop, setShowJenjangDrop] = useState(false)
  const [showKecamatanDrop, setShowKecamatanDrop] = useState(false)
  const [showTahunDrop, setShowTahunDrop] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('tahun', String(tahun))
      if (jenjang) params.set('jenjang', jenjang)
      if (kecamatan) params.set('kecamatan', kecamatan)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await apiFetch(`/api/dashboard/status?${params}`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
        setFilterOptions({ kecamatan: result.filters.kecamatan, jenjang: result.filters.jenjang })
      }
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [tahun, jenjang, kecamatan, debouncedSearch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = () => {
      setShowJenjangDrop(false)
      setShowKecamatanDrop(false)
      setShowTahunDrop(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Cell click → fetch detail
  const handleCellClick = async (school: SchoolStatus, bulanIndex: number, monthData: MonthStatus) => {
    setSelectedCell({ school, bulanIndex, monthData })
    setLaporanDetail(null)

    if (monthData.status === 'sudah' && monthData.laporanId) {
      setDetailLoading(true)
      try {
        const res = await apiFetch(`/api/laporan/${monthData.laporanId}`)
        const result = await res.json()
        if (result.success) setLaporanDetail(result.data)
      } catch {
        /* ignore */
      }
      setDetailLoading(false)
    }
  }

  // Filter the data for school users (only their own school)
  const displayData = isAdmin ? data : data.filter((d) => d.npsn === user?.npsn)

  // Summary stats
  const totalSchools = displayData.length
  const totalActive = displayData[0]?.totalBulan || 0
  const avgPersentase = totalSchools > 0 ? Math.round(displayData.reduce((s, d) => s + d.persentase, 0) / totalSchools) : 0
  const completedSchools = displayData.filter((d) => d.persentase === 100).length

  // Checklist labels
  const checklistItems = [
    { key: 'dataSekolahUpdate', label: 'Data Sekolah Update' },
    { key: 'dataGuruUpdate', label: 'Data Guru Update' },
    { key: 'dataSiswaUpdate', label: 'Data Siswa Update' },
    { key: 'jadwalTersedia', label: 'Jadwal Tersedia' },
    { key: 'absensiTersedia', label: 'Absensi Tersedia' },
    { key: 'arsipTertata', label: 'Arsip Tertata' },
  ] as const

  return (
    <div className="space-y-5">
      {/* ===== HEADER ===== */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {isAuthenticated && user && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 mb-1">
                Selamat datang, <span className="font-semibold text-slate-700">{user.name}</span>
              </motion.p>
            )}
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              Status Laporan{' '}
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">Bulanan</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Monitoring real-time kelengkapan laporan sekolah</p>
          </div>
        </div>
      </motion.div>

      {/* ===== SUMMARY BAR ===== */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { icon: School, label: 'Total Sekolah', value: totalSchools, gradient: 'from-blue-500 to-cyan-500' },
          { icon: CalendarDays, label: 'Bulan Aktif', value: `${totalActive} / 12`, gradient: 'from-violet-500 to-purple-500' },
          { icon: BarChart3, label: 'Rata-rata %', value: `${avgPersentase}%`, gradient: 'from-emerald-500 to-teal-500' },
          { icon: CheckCircle2, label: '100% Lengkap', value: completedSchools, gradient: 'from-amber-500 to-orange-500' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-slate-200/60 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
              <item.icon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 leading-tight">{item.label}</p>
              <p className="text-lg font-bold text-slate-800 leading-tight">{item.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ===== FILTER BAR ===== */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Tahun */}
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setShowTahunDrop(!showTahunDrop); setShowJenjangDrop(false); setShowKecamatanDrop(false) }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <CalendarDays size={13} />
              {tahun}
              <ChevronDown size={12} className={`transition-transform ${showTahunDrop ? 'rotate-180' : ''}`} />
            </button>
            {showTahunDrop && (
              <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1">
                {[2024, 2025, 2026, 2027].map((y) => (
                  <button key={y} onClick={() => { setTahun(y); setShowTahunDrop(false) }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${y === tahun ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-600'}`}
                  >{y}/{y + 1}</button>
                ))}
              </div>
            )}
          </div>

          {/* Jenjang */}
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setShowJenjangDrop(!showJenjangDrop); setShowKecamatanDrop(false); setShowTahunDrop(false) }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <GraduationCap size={13} />
              {jenjang || 'Jenjang'}
              <ChevronDown size={12} className={`transition-transform ${showJenjangDrop ? 'rotate-180' : ''}`} />
            </button>
            {showJenjangDrop && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1">
                <button onClick={() => { setJenjang(''); setShowJenjangDrop(false) }}
                  className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 ${!jenjang ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-600'}`}
                >Semua Jenjang</button>
                {filterOptions.jenjang.map((j) => (
                  <button key={j} onClick={() => { setJenjang(j); setShowJenjangDrop(false) }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 ${jenjang === j ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-600'}`}
                  >{j}</button>
                ))}
              </div>
            )}
          </div>

          {/* Kecamatan */}
          {isAdmin && (
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowKecamatanDrop(!showKecamatanDrop); setShowJenjangDrop(false); setShowTahunDrop(false) }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <MapPin size={13} />
                {kecamatan ? (kecamatan.length > 12 ? kecamatan.slice(0, 12) + '...' : kecamatan) : 'Kecamatan'}
                <ChevronDown size={12} className={`transition-transform ${showKecamatanDrop ? 'rotate-180' : ''}`} />
              </button>
              {showKecamatanDrop && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 max-h-56 overflow-y-auto">
                  <button onClick={() => { setKecamatan(''); setShowKecamatanDrop(false) }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 ${!kecamatan ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-600'}`}
                  >Semua Kecamatan</button>
                  {filterOptions.kecamatan.map((k) => (
                    <button key={k} onClick={() => { setKecamatan(k); setShowKecamatanDrop(false) }}
                      className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 ${kecamatan === k ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-600'}`}
                    >{k}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div className="flex-1 min-w-[180px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama sekolah / NPSN..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ===== LEGEND ===== */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        {[
          { dot: 'bg-emerald-500', text: 'Sudah Lapor', icon: CheckCircle2 },
          { dot: 'bg-red-400', text: 'Belum Lapor', icon: XCircle },
          { dot: 'bg-slate-200', text: 'Belum Waktunya', icon: Clock },
        ].map((l) => (
          <div key={l.text} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${l.dot}`} />
            <span className="text-[11px] text-slate-500">{l.text}</span>
          </div>
        ))}
      </div>

      {/* ===== MAIN TABLE ===== */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="text-blue-500 animate-spin" />
              <span className="ml-2 text-sm text-slate-500">Memuat data...</span>
            </div>
          ) : displayData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText size={40} className="text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">Tidak ada data</p>
              <p className="text-xs text-slate-400 mt-1">Coba ubah filter atau tahun</p>
            </div>
          ) : (
            <table className="w-full min-w-[900px]">
              {/* Header */}
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80">
                  <th className="sticky left-0 z-20 bg-slate-50/95 backdrop-blur-sm text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100 min-w-[200px]">
                    Sekolah
                  </th>
                  {BULAN.map((b, i) => {
                    const now = new Date()
                    const isCurrentMonth = tahun === now.getFullYear() && i === now.getMonth()
                    return (
                      <th key={b} className={`text-center px-1 py-3 text-[11px] font-semibold uppercase tracking-wider min-w-[52px] ${isCurrentMonth ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
                        <div className="flex flex-col items-center gap-0.5">
                          <span>{b}</span>
                          {isCurrentMonth && <div className="w-1 h-1 rounded-full bg-blue-500" />}
                        </div>
                      </th>
                    )
                  })}
                  <th className="text-center px-3 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-l border-slate-100 min-w-[60px]">
                    Total
                  </th>
                  <th className="text-center px-3 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider min-w-[60px]">
                    %
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-100/80">
                {displayData.map((school) => {
                  const rowBg = school.persentase >= 75
                    ? 'bg-emerald-50/30'
                    : school.totalBulan > 0 && school.persentase < 40
                      ? 'bg-red-50/30'
                      : ''

                  return (
                    <tr key={school.schoolId} className={`hover:bg-slate-50/60 transition-colors ${rowBg}`}>
                      {/* School Name - Sticky */}
                      <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-r border-slate-100 group">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                            school.jenjang === 'TK' ? 'bg-pink-100 text-pink-600'
                              : school.jenjang === 'PAUD' ? 'bg-violet-100 text-violet-600'
                                : 'bg-blue-100 text-blue-600'
                          }`}>
                            {school.jenjang}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate max-w-[160px]" title={school.nama}>{school.nama}</p>
                            <p className="text-[10px] text-slate-400 truncate">{school.kecamatan}</p>
                          </div>
                        </div>
                      </td>

                      {/* Month Cells */}
                      {school.monthlyStatus.map((monthData, bi) => {
                        const now = new Date()
                        const isCurrentMonth = tahun === now.getFullYear() && bi === now.getMonth()

                        return (
                          <td key={bi} className={`text-center px-1 py-2 ${isCurrentMonth ? 'bg-blue-50/30' : ''}`}>
                            <CellButton
                              monthData={monthData}
                              bulanIndex={bi}
                              school={school}
                              onClick={() => handleCellClick(school, bi, monthData)}
                            />
                          </td>
                        )
                      })}

                      {/* Total */}
                      <td className="text-center px-3 py-2.5 border-l border-slate-100">
                        <span className="text-xs font-semibold text-slate-700">
                          {school.totalSudah}/{school.totalBulan}
                        </span>
                      </td>

                      {/* Percentage */}
                      <td className="text-center px-3 py-2.5">
                        <PercentageBadge persentase={school.persentase} totalBulan={school.totalBulan} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {displayData.length} sekolah &middot; Tahun {tahun}/{tahun + 1} &middot; {totalActive} bulan aktif
          </p>
          <p className="text-[11px] text-slate-400">
            Klik cell untuk detail
          </p>
        </div>
      </motion.div>

      {/* ===== DETAIL MODAL ===== */}
      <AnimatePresence>
        {selectedCell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => { setSelectedCell(null); setLaporanDetail(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-slate-300/50 border border-slate-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`px-5 py-4 ${
                selectedCell.monthData.status === 'sudah'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : selectedCell.monthData.status === 'belum'
                    ? 'bg-gradient-to-r from-red-500 to-rose-600'
                    : 'bg-gradient-to-r from-slate-500 to-slate-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {BULAN_FULL[selectedCell.bulanIndex]} {tahun}
                    </h3>
                    <p className="text-xs text-white/70 mt-0.5">{selectedCell.school.nama}</p>
                  </div>
                  <button onClick={() => { setSelectedCell(null); setLaporanDetail(null) }}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5">
                {/* Status */}
                <div className="flex items-center gap-3 mb-4">
                  <StatusIcon status={selectedCell.monthData.status} size={28} />
                  <div>
                    <p className={`text-sm font-bold ${
                      selectedCell.monthData.status === 'sudah' ? 'text-emerald-700'
                        : selectedCell.monthData.status === 'belum' ? 'text-red-700'
                          : 'text-slate-600'
                    }`}>
                      {selectedCell.monthData.status === 'sudah' ? 'Sudah Lapor'
                        : selectedCell.monthData.status === 'belum' ? 'Belum Lapor'
                          : 'Belum Waktunya'}
                    </p>
                    {selectedCell.monthData.status === 'sudah' && (
                      <p className="text-xs text-slate-500">Persentase: {selectedCell.monthData.persentase}%</p>
                    )}
                  </div>
                  {selectedCell.monthData.status === 'sudah' && (
                    <div className="ml-auto">
                      <PercentageBadge persentase={selectedCell.monthData.persentase} totalBulan={1} large />
                    </div>
                  )}
                </div>

                {/* Detail Content */}
                {selectedCell.monthData.status === 'belum_waktu' && (
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <Clock size={24} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Bulan {BULAN_FULL[selectedCell.bulanIndex]} {tahun} belum tiba.</p>
                    <p className="text-xs text-slate-400 mt-1">Laporan dapat diisi mulai bulan berjalan.</p>
                  </div>
                )}

                {selectedCell.monthData.status === 'belum' && (
                  <div className="p-4 bg-red-50 rounded-xl text-center">
                    <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-red-700">Sekolah ini belum mengirim laporan</p>
                    <p className="text-xs text-red-500 mt-1">untuk bulan {BULAN_FULL[selectedCell.bulanIndex]} {tahun}</p>
                  </div>
                )}

                {selectedCell.monthData.status === 'sudah' && detailLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="text-blue-500 animate-spin" />
                    <span className="ml-2 text-xs text-slate-500">Memuat detail...</span>
                  </div>
                )}

                {selectedCell.monthData.status === 'sudah' && !detailLoading && laporanDetail && (
                  <div className="space-y-4">
                    {/* Checklist */}
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Checklist Administrasi</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {checklistItems.map((item) => {
                          const checked = laporanDetail[item.key] as boolean
                          return (
                            <div key={item.key} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] ${checked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                              {checked ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} />}
                              {item.label}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Data */}
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Bulanan</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-slate-400">Guru</p>
                          <p className="text-sm font-bold text-slate-800">{laporanDetail.jumlahGuru}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-slate-400">Siswa</p>
                          <p className="text-sm font-bold text-slate-800">{laporanDetail.jumlahSiswa}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-slate-400">Rombel</p>
                          <p className="text-sm font-bold text-slate-800">{laporanDetail.jumlahRombel}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {(laporanDetail.keterangan || laporanDetail.kendala) && (
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Catatan</p>
                        {laporanDetail.keterangan && (
                          <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 mb-1.5">{laporanDetail.keterangan}</p>
                        )}
                        {laporanDetail.kendala && (
                          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5">{laporanDetail.kendala}</p>
                        )}
                      </div>
                    )}

                    {/* Submitted */}
                    {laporanDetail.submittedAt && (
                      <p className="text-[10px] text-slate-400 text-right">
                        Disubmit: {new Date(laporanDetail.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                )}

                {selectedCell.monthData.status === 'sudah' && !detailLoading && !laporanDetail && (
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-500">Detail laporan tidak tersedia</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== SUB COMPONENTS ====================

function CellButton({ monthData, bulanIndex, school, onClick }: {
  monthData: MonthStatus
  bulanIndex: number
  school: SchoolStatus
  onClick: () => void
}) {
  const tooltip = monthData.status === 'sudah'
    ? `Sudah lapor (${monthData.persentase}%)`
    : monthData.status === 'belum'
      ? 'Belum lapor'
      : 'Belum waktunya'

  const config = {
    sudah: {
      dot: 'bg-emerald-500 shadow-sm shadow-emerald-500/30',
      bg: 'bg-emerald-50 hover:bg-emerald-100 cursor-pointer',
      ring: 'ring-2 ring-emerald-200',
    },
    belum: {
      dot: 'bg-red-400 shadow-sm shadow-red-400/30',
      bg: 'bg-red-50 hover:bg-red-100 cursor-pointer',
      ring: 'ring-2 ring-red-200',
    },
    belum_waktu: {
      dot: 'bg-slate-200',
      bg: 'bg-transparent cursor-default',
      ring: '',
    },
  }

  const c = config[monthData.status]

  return (
    <button
      onClick={monthData.status !== 'belum_waktu' ? onClick : undefined}
      title={`${school.nama} — ${BULAN_FULL[bulanIndex]}: ${tooltip}`}
      disabled={monthData.status === 'belum_waktu'}
      className={`w-9 h-9 mx-auto rounded-lg ${c.bg} flex items-center justify-center transition-all duration-150 active:scale-90 ${monthData.status !== 'belum_waktu' ? c.ring : ''}`}
    >
      <div className={`w-3 h-3 rounded-full ${c.dot} transition-transform duration-150 ${monthData.status !== 'belum_waktu' ? 'hover:scale-125' : ''}`} />
    </button>
  )
}

function PercentageBadge({ persentase, totalBulan, large = false }: { persentase: number; totalBulan: number; large?: boolean }) {
  if (totalBulan === 0) return <span className={`font-semibold ${large ? 'text-base' : 'text-xs'} text-slate-300`}>-</span>

  let color = 'text-slate-500'
  let bg = 'bg-slate-100'
  if (persentase >= 75) { color = 'text-emerald-700'; bg = 'bg-emerald-100' }
  else if (persentase >= 50) { color = 'text-amber-700'; bg = 'bg-amber-100' }
  else if (persentase > 0) { color = 'text-red-700'; bg = 'bg-red-100' }

  return (
    <span className={`inline-flex items-center justify-center ${large ? 'w-12 h-12' : 'px-2 py-0.5'} rounded-lg ${bg} ${color} ${large ? 'text-lg' : 'text-xs'} font-bold`}>
      {persentase}%
    </span>
  )
}

function StatusIcon({ status, size = 24 }: { status: StatusType; size?: number }) {
  const config = {
    sudah: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    belum: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
    belum_waktu: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-100' },
  }
  const c = config[status]
  const Icon = c.icon
  return (
    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={size} className={c.color} />
    </div>
  )
}
