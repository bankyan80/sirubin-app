'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Save } from 'lucide-react'
import { apiFetch } from '@/lib/api-fetch'

interface School {
  id?: string
  npsn: string
  nama: string
  jenjang: string
  alamat: string
  kecamatan: string
  desa: string
  kepalaSekolah: string
  status: string
  noHp: string
  email: string
  tahunBerdiri: string
  akreditasi: string
}

interface SchoolFormProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  editData?: School | null
}

const emptyForm: School = {
  npsn: '', nama: '', jenjang: 'TK', alamat: '', kecamatan: '', desa: '',
  kepalaSekolah: '', status: 'Aktif', noHp: '', email: '', tahunBerdiri: '', akreditasi: '',
}

export default function SchoolForm({ isOpen, onClose, onSaved, editData }: SchoolFormProps) {
  const [form, setForm] = useState<School>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEdit = !!editData?.id

  useEffect(() => {
    if (editData) setForm({ ...editData })
    else setForm({ ...emptyForm })
    setError('')
  }, [editData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.npsn || !form.nama || !form.alamat || !form.kecamatan || !form.desa || !form.kepalaSekolah) {
      setError('Field wajib bertanda * harus diisi')
      return
    }
    setLoading(true)
    try {
      const url = isEdit ? `/api/sekolah/${editData.id}` : '/api/sekolah'
      const res = await apiFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); setLoading(false); return }
      onSaved()
      onClose()
    } catch { setError('Terjadi kesalahan koneksi'); setLoading(false) }
  }

  const inputCls = 'w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all duration-200'
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1'
  const required = <span className="text-red-400">*</span>

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-start justify-center pt-10 px-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden mb-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 px-6 py-5">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/5 rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Data Sekolah' : 'Tambah Sekolah Baru'}</h2>
                <button onClick={onClose} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
              )}

              {/* Row 1: NPSN, Nama, Jenjang */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>NPSN {required}</label>
                  <input type="text" value={form.npsn} onChange={(e) => setForm({ ...form, npsn: e.target.value })} placeholder="NPSN" disabled={isEdit} className={`${inputCls} ${isEdit ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Nama Sekolah {required}</label>
                  <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama Sekolah" className={inputCls} />
                </div>
              </div>

              {/* Row 2: Jenjang, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Jenjang</label>
                  <select value={form.jenjang} onChange={(e) => setForm({ ...form, jenjang: e.target.value })} className={inputCls}>
                    <option value="TK">TK</option>
                    <option value="PAUD">PAUD</option>
                    <option value="SD">SD</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Alamat */}
              <div>
                <label className={labelCls}>Alamat {required}</label>
                <input type="text" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Jl. ..." className={inputCls} />
              </div>

              {/* Row 4: Kecamatan, Desa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Kecamatan {required}</label>
                  <input type="text" value={form.kecamatan} onChange={(e) => setForm({ ...form, kecamatan: e.target.value })} placeholder="Kecamatan" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Desa / Kelurahan {required}</label>
                  <input type="text" value={form.desa} onChange={(e) => setForm({ ...form, desa: e.target.value })} placeholder="Desa" className={inputCls} />
                </div>
              </div>

              {/* Row 5: Kepala Sekolah */}
              <div>
                <label className={labelCls}>Nama Kepala Sekolah {required}</label>
                <input type="text" value={form.kepalaSekolah} onChange={(e) => setForm({ ...form, kepalaSekolah: e.target.value })} placeholder="Nama Kepala Sekolah" className={inputCls} />
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Informasi Tambahan</p>

              {/* Row 6: No HP, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>No. HP</label>
                  <input type="text" value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })} placeholder="08xxxxxxxxxx" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@sekolah.id" className={inputCls} />
                </div>
              </div>

              {/* Row 7: Tahun Berdiri, Akreditasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tahun Berdiri</label>
                  <input type="text" value={form.tahunBerdiri} onChange={(e) => setForm({ ...form, tahunBerdiri: e.target.value })} placeholder="2005" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Akreditasi</label>
                  <select value={form.akreditasi} onChange={(e) => setForm({ ...form, akreditasi: e.target.value })} className={inputCls}>
                    <option value="">-- Pilih --</option>
                    <option value="A">A (Unggul)</option>
                    <option value="B">B (Baik)</option>
                    <option value="C">C (Cukup)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-60">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> {isEdit ? 'Simpan Perubahan' : 'Tambah Sekolah'}</>}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
