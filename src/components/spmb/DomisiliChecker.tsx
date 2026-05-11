'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, CheckCircle2, XCircle, School } from 'lucide-react'
import ZoneStatusBadge, { ZoneSchoolBadge } from './ZoneStatusBadge'

// Zone mapping: kecamatan → sekolah terdekat
const ZONE_MAP: Record<string, { schools: string[]; inZone: boolean }> = {
  'lemahabang': { inZone: true, schools: ['SDN Lemahabang 1', 'SDN Lemahabang 2', 'MI Lemahabang'] },
  'susukanlebak': { inZone: true, schools: ['SDN Susukanlebak 1', 'SDN Susukanlebak 2'] },
  'astanajapura': { inZone: true, schools: ['SDN Astanajapura 1', 'SDN Astanajapura 2', 'MI Astanajapura'] },
  'karangsembung': { inZone: true, schools: ['SDN Karangsembung 1', 'SDN Karangsembung 2'] },
  'mundu': { inZone: true, schools: ['SDN Mundu 1', 'SDN Mundu 2', 'MI Mundu'] },
}

const KECAMATAN_OPTIONS = [
  'Lemahabang',
  'Susukanlebak',
  'Astanajapura',
  'Karangsembung',
  'Mundu',
  'Lainnya',
]

interface DomisiliResult {
  inZone: boolean
  kecamatan: string
  schools: string[]
}

interface DomisiliCheckerProps {
  kecamatan: string
  desa: string
  onResult?: (result: DomisiliResult) => void
}

export function checkDomisili(kecamatan: string): DomisiliResult {
  const key = kecamatan.toLowerCase().replace(/\s+/g, '')
  const zone = ZONE_MAP[key]
  if (zone) {
    return { inZone: true, kecamatan, schools: zone.schools }
  }
  return { inZone: false, kecamatan, schools: [] }
}

export { KECAMATAN_OPTIONS }

export default function DomisiliChecker({ kecamatan, desa }: DomisiliCheckerProps) {
  if (!kecamatan) return null

  const result = checkDomisili(kecamatan)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="space-y-3"
      >
        {/* Zone Status */}
        <div className="flex flex-wrap items-center gap-2">
          <ZoneStatusBadge inZone={result.inZone} kecamatan={kecamatan} />
        </div>

        {/* Desa info */}
        {desa && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin size={12} />
            <span>{desa}, Kec. {kecamatan}</span>
          </div>
        )}

        {/* Schools */}
        {result.inZone && result.schools.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <School size={12} />
              Sekolah terdekat di zona ini:
            </p>
            <div className="flex flex-wrap gap-2">
              {result.schools.map(s => (
                <ZoneSchoolBadge key={s} school={s} />
              ))}
            </div>
          </div>
        )}

        {/* Out of zone alert */}
        {!result.inZone && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
            <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">
              Kecamatan <strong>{kecamatan}</strong> berada di luar zona prioritas SPMB. Siswa tetap dapat mendaftar namun tidak mendapat prioritas zonasi.
            </p>
          </div>
        )}

        {result.inZone && (
          <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-600">
              Domisili sesuai zona prioritas. Siswa mendapat prioritas penerimaan di sekolah-sekolah dalam zona ini.
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
