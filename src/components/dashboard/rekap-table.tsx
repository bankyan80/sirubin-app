'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileText, School, ChevronLeft, ChevronRight, Loader2, Filter, X } from 'lucide-react'
import { apiFetch } from '@/lib/api-fetch'

interface SchoolRow {
  schoolId: string
  npsn: string
  nama: string
  jenjang: string
  kecamatan: string
  monthly: { bulan: number; bulanNama: string; persentase: number; status: string }[]
  avgPersentase: number
  sudahLapor: number
  totalBulan: number
  belumLapor: number
}

interface RekapData {
  schoolData: SchoolRow[]
  months: { value: number; label: string }[]
  kecamatanList: string[]
}

const BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function persentaseColor(pct: number) {
  if (pct < 0) return 'bg-slate-100 text-slate-400'
  if (pct >= 80) return 'bg-emerald-100 text-emerald-700'
  if (pct >= 60) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function persentaseBadge(pct: number) {
  if (pct < 0) return 'bg-slate-100 text-slate-400'
  if (pct >= 80) return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (pct >= 60) return 'bg-amber-50 text-amber-700 border border-amber-200'
  return 'bg-red-50 text-red-700 border border-red-200'
}

export default function RekapTable() {
  const [data, setData] = useState<RekapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterTahun, setFilterTahun] = useState(String(new Date().getFullYear()))
  const [filterBulan, setFilterBulan] = useState('')
  const [filterJenjang, setFilterJenjang] = useState('')
  const [filterKecamatan, setFilterKecamatan] = useState('')
  const [tablePage, setTablePage] = useState(0)
  const TABLE_PAGE_SIZE = 15
  const [showFilter, setShowFilter] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('tahun', filterTahun)
      if (filterBulan) params.set('bulan', filterBulan)
      if (filterJenjang) params.set('jenjang', filterJenjang)
      if (filterKecamatan) params.set('kecamatan', filterKecamatan)
      const res = await apiFetch(`/api/rekapitulasi?${params}`)
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }, [filterTahun, filterBulan, filterJenjang, filterKecamatan])

  useEffect(() => {
    fetchData()
    setTablePage(0)
  }, [fetchData])

  const clearFilters = () => {
    setFilterJenjang('')
    setFilterKecamatan('')
    setFilterBulan('')
  }

  const hasFilters = filterJenjang || filterKecamatan || filterBulan

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 mt-4">Memuat data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <FileText size={40} className="text-slate-300 mb-3" />
        <p className="text-sm text-slate-500">Tidak ada data</p>
      </div>
    )
  }

  const { schoolData } = data

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Status Laporan Bulanan</h2>
        <p className="text-sm text-slate-500 mt-0.5">Tabel rekapitulasi per sekolah</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border transition-all ${hasFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-600 bg-white border-slate-200/60 hover:bg-slate-50'}`}
          >
            <Filter size={15} />
            <span>Filter</span>
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {[filterBulan, filterJenjang, filterKecamatan].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <X size={12} /> Hapus filter
            </button>
          )}
        </div>

        {showFilter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Tahun</label>
                <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Bulan</label>
                <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Semua Bulan</option>
                  {BULAN.slice(1).map((b, i) => (
                    <option key={i} value={i + 1}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Jenjang</label>
                <select value={filterJenjang} onChange={(e) => setFilterJenjang(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Semua Jenjang</option>
                  <option value="TK">TK</option>
                  <option value="PAUD">PAUD</option>
                  <option value="SD">SD</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Kecamatan</label>
                <select value={filterKecamatan} onChange={(e) => setFilterKecamatan(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Semua</option>
                  {data.kecamatanList.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Tabel Rekapitulasi per Sekolah</h3>
            <p className="text-sm text-slate-500">Persentase kepatuhan administrasi per bulan</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-200" /> ≥80%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-200" /> 60-79%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-200" />
              {'<'}60%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-100" /> Belum
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="sticky left-0 bg-slate-50 z-10 text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Sekolah</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jenjang</th>
                {data.months.map((m) => (
                  <th key={m.value} className="text-center px-2 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider min-w-[56px]">
                    {m.label.slice(0, 3)}
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-blue-50">Rata-rata</th>
                <th className="text-center px-3 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {schoolData.slice(tablePage * TABLE_PAGE_SIZE, (tablePage + 1) * TABLE_PAGE_SIZE).map((s, i) => (
                <tr key={s.npsn} className="hover:bg-blue-50/30 transition-colors">
                  <td className="sticky left-0 bg-white z-10 px-4 py-2.5">
                    <p className="font-semibold text-slate-800 truncate max-w-[180px]">{s.nama}</p>
                    <p className="text-[11px] text-slate-400">{s.npsn}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        s.jenjang === 'TK'
                          ? 'bg-pink-50 text-pink-700 border-pink-200'
                          : s.jenjang === 'PAUD'
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {s.jenjang}
                    </span>
                  </td>
                  {s.monthly.map((m) => (
                    <td key={m.bulan} className="text-center px-2 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${persentaseColor(m.persentase)}`}>
                        {m.persentase < 0 ? '-' : `${m.persentase}%`}
                      </span>
                    </td>
                  ))}
                  <td className="text-center px-3 py-2.5 bg-blue-50/30">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${persentaseBadge(s.avgPersentase)}`}>
                      {s.avgPersentase > 0 ? `${s.avgPersentase}%` : '-'}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <span className="text-xs text-slate-600 font-medium">
                      {s.sudahLapor}/{s.totalBulan}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Menampilkan {tablePage * TABLE_PAGE_SIZE + 1}-{Math.min((tablePage + 1) * TABLE_PAGE_SIZE, schoolData.length)} dari {schoolData.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTablePage(Math.max(0, tablePage - 1))}
              disabled={tablePage === 0}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.ceil(schoolData.length / TABLE_PAGE_SIZE) }, (_, i) => (
              <button
                key={i}
                onClick={() => setTablePage(i)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  tablePage === i ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))
              .slice(Math.max(0, tablePage - 2), tablePage + 3)
              .map((btn, idx) => (
                <span key={idx}>{btn}</span>
              ))}
            <button
              onClick={() => setTablePage(Math.min(Math.ceil(schoolData.length / TABLE_PAGE_SIZE) - 1, tablePage + 1))}
              disabled={tablePage >= Math.ceil(schoolData.length / TABLE_PAGE_SIZE) - 1}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}