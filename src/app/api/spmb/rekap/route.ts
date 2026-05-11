import { NextRequest, NextResponse } from 'next/server'
import { dbListAllSchools, dbListAllKuota, dbListPendaftar } from '@/lib/firestore-db'
import { getAuth, requireAdmin } from '@/lib/auth'

// GET /api/spmb/rekap — comprehensive SPMB recap
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminCheck = requireAdmin(auth)
    if (!adminCheck.authenticated) return adminCheck.response

    // Get all active schools
    const schools = await dbListAllSchools({ status: 'Aktif' })

    // Get all quotas
    const kuotas = await dbListAllKuota()
    const kuotaMap = new Map(kuotas.map(k => [k.schoolId, k]))

    // Get all pendaftar
    const allPendaftar = await dbListPendaftar()

    // Group pendaftar by school
    const pendaftarBySchool = new Map<string, typeof allPendaftar>()
    for (const p of allPendaftar) {
      const arr = pendaftarBySchool.get(p.schoolId) || []
      arr.push(p)
      pendaftarBySchool.set(p.schoolId, arr)
    }

    // Build recap
    const rekap = schools.map(school => {
      const kuota = kuotaMap.get(school.id)
      const pendaftar = pendaftarBySchool.get(school.id) || []
      const diterima = pendaftar.filter(p => p.statusUsia === 'Diterima').length
      const ditolak = pendaftar.filter(p => p.statusUsia === 'Ditolak').length
      const batas = pendaftar.filter(p => p.statusUsia === 'Batas').length
      const totalPendaftar = pendaftar.length
      const kuotaValue = kuota?.kuota || 40

      let keterangan = 'Belum input'
      if (totalPendaftar > 0) {
        if (diterima > kuotaValue) keterangan = 'Melebihi kuota'
        else if (diterima === kuotaValue) keterangan = 'Penuh'
        else keterangan = 'Belum penuh'
      }

      return {
        schoolId: school.id,
        npsn: school.npsn,
        namaSekolah: school.nama,
        jenjang: school.jenjang,
        rombel: kuota?.rombel || 1,
        kuota: kuotaValue,
        totalPendaftar,
        diterima,
        batas,
        ditolak,
        keterangan,
      }
    })

    // Monitoring
    const monitoring = {
      belumInput: rekap.filter(r => r.totalPendaftar === 0).map(r => r.namaSekolah),
      belumPenuh: rekap.filter(r => r.totalPendaftar > 0 && r.keterangan === 'Belum penuh').map(r => ({
        namaSekolah: r.namaSekolah,
        diterima: r.diterima,
        kuota: r.kuota,
        sisa: r.kuota - r.diterima,
      })),
      melebihiKuota: rekap.filter(r => r.keterangan === 'Melebihi kuota').map(r => ({
        namaSekolah: r.namaSekolah,
        diterima: r.diterima,
        kuota: r.kuota,
        lembur: r.diterima - r.kuota,
      })),
    }

    // Totals
    const totals = {
      totalSekolah: schools.length,
      totalPendaftar: allPendaftar.length,
      totalDiterima: allPendaftar.filter(p => p.statusUsia === 'Diterima').length,
      totalBatas: allPendaftar.filter(p => p.statusUsia === 'Batas').length,
      totalDitolak: allPendaftar.filter(p => p.statusUsia === 'Ditolak').length,
    }

    return NextResponse.json({
      success: true,
      data: { rekap, monitoring, totals },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch rekap'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
