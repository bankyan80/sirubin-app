'use client'

import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

type Status = 'lengkap' | 'proses' | 'belum' | 'belum_upload'

interface SchoolData {
  name: string
  status: Status
  progress: number // 0-100
  monthlyProgress: boolean[] // 12 months Jan-Dec
}

interface JenjangData {
  title: string
  icon: string
  gradient: string
  schools: SchoolData[]
  totalProgress: number
}

const statusConfig: Record<Status, { label: string; color: string; bgColor: string; dotColor: string }> = {
  lengkap: { label: 'Lengkap', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', dotColor: 'bg-emerald-500' },
  proses: { label: 'Proses', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', dotColor: 'bg-amber-500' },
  belum: { label: 'Belum Lengkap', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', dotColor: 'bg-red-500' },
  belum_upload: { label: 'Belum Upload', color: 'text-slate-500', bgColor: 'bg-slate-50 border-slate-200', dotColor: 'bg-slate-400' },
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const jenjangData: JenjangData[] = [
  {
    title: 'TK (Taman Kanak-Kanak)',
    icon: '🧒',
    gradient: 'from-pink-500 to-rose-500',
    totalProgress: 72,
    schools: [
      { name: 'TK Al-Ikhlas', status: 'lengkap', progress: 100, monthlyProgress: [true,true,true,true,true,true,true,true,true,true,true,true] },
      { name: 'TK Pelangi Ceria', status: 'lengkap', progress: 100, monthlyProgress: [true,true,true,true,true,true,true,true,true,true,true,true] },
      { name: 'TK Cahaya Harapan', status: 'proses', progress: 75, monthlyProgress: [true,true,true,true,true,true,true,true,true,true,false,false] },
      { name: 'TK Melati Putih', status: 'proses', progress: 67, monthlyProgress: [true,true,true,true,true,true,true,true,true,false,false,false] },
      { name: 'TK Bintang Kecil', status: 'belum', progress: 42, monthlyProgress: [true,true,true,true,true,true,false,false,false,false,false,false] },
      { name: 'TK Matahari Terbit', status: 'belum_upload', progress: 17, monthlyProgress: [true,true,false,false,false,false,false,false,false,false,false,false] },
      { name: 'TK Tunas Bangsa', status: 'belum_upload', progress: 8, monthlyProgress: [true,false,false,false,false,false,false,false,false,false,false,false] },
    ],
  },
  {
    title: 'PAUD (Pendidikan Anak Usia Dini)',
    icon: '🎓',
    gradient: 'from-violet-500 to-purple-500',
    totalProgress: 61,
    schools: [
      { name: 'PAUD Kasih Ibu', status: 'lengkap', progress: 100, monthlyProgress: [true,true,true,true,true,true,true,true,true,true,true,true] },
      { name: 'PAUD Permata Hati', status: 'lengkap', progress: 100, monthlyProgress: [true,true,true,true,true,true,true,true,true,true,true,true] },
      { name: 'PAUD Kuncup Melati', status: 'proses', progress: 58, monthlyProgress: [true,true,true,true,true,true,true,false,false,false,false,false] },
      { name: 'PAUD Cempaka Putih', status: 'belum', progress: 42, monthlyProgress: [true,true,true,true,true,true,false,false,false,false,false,false] },
      { name: 'PAUD Harapan Bangsa', status: 'belum', progress: 33, monthlyProgress: [true,true,true,true,false,false,false,false,false,false,false,false] },
      { name: 'PAUD Pelangi Indah', status: 'belum_upload', progress: 0, monthlyProgress: [false,false,false,false,false,false,false,false,false,false,false,false] },
    ],
  },
  {
    title: 'SD (Sekolah Dasar)',
    icon: '📚',
    gradient: 'from-blue-500 to-cyan-500',
    totalProgress: 65,
    schools: [
      { name: 'SDN 1 Sukamaju', status: 'lengkap', progress: 100, monthlyProgress: [true,true,true,true,true,true,true,true,true,true,true,true] },
      { name: 'SDN 2 Harapan Jaya', status: 'lengkap', progress: 100, monthlyProgress: [true,true,true,true,true,true,true,true,true,true,true,true] },
      { name: 'SDN 3 Mekar Sari', status: 'lengkap', progress: 100, monthlyProgress: [true,true,true,true,true,true,true,true,true,true,true,true] },
      { name: 'SDN 4 Cendekia', status: 'proses', progress: 83, monthlyProgress: [true,true,true,true,true,true,true,true,true,true,false,false] },
      { name: 'SDN 5 Bina Ilmu', status: 'proses', progress: 75, monthlyProgress: [true,true,true,true,true,true,true,true,true,false,false,false] },
      { name: 'SDN 6 Tunas Harapan', status: 'belum', progress: 50, monthlyProgress: [true,true,true,true,true,true,false,false,false,false,false,false] },
      { name: 'SDN 7 Pelita Bangsa', status: 'belum', progress: 33, monthlyProgress: [true,true,true,true,false,false,false,false,false,false,false,false] },
      { name: 'SDN 8 Sumber Ilmu', status: 'belum_upload', progress: 17, monthlyProgress: [true,true,false,false,false,false,false,false,false,false,false,false] },
      { name: 'SDN 9 Karya Ilmu', status: 'belum_upload', progress: 0, monthlyProgress: [false,false,false,false,false,false,false,false,false,false,false,false] },
    ],
  },
]

function ProgressBar({ value }: { value: number }) {
  const getBarColor = (v: number) => {
    if (v >= 80) return 'from-emerald-400 to-emerald-500'
    if (v >= 50) return 'from-amber-400 to-amber-500'
    if (v >= 25) return 'from-orange-400 to-orange-500'
    return 'from-red-400 to-red-500'
  }

  return (
    <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getBarColor(value)} rounded-full`}
      />
    </div>
  )
}

function SchoolRow({ school, index }: { school: SchoolData; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[school.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div
        className="group cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-slate-50/80 transition-colors duration-200">
          {/* School name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{school.name}</p>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:block w-40 lg:w-56">
            <ProgressBar value={school.progress} />
          </div>

          {/* Percentage */}
          <div className="w-14 text-right">
            <span className={`text-sm font-bold ${
              school.progress >= 80 ? 'text-emerald-600' :
              school.progress >= 50 ? 'text-amber-600' :
              school.progress >= 25 ? 'text-orange-600' :
              'text-red-500'
            }`}>
              {school.progress}%
            </span>
          </div>

          {/* Status badge */}
          <div className={`
            hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${status.bgColor} ${status.color}
          `}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
            {status.label}
          </div>

          {/* Expand toggle */}
          <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Expanded: Monthly progress grid */}
        <motion.div
          initial={false}
          animate={{
            height: expanded ? 'auto' : 0,
            opacity: expanded ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-3 ml-0 sm:ml-0">
            <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100">
              <p className="text-[11px] font-medium text-slate-500 mb-2 uppercase tracking-wider">Progres Bulanan</p>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {months.map((month, i) => (
                  <div
                    key={month}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                      school.monthlyProgress[i]
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-white text-slate-400 border border-slate-100'
                    }`}
                  >
                    <span>{month}</span>
                    <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${
                      school.monthlyProgress[i] ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {school.monthlyProgress[i] ? '✓' : '—'}
                    </span>
                  </div>
                ))}
              </div>
              {/* Mobile progress bar */}
              <div className="sm:hidden mt-2.5">
                <ProgressBar value={school.progress} />
              </div>
              {/* Mobile status */}
              <div className="md:hidden mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${status.bgColor} ${status.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function ProgressSection() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Progres Berdasarkan Jenjang</h2>
          <p className="text-sm text-slate-500 mt-0.5">Detail laporan bulanan per sekolah</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {jenjangData.map((jenjang, jIndex) => (
          <motion.div
            key={jenjang.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + jIndex * 0.15 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Card header */}
            <div className={`px-5 py-4 bg-gradient-to-r ${jenjang.gradient} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{jenjang.icon}</span>
                    <h3 className="text-sm font-bold text-white">{jenjang.title}</h3>
                  </div>
                  <p className="text-[11px] text-white/70 mt-0.5">{jenjang.schools.length} sekolah terdaftar</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{jenjang.totalProgress}%</span>
                  <p className="text-[10px] text-white/60">Rata-rata</p>
                </div>
              </div>
              {/* Decorative shapes */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
            </div>

            {/* Card body */}
            <div className="p-4 max-h-[420px] overflow-y-auto">
              {jenjang.schools.map((school, sIndex) => (
                <SchoolRow key={school.name} school={school} index={sIndex} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
