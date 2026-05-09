'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Download, Upload, Edit3, Trash2, Eye, X,
  School, ChevronLeft, ChevronRight, Filter, Loader2, AlertTriangle,
  CheckCircle2, Info,
} from 'lucide-react'
import SchoolForm from './school-form'
import SchoolDetail from './school-detail'
import { apiFetch } from '@/lib/api-fetch'

interface School {
  id: string
  npsn: string
  nama: string
  jenjang: string
  alamat: string
  kecamatan: string
  desa: string
  kepalaSekolah: string
  status: string
  noHp: string | null
  email: string | null
  tahunBerdiri: string | null
  akreditasi: string | null
  logoUrl: string | null
}

export default function DataSekolahPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [kecamatanList, setKecamatanList] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<School | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterJenjang, setFilterJenjang] = useState('')
  const [filterKecamatan, setFilterKecamatan] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; fileName: string } | null>(null)

  const fetchSchools = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterJenjang) params.set('jenjang', filterJenjang)
      if (filterKecamatan) params.set('kecamatan', filterKecamatan)
      if (filterStatus) params.set('status', filterStatus)
      params.set('limit', '100')

      const res = await apiFetch(`/api/sekolah?${params}`)
      const data = await res.json()
      if (data.success) {
        setSchools(data.data)
        setTotal(data.total)
        setKecamatanList(data.kecamatanList || [])
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [search, filterJenjang, filterKecamatan, filterStatus])

  useEffect(() => { fetchSchools() }, [fetchSchools])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await apiFetch(`/api/sekolah/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { fetchSchools(); setDeleteId(null) }
    } catch { /* ignore */ }
  }

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx')
      const headers = ['No', 'NPSN', 'Nama Sekolah', 'Jenjang', 'Alamat', 'Kecamatan', 'Desa', 'Kepala Sekolah', 'Status', 'No HP', 'Email', 'Tahun Berdiri', 'Akreditasi']
      const rows = schools.map((s, i) => [
        i + 1, s.npsn, s.nama, s.jenjang, s.alamat, s.kecamatan, s.desa, s.kepalaSekolah, s.status, s.noHp || '-', s.email || '-', s.tahunBerdiri || '-', s.akreditasi || '-',
      ])
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
      ws['!cols'] = [
        { wch: 5 }, { wch: 12 }, { wch: 35 }, { wch: 10 }, { wch: 30 },
        { wch: 18 }, { wch: 18 }, { wch: 25 }, { wch: 12 },
        { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 12 },
      ]
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data Sekolah')
      XLSX.writeFile(wb, `Data_Sekolah_SIRUBIN_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (err) { console.error('Export error:', err) }
  }

  const handleImportExcel = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls,.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const XLSX = await import('xlsx')
        const data = await file.arrayBuffer()
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
        if (rows.length === 0) return
        let imported = 0
        let skipped = 0
        for (const row of rows) {
          const npsn = String(row['NPSN'] || row['npsn'] || '').trim()
          const nama = String(row['Nama Sekolah'] || row['Nama'] || row['nama'] || '').trim()
          if (!npsn || !nama) { skipped++; continue }
          const payload = {
            npsn,
            nama,
            jenjang: String(row['Jenjang'] || row['jenjang'] || 'TK').trim(),
            alamat: String(row['Alamat'] || row['alamat'] || '').trim(),
            kecamatan: String(row['Kecamatan'] || row['kecamatan'] || '').trim(),
            desa: String(row['Desa'] || row['desa'] || '').trim(),
            kepalaSekolah: String(row['Kepala Sekolah'] || row['Kepala Sekolah'] || row['kepalaSekolah'] || '').trim(),
            status: String(row['Status'] || row['status'] || 'Aktif').trim(),
            noHp: String(row['No HP'] || row['No HP'] || row['noHp'] || '').trim(),
            email: String(row['Email'] || row['email'] || '').trim(),
            tahunBerdiri: String(row['Tahun Berdiri'] || row['Tahun Berdiri'] || row['tahunBerdiri'] || '').trim(),
            akreditasi: String(row['Akreditasi'] || row['akreditasi'] || '').trim(),
          }
          const res = await apiFetch('/api/sekolah', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          if (res.ok) imported++
          else skipped++
        }
        fetchSchools()
        setImportResult({ imported, skipped, fileName: file.name })
        setTimeout(() => setImportResult(null), 5000)
      } catch (err) { console.error('Import error:', err) }
    }
    input.click()
  }

  const jenjangBadge: Record<string, string> = {
    TK: 'bg-pink-50 text-pink-700 border-pink-200',
    PAUD: 'bg-violet-50 text-violet-700 border-violet-200',
    SD: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  const statusBadge: Record<string, string> = {
    Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Nonaktif: 'bg-red-50 text-red-700 border-red-200',
  }

  const clearFilters = () => {
    setFilterJenjang('')
    setFilterKecamatan('')
    setFilterStatus('')
    setSearch('')
  }
  const hasFilters = filterJenjang || filterKecamatan || filterStatus || search

  // Detail View
  if (selectedSchool) {
    return (
      <SchoolDetail
        school={selectedSchool}
        onBack={() => setSelectedSchool(null)}
        onEdit={() => { setEditData(selectedSchool); setShowForm(true) }}
      />
    )
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Data Sekolah</h2>
            <p className="text-sm text-slate-500 mt-0.5">{total} sekolah terdaftar</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleImportExcel} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200/60 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm">
              <Upload size={15} />
              <span className="hidden sm:inline">Import Excel</span>
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200/60 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm">
              <Download size={15} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button onClick={() => { setEditData(null); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
              <Plus size={16} />
              <span className="hidden sm:inline">Tambah Sekolah</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama sekolah, NPSN, kepala sekolah..."
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
                  {[filterJenjang, filterKecamatan, filterStatus].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
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
                      <option value="">Semua Kecamatan</option>
                      {kecamatanList.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Semua Status</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
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
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">No</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nama Sekolah</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">NPSN</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jenjang</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kecamatan</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kepala Sekolah</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12"><Loader2 size={24} className="animate-spin text-slate-400 mx-auto" /><p className="text-sm text-slate-400 mt-2">Memuat data...</p></td></tr>
                ) : schools.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12"><School size={32} className="text-slate-300 mx-auto" /><p className="text-sm text-slate-400 mt-2">Tidak ada data ditemukan</p></td></tr>
                ) : schools.map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-4 py-3 text-sm text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setSelectedSchool(s)}>{s.nama}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.desa}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{s.npsn}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${jenjangBadge[s.jenjang] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>{s.jenjang}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.kecamatan}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.kepalaSekolah}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge[s.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Aktif' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedSchool(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Lihat Detail"><Eye size={15} /></button>
                        <button onClick={() => { setEditData(s); setShowForm(true) }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit"><Edit3 size={15} /></button>
                        <button onClick={() => setDeleteId(s.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Hapus"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="text-center py-12"><Loader2 size={24} className="animate-spin text-slate-400 mx-auto" /><p className="text-sm text-slate-400 mt-2">Memuat data...</p></div>
            ) : schools.length === 0 ? (
              <div className="text-center py-12"><School size={32} className="text-slate-300 mx-auto" /><p className="text-sm text-slate-400 mt-2">Tidak ada data</p></div>
            ) : schools.map((s) => (
              <div key={s.id} className="p-4 hover:bg-slate-50/60 transition-colors" onClick={() => setSelectedSchool(s)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{s.nama}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.npsn} &middot; {s.kecamatan}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${jenjangBadge[s.jenjang] || ''}`}>{s.jenjang}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge[s.status] || ''}`}>{s.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Kepsek: {s.kepalaSekolah}</p>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditData(s); setShowForm(true) }} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg"><Edit3 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(s.id) }} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination info */}
          {!loading && schools.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">Menampilkan {schools.length} dari {total} sekolah</p>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><ChevronLeft size={14} /></button>
                <span className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg">1</span>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* School Form Modal */}
      <SchoolForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null) }}
        onSaved={fetchSchools}
        editData={editData}
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
              <h3 className="text-lg font-bold text-slate-800">Hapus Sekolah?</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6">Data sekolah yang dihapus tidak dapat dikembalikan.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md shadow-red-500/20 transition-colors">Ya, Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Result Toast */}
      <AnimatePresence>
        {importResult && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[130] w-[90vw] max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">Import Selesai</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{importResult.fileName}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs font-semibold text-emerald-600">{importResult.imported} berhasil</span>
                  {importResult.skipped > 0 && (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      <Info size={11} /> {importResult.skipped} dilewati (duplikat/data tidak lengkap)
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setImportResult(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
