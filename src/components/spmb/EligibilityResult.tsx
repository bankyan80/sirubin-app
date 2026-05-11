'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, School, Baby } from 'lucide-react'

interface EligibilityResultProps {
  status: 'Diterima' | 'Batas' | 'Ditolak'
  usia: string
  rekomendasi: string
  tanggalLahir?: string
}

const config = {
  Diterima: {
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
    badge: 'bg-emerald-500',
    label: 'Diterima SD',
    labelColor: 'text-emerald-700',
    rekomendasiIcon: School,
    rekomendasiLabel: 'Rekomendasi: SD',
    rekomendasiBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  Batas: {
    bg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
    badge: 'bg-amber-500',
    label: 'Batas Minimum',
    labelColor: 'text-amber-700',
    rekomendasiIcon: School,
    rekomendasiLabel: 'Rekomendasi: SD (perlu konfirmasi)',
    rekomendasiBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  Ditolak: {
    bg: 'from-red-50 to-rose-50',
    border: 'border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    badge: 'bg-red-500',
    label: 'Belum Memenuhi Syarat',
    labelColor: 'text-red-700',
    rekomendasiIcon: Baby,
    rekomendasiLabel: 'Rekomendasi: PAUD/TK/RA',
    rekomendasiBg: 'bg-red-50 text-red-700 border-red-200',
  },
}

export default function EligibilityResult({ status, usia, rekomendasi, tanggalLahir }: EligibilityResultProps) {
  const c = config[status]
  const Icon = c.icon
  const RekIcon = c.rekomendasiIcon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-5 space-y-4`}
    >
      {/* Status Header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={24} className={c.iconColor} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Status Kelayakan</p>
          <p className={`text-xl font-bold ${c.labelColor}`}>{c.label}</p>
        </div>
        <div className="ml-auto">
          <span className={`inline-flex px-3 py-1 text-xs font-bold text-white rounded-full ${c.badge}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Usia per 1 Juli 2026</span>
          <span className="font-semibold text-slate-700">{usia}</span>
        </div>
        <div className="h-2 bg-white/60 rounded-full overflow-hidden border border-white/80">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: status === 'Diterima' ? '100%' : status === 'Batas' ? '50%' : '25%' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`h-full rounded-full ${c.badge}`}
          />
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tanggalLahir && (
          <div className="bg-white/60 rounded-xl p-3 border border-white/80">
            <p className="text-xs text-slate-500">Tanggal Lahir</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">
              {new Date(tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
        <div className="bg-white/60 rounded-xl p-3 border border-white/80">
          <p className="text-xs text-slate-500">Referensi Tanggal</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">1 Juli 2026</p>
        </div>
      </div>

      {/* Rekomendasi */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${c.rekomendasiBg}`}>
        <RekIcon size={16} className="flex-shrink-0" />
        <div>
          <p className="text-xs font-bold">{c.rekomendasiLabel}</p>
          <p className="text-xs opacity-80 mt-0.5">{rekomendasi}</p>
        </div>
      </div>
    </motion.div>
  )
}
