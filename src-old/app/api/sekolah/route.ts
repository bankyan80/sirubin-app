import { NextRequest, NextResponse } from 'next/server'
import { dbListSchools, dbListAllSchools, dbFindSchool, dbCreateSchool } from '@/lib/firestore-db'
import { getAuth, requireAdmin } from '@/lib/auth'

// sekolah API
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminAuth = requireAdmin(auth)
    if (!adminAuth.authenticated) return adminAuth.response

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const jenjang = searchParams.get('jenjang') || ''
    const kecamatan = searchParams.get('kecamatan') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data, total } = await dbListSchools({ search, jenjang, kecamatan, status, page, limit })

    // Get unique kecamatan values for filter
    const allSchools = await dbListAllSchools()
    const kecamatanList = [...new Set(allSchools.map(s => s.kecamatan))].sort()

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      kecamatanList,
    })
  } catch (error) {
    console.error('GET /api/sekolah error:', error)
    return NextResponse.json({ success: false, message: 'Gagal memuat data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminAuth = requireAdmin(auth)
    if (!adminAuth.authenticated) return adminAuth.response

    const body = await request.json()
    const { npsn, nama, jenjang, alamat, kecamatan, desa, kepalaSekolah, status, noHp, email, tahunBerdiri, akreditasi } = body

    if (!npsn || !nama || !jenjang || !alamat || !kecamatan || !desa || !kepalaSekolah) {
      return NextResponse.json({ success: false, message: 'Field wajib belum lengkap' }, { status: 400 })
    }

    const existing = await dbFindSchool({ npsn })
    if (existing) {
      return NextResponse.json({ success: false, message: 'NPSN sudah terdaftar' }, { status: 400 })
    }

    const school = await dbCreateSchool({ npsn, nama, jenjang, alamat, kecamatan, desa, kepalaSekolah, status: status || 'Aktif', noHp, email, tahunBerdiri, akreditasi })

    return NextResponse.json({ success: true, data: school })
  } catch (error) {
    console.error('POST /api/sekolah error:', error)
    return NextResponse.json({ success: false, message: 'Gagal menambah data' }, { status: 500 })
  }
}
