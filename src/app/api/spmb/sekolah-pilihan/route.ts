import { NextResponse } from 'next/server'
import { dbListAllSchools } from '@/lib/firestore-db'

export async function GET() {
  try {
    const schools = await dbListAllSchools({ status: 'Aktif' })
    const data = schools.map((s) => ({
      id: s.id,
      npsn: s.npsn,
      nama: s.nama,
      jenjang: s.jenjang || 'SD',
      alamat: s.alamat || '',
      desa: s.desa || '',
      kecamatan: s.kecamatan || '',
    }))

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat data sekolah'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
