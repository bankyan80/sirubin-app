import { NextRequest, NextResponse } from 'next/server'
import { dbListAllSchools, dbListAllLaporan, dbGroupSchools } from '@/lib/firestore-db'
import { getAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response

    const { searchParams } = new URL(request.url)
    const tahun = parseInt(searchParams.get('tahun') || String(new Date().getFullYear()))
    const jenjang = searchParams.get('jenjang') || ''
    const kecamatan = searchParams.get('kecamatan') || ''
    const search = searchParams.get('search') || ''

    // Build school filter
    const where: Record<string, unknown> = { status: 'Aktif' }
    if (auth.user.role === 'SEKOLAH' && auth.user.npsn) {
      where.npsn = auth.user.npsn
    }
    if (jenjang) where.jenjang = jenjang
    if (kecamatan) where.kecamatan = kecamatan

    // For search, we need to fetch all and filter client-side
    let schools = await dbListAllSchools(where)
    if (search) {
      schools = schools.filter(s => s.nama.includes(search) || (s.npsn && s.npsn.includes(search)))
    }

    // Get laporan
    const laporanFilters: Record<string, unknown> = { tahun, status: 'Submitted' }
    const allLaporan = await dbListAllLaporan(laporanFilters)

    // Get kecamatan and jenjang lists
    const allKecamatan = await dbGroupSchools('kecamatan')
    const allJenjang = await dbGroupSchools('jenjang')

    // Build laporan map: schoolId → Map<bulan, {id, persentase}>
    const laporanMap = new Map<string, Map<number, { id: string; persentase: number }>>()
    for (const l of allLaporan) {
      if (!laporanMap.has(l.schoolId)) laporanMap.set(l.schoolId, new Map())
      laporanMap.get(l.schoolId)!.set(l.bulan, { id: l.id, persentase: l.persentase })
    }

    // Determine active months
    const now = new Date()
    const currentMonth = now.getFullYear() === tahun ? now.getMonth() + 1 : (tahun < now.getFullYear() ? 12 : 0)

    const result = schools.map((school) => {
      const schoolLaporan = laporanMap.get(school.id)
      const monthlyStatus = Array.from({ length: 12 }, (_, i) => {
        const bulan = i + 1
        if (bulan > currentMonth) {
          return { status: 'belum_waktu' as const, persentase: 0, laporanId: null }
        }
        const found = schoolLaporan?.get(bulan)
        if (found) {
          return { status: 'sudah' as const, persentase: found.persentase, laporanId: found.id }
        }
        return { status: 'belum' as const, persentase: 0, laporanId: null }
      })

      const totalSudah = monthlyStatus.filter((m) => m.status === 'sudah').length
      const persentase = currentMonth > 0 ? Math.round((totalSudah / currentMonth) * 100) : 0

      return {
        schoolId: school.id,
        npsn: school.npsn,
        nama: school.nama,
        jenjang: school.jenjang,
        kecamatan: school.kecamatan,
        monthlyStatus,
        totalSudah,
        totalBulan: currentMonth,
        persentase,
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
      filters: {
        kecamatan: allKecamatan.map((k) => Object.values(k)[0] as string),
        jenjang: allJenjang.map((j) => Object.values(j)[0] as string),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch status'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
