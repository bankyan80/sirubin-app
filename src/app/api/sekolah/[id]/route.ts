import { NextRequest, NextResponse } from 'next/server'
import { dbFindSchool, dbUpdateSchool, dbDeleteSchool } from '@/lib/firestore-db'
import { getAuth, requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminAuth = requireAdmin(auth)
    if (!adminAuth.authenticated) return adminAuth.response

    const { id } = await params
    const school = await dbFindSchool({ id })
    if (!school) {
      return NextResponse.json({ success: false, message: 'Sekolah tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: school })
  } catch (error) {
    console.error('GET /api/sekolah/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Gagal memuat data' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminAuth = requireAdmin(auth)
    if (!adminAuth.authenticated) return adminAuth.response

    const { id } = await params
    const body = await request.json()

    const existing = await dbFindSchool({ id })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Sekolah tidak ditemukan' }, { status: 404 })
    }

    if (body.npsn && body.npsn !== existing.npsn) {
      const dup = await dbFindSchool({ npsn: body.npsn })
      if (dup) {
        return NextResponse.json({ success: false, message: 'NPSN sudah digunakan' }, { status: 400 })
      }
    }

    const school = await dbUpdateSchool(id, body)

    return NextResponse.json({ success: true, data: school })
  } catch (error) {
    console.error('PUT /api/sekolah/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Gagal mengubah data' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminAuth = requireAdmin(auth)
    if (!adminAuth.authenticated) return adminAuth.response

    const { id } = await params
    const existing = await dbFindSchool({ id })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Sekolah tidak ditemukan' }, { status: 404 })
    }

    await dbDeleteSchool(id)
    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' })
  } catch (error) {
    console.error('DELETE /api/sekolah/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Gagal menghapus data' }, { status: 500 })
  }
}
