import { NextRequest, NextResponse } from 'next/server'
import { dbListPendaftar, dbCreatePendaftar } from '@/lib/firestore-db'
import { getAuth } from '@/lib/auth'

// Age validation logic
// Reference date: 1 July 2026
// Diterima: born <= 30 June 2020
// Batas: born == 1 July 2020
// Ditolak: born > 1 July 2020
function validateAge(tanggalLahir: string): { status: string; usia: string; rekomendasi: string } {
  const refDate = new Date('2026-07-01')
  const birthDate = new Date(tanggalLahir)
  const cutoffAccepted = new Date('2020-06-30')
  const cutoffBatas = new Date('2020-07-01')

  if (birthDate <= cutoffAccepted) {
    // Calculate age at reference date
    let years = refDate.getFullYear() - birthDate.getFullYear()
    let months = refDate.getMonth() - birthDate.getMonth()
    if (months < 0) { years--; months += 12 }
    const days = refDate.getDate() - birthDate.getDate()
    return {
      status: 'Diterima',
      usia: `${years} tahun ${months} bulan`,
      rekomendasi: 'Memenuhi syarat usia minimal',
    }
  } else if (
    birthDate.getFullYear() === cutoffBatas.getFullYear() &&
    birthDate.getMonth() === cutoffBatas.getMonth() &&
    birthDate.getDate() === cutoffBatas.getDate()
  ) {
    const years = refDate.getFullYear() - birthDate.getFullYear()
    return {
      status: 'Batas',
      usia: `${years} tahun 0 bulan`,
      rekomendasi: 'Batas minimum usia — perlu konfirmasi',
    }
  } else {
    let years = refDate.getFullYear() - birthDate.getFullYear()
    let months = refDate.getMonth() - birthDate.getMonth()
    if (months < 0) { years--; months += 12 }
    return {
      status: 'Ditolak',
      usia: `${years} tahun ${months} bulan`,
      rekomendasi: 'Tidak memenuhi syarat usia minimal',
    }
  }
}

// GET /api/spmb/pendaftar
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statusUsia = searchParams.get('statusUsia') || ''
    const npsn = searchParams.get('npsn') || ''
    const schoolId = searchParams.get('schoolId') || ''

    // Build filters for dbListPendaftar
    const filters: Record<string, string> = {}
    if (auth.user.role === 'SEKOLAH' && auth.user.npsn) {
      filters.npsn = auth.user.npsn
    }
    if (statusUsia) filters.statusUsia = statusUsia
    if (npsn) filters.npsn = npsn
    if (schoolId) filters.schoolId = schoolId

    // For search, we need to pass it through and also apply SEKOLAH npsn filter
    const effectiveSearch = search || undefined
    const effectiveNpsn = filters.npsn || npsn || undefined
    const effectiveStatusUsia = statusUsia || undefined
    const effectiveSchoolId = schoolId || undefined

    const data = await dbListPendaftar({
      search: effectiveSearch,
      statusUsia: effectiveStatusUsia,
      npsn: effectiveNpsn,
      schoolId: effectiveSchoolId,
    })

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pendaftar'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// POST /api/spmb/pendaftar — create pendaftar
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response

    const body = await request.json()
    const { schoolId, npsn, namaSekolah, namaSiswa, nisn, tanggalLahir, jenisKelamin, asalSekolah, catatan } = body

    if (auth.user.role === 'SEKOLAH') {
      if (npsn !== auth.user.npsn) {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak. NPSN tidak sesuai dengan sekolah Anda.' },
          { status: 403 }
        )
      }
    }

    if (!schoolId || !npsn || !namaSekolah || !namaSiswa || !tanggalLahir || !jenisKelamin) {
      return NextResponse.json(
        { success: false, message: 'Field wajib: schoolId, npsn, namaSekolah, namaSiswa, tanggalLahir, jenisKelamin' },
        { status: 400 }
      )
    }

    const validation = validateAge(tanggalLahir)

    // Get next no urut for this school
    const allSchoolPendaftar = await dbListPendaftar({ schoolId })
    const lastNo = allSchoolPendaftar.reduce((max, p) => Math.max(max, p.noUrut || 0), 0)
    const noUrut = lastNo + 1

    const pendaftar = await dbCreatePendaftar({
      schoolId,
      npsn,
      namaSekolah,
      namaSiswa: namaSiswa.toUpperCase(),
      nisn: nisn || null,
      tanggalLahir,
      jenisKelamin,
      asalSekolah: asalSekolah || 'Lainnya',
      statusUsia: validation.status,
      noUrut,
      catatan: catatan || null,
    })

    return NextResponse.json({ success: true, data: { ...pendaftar, usia: validation.usia, rekomendasi: validation.rekomendasi } }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create pendaftar'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
