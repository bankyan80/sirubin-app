'use client'

import { MapPin, CheckCircle2, XCircle } from 'lucide-react'

interface ZoneStatusBadgeProps {
  inZone: boolean
  kecamatan?: string
}

export default function ZoneStatusBadge({ inZone, kecamatan }: ZoneStatusBadgeProps) {
  if (inZone) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={14} />
        Domisili sesuai zona
        {kecamatan && <span className="font-normal text-emerald-600">— {kecamatan}</span>}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl bg-red-100 text-red-700 border border-red-200">
      <XCircle size={14} />
      Di luar zona prioritas
      {kecamatan && <span className="font-normal text-red-600">— {kecamatan}</span>}
    </span>
  )
}

export function ZoneSchoolBadge({ school }: { school: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
      <MapPin size={12} />
      {school}
    </span>
  )
}
