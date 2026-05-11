'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft, School, MapPin, User, Phone, Mail, Calendar, Award,
  Building2, ChevronRight,
} from 'lucide-react'

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

interface SchoolDetailProps {
  school: School
  onBack: () => void
  onEdit: () => void
}

const jenjangColors: Record<string, string> = {
  TK: 'from-pink-500 to-rose-500',
  PAUD: 'from-violet-500 to-purple-500',
  SD: 'from-blue-500 to-cyan-500',
}

const jenjangEmoji: Record<string, string> = {
  TK: '🧒', PAUD: '🎓', SD: '📚',
}

const akreditasiColors: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  B: 'bg-blue-100 text-blue-700 border-blue-200',
  C: 'bg-amber-100 text-amber-700 border-amber-200',
}

export default function SchoolDetail({ school, onBack, onEdit }: SchoolDetailProps) {
  const gradient = jenjangColors[school.jenjang] || 'from-blue-500 to-cyan-500'
  const emoji = jenjangEmoji[school.jenjang] || '🏫'
  const isActive = school.status === 'Aktif'

  const initials = school.nama
    .replace(/^(TK|PAUD|SDN?|SD)\s*/i, '')
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Kembali ke Daftar Sekolah</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
        <div className={`relative bg-gradient-to-r ${gradient} px-6 py-8`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

          <div className="relative z-10 flex items-center gap-5">
            {/* Logo / Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">{emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white truncate">{school.nama}</h1>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${isActive ? 'bg-emerald-400/20 text-white border-emerald-300/30' : 'bg-red-400/20 text-white border-red-300/30'}`}>
                  {school.status}
                </span>
              </div>
              <p className="text-sm text-white/70">
                NPSN: {school.npsn} &middot; {school.jenjang}
              </p>
              <p className="text-sm text-white/60 mt-0.5 flex items-center gap-1">
                <MapPin size={13} />
                {school.alamat}, {school.desa}, Kec. {school.kecamatan}
              </p>
            </div>
            <button
              onClick={onEdit}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Edit Data
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Kepala Sekolah */}
            <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kepala Sekolah</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{school.kepalaSekolah}</p>
              </div>
            </div>

            {/* Kontak */}
            <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">No. HP</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{school.noHp || '-'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-violet-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5 break-all">{school.email || '-'}</p>
              </div>
            </div>

            {/* Tahun Berdiri */}
            <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tahun Berdiri</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{school.tahunBerdiri || '-'}</p>
              </div>
            </div>

            {/* Akreditasi */}
            <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Award size={18} className="text-cyan-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Akreditasi</p>
                <div className="mt-1">
                  {school.akreditasi ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${akreditasiColors[school.akreditasi] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {school.akreditasi}
                    </span>
                  ) : (
                    <p className="text-sm text-slate-400">Belum terakreditasi</p>
                  )}
                </div>
              </div>
            </div>

            {/* Wilayah */}
            <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-rose-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Wilayah</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  Desa {school.desa}
                </p>
                <p className="text-xs text-slate-500">Kec. {school.kecamatan}</p>
              </div>
            </div>
          </div>

          {/* Mobile Edit button */}
          <div className="sm:hidden mt-5">
            <button
              onClick={onEdit}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md shadow-blue-500/20"
            >
              Edit Data Sekolah
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
