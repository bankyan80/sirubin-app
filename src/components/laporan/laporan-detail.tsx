'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft, School, Users, GraduationCap, Droplets, Building, FileText,
  CheckCircle, Circle, Camera, AlertTriangle, Edit3, Send, Clock,
  Phone, Mail, MapPin, Calendar, Award, ClipboardCheck, MessageSquare,
} from 'lucide-react'

interface LaporanDetail {
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

interface LaporanDetailProps {
  laporan: LaporanDetail
  onBack: () => void
  onEdit: () => void
}

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const checklistItems = [
  { label: 'Data sekolah terupdate', icon: School },
  { label: 'Data guru terupdate', icon: Users },
  { label: 'Data siswa terupdate', icon: GraduationCap },
  { label: 'Jadwal tersedia', icon: ClipboardCheck },
  { label: 'Absensi tersedia', icon: FileText },
  { label: 'Arsip administrasi tertata', icon: Building },
]

const jenjangColors: Record<string, string> = {
  TK: 'from-pink-500 to-rose-500',
  PAUD: 'from-violet-500 to-purple-500',
  SD: 'from-blue-500 to-cyan-500',
}

const statusBadge: Record<string, string> = {
  Draft: 'bg-amber-50 text-amber-700 border-amber-200',
  Submitted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function LaporanDetailView({ laporan, onBack, onEdit }: LaporanDetailProps) {
  const gradient = jenjangColors[laporan.jenjang] || 'from-blue-500 to-cyan-500'
  const isSubmitted = laporan.status === 'Submitted'
  const checklistValues = [laporan.dataSekolahUpdate, laporan.dataGuruUpdate, laporan.dataSiswaUpdate, laporan.jadwalTersedia, laporan.absensiTersedia, laporan.arsipTertata]
  const checklistCount = checklistValues.filter(Boolean).length

  const persentaseColor = laporan.persentase >= 80 ? 'from-emerald-400 to-emerald-500' : laporan.persentase >= 50 ? 'from-amber-400 to-amber-500' : 'from-red-400 to-red-500'
  const persentaseTextColor = laporan.persentase >= 80 ? 'text-emerald-700' : laporan.persentase >= 50 ? 'text-amber-700' : 'text-red-700'
  const persentaseBg = laporan.persentase >= 80 ? 'bg-emerald-50' : laporan.persentase >= 50 ? 'bg-amber-50' : 'bg-red-50'
  const persentaseLabel = laporan.persentase >= 80 ? 'Baik' : laporan.persentase >= 50 ? 'Perlu Perhatian' : 'Perlu Tindakan'

  const kondisiColor: Record<string, string> = {
    'Baik': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Rusak Ringan': 'bg-amber-50 text-amber-700 border-amber-200',
    'Rusak Berat': 'bg-red-50 text-red-700 border-red-200',
  }

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
        <span>Kembali ke Daftar Laporan</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
        <div className={`relative bg-gradient-to-r ${gradient} px-6 py-8`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl lg:text-2xl font-bold text-white">{laporan.namaSekolah}</h1>
              <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadge[laporan.status] || ''}`}>
                {laporan.status === 'Submitted' && <Send size={10} className="inline mr-1" />}
                {laporan.status}
              </span>
            </div>
            <p className="text-sm text-white/70">
              {laporan.jenjang} &middot; NPSN: {laporan.npsn} &middot; {laporan.bulanNama} {laporan.tahun}
            </p>
            {laporan.submittedAt && (
              <p className="text-xs text-white/50 mt-1">
                Diajukan: {new Date(laporan.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        {/* Percentage Display */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className={`relative w-28 h-28 rounded-2xl ${persentaseBg} flex items-center justify-center border border-slate-100`}>
              <div className="text-center">
                <p className={`text-3xl font-bold ${persentaseTextColor}`}>{laporan.persentase}%</p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{persentaseLabel}</p>
              </div>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${laporan.persentase * 2.76} 276`} className={laporan.persentase >= 80 ? 'text-emerald-400' : laporan.persentase >= 50 ? 'text-amber-400' : 'text-red-400'} strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 w-full">
              <p className="text-sm font-semibold text-slate-700 mb-3">Checklist Administrasi ({checklistCount}/6)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {checklistItems.map((item, idx) => {
                  const checked = checklistValues[idx]
                  const Icon = item.icon
                  return (
                    <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${checked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                      {checked ? <CheckCircle size={13} /> : <Circle size={13} />}
                      <Icon size={12} />
                      <span className="truncate">{item.label.replace('terupdate', '').replace('tersedia', '').replace('tertata', '').trim()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sarana & Prasarana */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building size={16} className="text-blue-500" />
            Sarana &amp; Prasarana
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">Kondisi Ruang Kelas</span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${kondisiColor[laporan.kondisiRuangKelas] || 'bg-slate-100 text-slate-500'}`}>{laporan.kondisiRuangKelas}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600 flex items-center gap-2"><Droplets size={14} /> Air Bersih</span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${laporan.airBersih ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{laporan.airBersih ? 'Tersedia' : 'Tidak'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600 flex items-center gap-2"><Building size={14} /> Toilet Layak</span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${laporan.toiletLayak ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{laporan.toiletLayak ? 'Layak' : 'Tidak Layak'}</span>
            </div>
            {laporan.kebutuhanMendesak && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle size={11} /> Kebutuhan Mendesak</p>
                <p className="text-sm text-amber-800">{laporan.kebutuhanMendesak}</p>
              </div>
            )}
          </div>
        </div>

        {/* Data Bulanan */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={16} className="text-violet-500" />
            Data Singkat Bulanan
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-center border border-blue-100">
              <Users size={20} className="text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-blue-700">{laporan.jumlahGuru}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Guru</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl text-center border border-violet-100">
              <GraduationCap size={20} className="text-violet-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-violet-700">{laporan.jumlahSiswa}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Siswa</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl text-center border border-emerald-100">
              <School size={20} className="text-emerald-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-emerald-700">{laporan.jumlahRombel}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Rombel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Catatan */}
      {(laporan.kendala || laporan.keterangan) && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={16} className="text-amber-500" />
            Catatan
          </h3>
          <div className="space-y-4">
            {laporan.kendala && (
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle size={11} /> Kendala</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{laporan.kendala}</p>
              </div>
            )}
            {laporan.keterangan && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Keterangan</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{laporan.keterangan}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Admin */}
      {laporan.adminFeedback && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-500" />
            Feedback Admin
          </h3>
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{laporan.adminFeedback}</p>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {isSubmitted && !laporan.adminFeedback && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Menunggu Feedback</p>
              <p className="text-xs text-slate-500 mt-0.5">Laporan ini sudah dikirim. Feedback dari admin akan muncul di sini.</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit button */}
      <div className="flex justify-end">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
        >
          <Edit3 size={15} />
          Edit Laporan
        </button>
      </div>
    </motion.div>
  )
}
