'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Loader2, Save, CheckCircle, AlertTriangle,
  School, MapPin, Phone, Mail, Calendar, Award, User,
} from 'lucide-react'
import SchoolForm from './school-form'
import { useAuthStore } from '@/lib/auth-store'
import { apiFetch } from '@/lib/api-fetch'

interface SchoolData {
  id: string
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
  logoUrl?: string
}

export default function DataSekolahSayaPage() {
  const { user } = useAuthStore()
  const [school, setSchool] = useState<SchoolData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const fetchSchoolData = useCallback(async () => {
    if (!user?.npsn) return
    setLoading(true)
    try {
      const res = await apiFetch(`/api/sekolah?search=${user.npsn}&limit=1`)
      const data = await res.json()
      if (data.success && data.data.length > 0) {
        setSchool(data.data[0])
      } else {
        // Try fetching from /api/sekolah/saya
        const res2 = await apiFetch('/api/sekolah/saya')
        const data2 = await res2.json()
        if (data2.success && data2.data) {
          setSchool(data2.data)
        }
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [user?.npsn])

  useEffect(() => { fetchSchoolData() }, [fetchSchoolData])

  const jenjangColors: Record<string, string> = {
    TK: 'from-pink-500 to-rose-500',
    PAUD: 'from-violet-500 to-purple-500',
    SD: 'from-blue-500 to-cyan-500',
  }
  const gradient = jenjangColors[school?.jenjang || ''] || 'from-blue-500 to-cyan-500'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 mt-3">Memuat data sekolah...</p>
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-600">Data Sekolah Belum Tersedia</h2>
          <p className="text-sm text-slate-400 mt-1">Hubungi admin untuk mengisi data sekolah Anda</p>
        </div>
      </motion.div>
    )
  }

  const infoItems = [
    { icon: School, label: 'Jenjang', value: school.jenjang, color: 'violet' },
    { icon: MapPin, label: 'Alamat', value: `${school.alamat}, ${school.desa}, ${school.kecamatan}`, color: 'blue' },
    { icon: User, label: 'Kepala Sekolah', value: school.kepalaSekolah, color: 'emerald' },
    { icon: Phone, label: 'No. HP', value: school.noHp || '-', color: 'amber' },
    { icon: Mail, label: 'Email', value: school.email || '-', color: 'indigo' },
    { icon: Calendar, label: 'Tahun Berdiri', value: school.tahunBerdiri || '-', color: 'cyan' },
    { icon: Award, label: 'Akreditasi', value: school.akreditasi || '-', color: 'pink' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    pink: 'bg-pink-50 text-pink-600',
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Data Sekolah Saya</h2>
            <p className="text-sm text-slate-500 mt-0.5">Informasi profil sekolah Anda</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
          >
            <Save size={15} />
            Edit Data Sekolah
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
          <div className={`relative bg-gradient-to-r ${gradient} px-6 py-8`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <School size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-white">{school.nama}</h1>
                  <p className="text-sm text-white/70">
                    NPSN: {school.npsn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <School size={16} className="text-blue-500" />
            Informasi Sekolah
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {infoItems.map((item, idx) => {
              const Icon = item.icon
              const bgColor = colorMap[item.color] || 'bg-slate-50 text-slate-600'
              return (
                <div key={idx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
                      <Icon size={15} />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{item.label}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-800 ml-11">{item.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Edit Form Modal */}
      <SchoolForm
        isOpen={showForm}
        onClose={() => { setShowForm(false) }}
        onSaved={() => { fetchSchoolData(); setShowForm(false) }}
        editData={school}
      />
    </>
  )
}