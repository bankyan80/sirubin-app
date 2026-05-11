import { NextRequest, NextResponse } from 'next/server'
import { dbFindSchool, dbUpdateSchool } from '@/lib/firestore-db'
import { getAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response

    const user = auth.user

    if (!user.npsn) {
      return NextResponse.json({ success: false, message: 'Akun belum terhubung ke data sekolah' }, { status: 400 })
    }

    const school = await dbFindSchool({ npsn: user.npsn })
    if (!school) {
      return NextResponse.json({ success: false, message: 'Data sekolah tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: school })
  } catch (error) {
    console.error('GET /api/sekolah/saya error:', error)
    return NextResponse.json({ success: false, message: 'Gagal memuat data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response

    const user = auth.user

    if (!user.npsn) {
      return NextResponse.json({ success: false, message: 'Akun belum terhubung ke data sekolah' }, { status: 400 })
    }

    const school = await dbFindSchool({ npsn: user.npsn })
    if (!school) {
      return NextResponse.json({ success: false, message: 'Data sekolah tidak ditemukan' }, { status: 404 })
    }

    const body = await request.json()
    // SEKOLAH cannot change NPSN or status
    delete body.npsn
    delete body.status

    const updated = await dbUpdateSchool(school.id, body)

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PUT /api/sekolah/saya error:', error)
    return NextResponse.json({ success: false, message: 'Gagal mengubah data' }, { status: 500 })
  }
}