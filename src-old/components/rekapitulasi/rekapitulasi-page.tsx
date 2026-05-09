'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Download, Printer, ChevronDown, ChevronUp,
  School, FileText, TrendingUp, TrendingDown, AlertTriangle,
  Trophy, BarChart3, CheckCircle, XCircle, Eye, Clock,
  Award, Users, GraduationCap, Target, Zap,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, Legend, Cell, PieChart, Pie,
} from 'recharts'
import { apiFetch } from '@/lib/api-fetch'

// --- Types ---
interface RekapData {
  summary: { totalSekolah: number; sudahLapor: number; belumLapor: number; avgPersentase: number }
  schoolData: SchoolRow[]
  perJenjang: { jenjang: string; total: number; sudahLapor: number; belumLapor: number; avgPersentase: number }[]
  monthlyTrend: { bulan: number; bulanNama: string; total: number; avgPersentase: number; tk: number; paud: number; sd: number }[]
  ranking: { rank: number; schoolId: string; npsn: string; nama: string; jenjang: string; kecamatan: string; monthly: { bulan: number; bulanNama: string; persentase: number; status: string }[]; avgPersentase: number; sudahLapor: number; totalBulan: number; belumLapor: number }[]
  insights: { type: string; icon: string; text: string; color: string }[]
  warnings: { type: string; school: string; jenjang: string; message: string; npsn: string }[]
  kecamatanList: string[]
  tahun: number
  bulan: number | null
  filterJenjang: string
  filterKecamatan: string
  months: { value: number; label: string }[]
}

interface SchoolRow {
  schoolId: string; npsn: string; nama: string; jenjang: string; kecamatan: string
  monthly: { bulan: number; bulanNama: string; persentase: number; status: string }[]
  avgPersentase: number; sudahLapor: number; totalBulan: number; belumLapor: number
}

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const BULAN_SHORT = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

const insightIcons: Record<string, typeof Trophy> = { trophy: Trophy, alert: AlertTriangle, 'trend-up': TrendingUp, 'trend-down': TrendingDown }
const insightColors: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
}

const jenjangColors: Record<string, string> = { TK: '#ec4899', PAUD: '#8b5cf6', SD: '#3b82f6' }

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

// --- Tooltip ---
const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-bold text-slate-700">{entry.value}%</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function RekapitulasiPage() {
  const [data, setData] = useState<RekapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterTahun, setFilterTahun] = useState(String(new Date().getFullYear()))
  const [filterBulan, setFilterBulan] = useState('')
  const [filterJenjang, setFilterJenjang] = useState('')
  const [filterKecamatan, setFilterKecamatan] = useState('')
  const [activeSection, setActiveSection] = useState('ringkasan')
  const [tablePage, setTablePage] = useState(0)
  const TABLE_PAGE_SIZE = 15
  const printRef = useRef<HTMLDivElement>(null)

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
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [filterTahun, filterBulan, filterJenjang, filterKecamatan])

  useEffect(() => { fetchData(); setTablePage(0) }, [fetchData])

  // Export Excel
  const handleExportExcel = async () => {
    if (!data) return
    try {
      const XLSX = await import('xlsx')
      const months = data.months.map((m) => m.label)
      const headers = ['No', 'Nama Sekolah', 'NPSN', 'Jenjang', 'Kecamatan', ...months, 'Rata-rata', 'Sudah Lapor', 'Belum Lapor']
      const rows = data.schoolData.map((s, i) => [
        i + 1, s.nama, s.npsn, s.jenjang, s.kecamatan,
        ...s.monthly.map((m) => m.persentase < 0 ? '-' : `${m.persentase}%`),
        `${s.avgPersentase}%`, s.sudahLapor, s.belumLapor,
      ])
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
      ws['!cols'] = [
        { wch: 5 }, { wch: 35 }, { wch: 12 }, { wch: 10 }, { wch: 16 },
        ...months.map(() => ({ wch: 10 })),
        { wch: 12 }, { wch: 12 }, { wch: 12 },
      ]
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi')
      XLSX.writeFile(wb, `Rekapitulasi_SIRUBIN_${filterTahun}${filterBulan ? `_${BULAN[parseInt(filterBulan)]}` : ''}.xlsx`)
    } catch (err) { console.error('Export error:', err) }
  }

  // Print
  const handlePrint = () => window.print()

  const clearFilters = () => { setFilterJenjang(''); setFilterKecamatan(''); setFilterBulan('') }
  const hasFilters = filterJenjang || filterKecamatan || filterBulan

  const sections = [
    { id: 'ringkasan', label: 'Ringkasan', icon: BarChart3 },
    { id: 'grafik', label: 'Grafik', icon: TrendingUp },
    { id: 'tabel', label: 'Tabel Rekap', icon: FileText },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'jenjang', label: 'Per Jenjang', icon: School },
    { id: 'peringatan', label: 'Peringatan', icon: AlertTriangle },
  ]

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 mt-4">Memuat rekapitulasi...</p>
      </div>
    )
  }

  const { summary, schoolData, perJenjang, monthlyTrend, ranking, insights, warnings } = data

  // Pie data for submitted vs not
  const pieData = [
    { name: 'Sudah Lapor', value: summary.sudahLapor, color: '#10b981' },
    { name: 'Belum Lapor', value: summary.belumLapor, color: '#f43f5e' },
  ]

  return (
    <div ref={printRef}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Rekapitulasi</h2>
            <p className="text-sm text-slate-500 mt-0.5">Pusat Kendali SIRUBIN &middot; Tahun {filterTahun}{filterBulan ? ` — ${BULAN[parseInt(filterBulan)]}` : ''}</p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200/60 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm">
              <Download size={15} /> <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200/60 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm">
              <Printer size={15} /> <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* === FILTER === */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 shadow-sm print:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                {BULAN.slice(1).map((b, i) => <option key={i} value={i + 1}>{b}</option>)}
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
                {data.kecamatanList.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 w-full px-3 py-2 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  <X size={12} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* === SECTION NAV (mobile) === */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 lg:hidden print:hidden">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${activeSection === s.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 border border-slate-200'}`}>
                <Icon size={13} /> {s.label}
              </button>
            )
          })}
        </div>

        {/* ============================== */}
        {/* 1. RINGKASAN UTAMA            */}
        {/* ============================== */}
        <div id="section-ringkasan" className="mb-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                  <School size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{summary.totalSekolah}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Total Sekolah</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{summary.sudahLapor}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Sudah Lapor</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/20">
                  <XCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{summary.belumLapor}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Belum Lapor</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/20">
                  <Target size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-violet-700">{summary.avgPersentase}<span className="text-sm font-medium text-slate-400">%</span></p>
                  <p className="text-[11px] text-slate-500 font-medium">Rata-rata</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {insights.map((ins, i) => {
                const IconComp = insightIcons[ins.icon] || AlertTriangle
                const colorCls = insightColors[ins.color] || insightColors.blue
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }} className={`flex items-start gap-3 p-4 rounded-xl border ${colorCls}`}>
                    <IconComp size={18} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{ins.text}</p>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Pie chart - small */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-base font-bold text-slate-800">Ketuntasan Pelaporan</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-600">Sudah Lapor: <strong className="text-emerald-700">{summary.sudahLapor}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-slate-600">Belum Lapor: <strong className="text-red-600">{summary.belumLapor}</strong></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all" style={{ width: `${summary.totalSekolah > 0 ? (summary.sudahLapor / summary.totalSekolah * 100) : 0}%` }} />
                  </div>
                  <p className="text-xs text-slate-400">{summary.totalSekolah > 0 ? Math.round(summary.sudahLapor / summary.totalSekolah * 100) : 0}% sekolah sudah melapor</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================== */}
        {/* 2. GRAFIK                    */}
        {/* ============================== */}
        <div id="section-grafik" className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Monthly Progress */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-800">Progres Bulanan</h3>
                <p className="text-sm text-slate-500">Tren rata-rata persentase pelaporan</p>
              </div>
              <div className="h-64 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rGradOverall" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="bulanNama" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="avgPersentase" name="Keseluruhan" stroke="#3b82f6" strokeWidth={2.5} fill="url(#rGradOverall)" dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Per Jenjang Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-800">Perbandingan per Jenjang</h3>
                <p className="text-sm text-slate-500">Rata-rata persentase pelaporan</p>
              </div>
              <div className="h-64 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perJenjang.map((j) => ({ name: j.jenjang, avg: j.avgPersentase, total: j.total, color: jenjangColors[j.jenjang] }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const d = payload[0].payload
                        return (<div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 px-4 py-3"><p className="text-sm font-semibold text-slate-700">{d.name}</p><p className="text-xs text-slate-500">{d.total} sekolah &middot; Rata-rata: <strong>{d.avg}%</strong></p></div>)
                      }
                      return null
                    }} />
                    <Bar dataKey="avg" name="Rata-rata" radius={[10, 10, 4, 4]}>
                      {perJenjang.map((j) => <Cell key={j.jenjang} fill={jenjangColors[j.jenjang]} fillOpacity={0.85} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Multi-line per jenjang */}
          {!filterJenjang && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mt-5">
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-800">Tren per Jenjang</h3>
                <p className="text-sm text-slate-500">Perbandingan progres tiap jenjang per bulan</p>
              </div>
              <div className="h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="bulanNama" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="tk" name="TK" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="paud" name="PAUD" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="sd" name="SD" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* ============================== */}
        {/* 3. TABEL REKAP PER SEKOLAH   */}
        {/* ============================== */}
        <div id="section-tabel" className="mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Tabel Rekapitulasi per Sekolah</h3>
                <p className="text-sm text-slate-500">Persentase kepatuhan administrasi per bulan</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200" /> ≥80%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200" /> 60-79%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200" /> &lt;60%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-100" /> Belum</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="sticky left-0 bg-slate-50 z-10 text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Sekolah</th>
                    <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jenjang</th>
                    {data.months.map((m) => (
                      <th key={m.value} className="text-center px-2 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider min-w-[56px]">{m.label.slice(0, 3)}</th>
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
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.jenjang === 'TK' ? 'bg-pink-50 text-pink-700 border-pink-200' : s.jenjang === 'PAUD' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{s.jenjang}</span>
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
                        <span className="text-xs text-slate-600 font-medium">{s.sudahLapor}/{s.totalBulan}</span>
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
                <button onClick={() => setTablePage(Math.max(0, tablePage - 1))} disabled={tablePage === 0} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg disabled:opacity-30"><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.ceil(schoolData.length / TABLE_PAGE_SIZE) }, (_, i) => (
                  <button key={i} onClick={() => setTablePage(i)} className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${tablePage === i ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{i + 1}</button>
                )).slice(Math.max(0, tablePage - 2), tablePage + 3)}
                <button onClick={() => setTablePage(Math.min(Math.ceil(schoolData.length / TABLE_PAGE_SIZE) - 1, tablePage + 1))} disabled={tablePage >= Math.ceil(schoolData.length / TABLE_PAGE_SIZE) - 1} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================== */}
        {/* 4. RANKING SEKOLAH           */}
        {/* ============================== */}
        <div id="section-ranking" className="mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2"><Trophy size={18} className="text-amber-500" /> Ranking Sekolah</h3>
              <p className="text-sm text-slate-500">Urut berdasarkan rata-rata persentase (terbaik ke terendah)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase w-16">#</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">Nama Sekolah</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">Jenjang</th>
                    <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">Persentase</th>
                    <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ranking.slice(0, 20).map((r) => {
                    const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : null
                    return (
                      <tr key={r.npsn} className="hover:bg-slate-50/60 transition-colors">
                        <td className="text-center px-4 py-3">
                          {medal ? <span className="text-lg">{medal}</span> : <span className="text-sm font-medium text-slate-500">{r.rank}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{r.nama}</p>
                          <p className="text-[11px] text-slate-400">{r.npsn} &middot; {r.kecamatan}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${r.jenjang === 'TK' ? 'bg-pink-50 text-pink-700 border-pink-200' : r.jenjang === 'PAUD' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{r.jenjang}</span>
                        </td>
                        <td className="text-center px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${r.avgPersentase >= 80 ? 'bg-emerald-400' : r.avgPersentase >= 60 ? 'bg-amber-400' : r.avgPersentase > 0 ? 'bg-red-400' : 'bg-slate-200'}`} style={{ width: `${Math.max(r.avgPersentase, 0)}%` }} />
                            </div>
                            <span className={`text-xs font-bold ${r.avgPersentase >= 80 ? 'text-emerald-600' : r.avgPersentase >= 60 ? 'text-amber-600' : r.avgPersentase > 0 ? 'text-red-600' : 'text-slate-400'}`}>{r.avgPersentase > 0 ? `${r.avgPersentase}%` : '-'}</span>
                          </div>
                        </td>
                        <td className="text-center px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${r.avgPersentase >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : r.avgPersentase >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' : r.avgPersentase > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {r.avgPersentase >= 80 ? 'Baik' : r.avgPersentase >= 60 ? 'Cukup' : r.avgPersentase > 0 ? 'Perlu Tindakan' : 'Belum Lapor'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ============================== */}
        {/* 5. REKAP PER JENJANG         */}
        {/* ============================== */}
        <div id="section-jenjang" className="mb-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><School size={18} className="text-blue-500" /> Rekap per Jenjang</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {perJenjang.map((j) => {
              const pct = j.total > 0 ? Math.round(j.sudahLapor / j.total * 100) : 0
              const color = jenjangColors[j.jenjang]
              return (
                <motion.div key={j.jenjang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                      <span className="text-sm font-bold" style={{ color }}>{j.jenjang}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{j.jenjang}</p>
                      <p className="text-[11px] text-slate-400">{j.total} sekolah</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Sudah Lapor</span><span className="font-semibold text-emerald-600">{j.sudahLapor}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Belum Lapor</span><span className="font-semibold text-red-600">{j.belumLapor}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Rata-rata</span><span className="font-bold" style={{ color }}>{j.avgPersentase}%</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <p className="text-[10px] text-slate-400">{pct}% kelengkapan pelaporan</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ============================== */}
        {/* 6. DAFTAR PERINGATAN         */}
        {/* ============================== */}
        <div id="section-peringatan" className="mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="text-base font-bold text-slate-800">Daftar Peringatan</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">{warnings.length}</span>
            </div>
            {warnings.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle size={32} className="text-emerald-300 mx-auto" />
                <p className="text-sm text-slate-400 mt-2">Semua sekolah dalam kondisi baik</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                {warnings.map((w, i) => {
                  const typeConfig: Record<string, { badge: string; icon: typeof AlertTriangle }> = {
                    belum: { badge: 'bg-red-50 text-red-700 border-red-200', icon: Clock },
                    rendah: { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: TrendingDown },
                    nihil: { badge: 'bg-slate-50 text-slate-600 border-slate-200', icon: XCircle },
                  }
                  const tc = typeConfig[w.type] || typeConfig.rendah
                  const WIcon = tc.icon
                  return (
                    <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/60 transition-colors">
                      <WIcon size={16} className="text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{w.school}</p>
                        <p className="text-xs text-slate-400">{w.jenjang} &middot; {w.npsn}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${tc.badge}`}>{w.message}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
