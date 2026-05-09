import { NextRequest, NextResponse } from 'next/server'
import { dbFindPendaftar, dbUpdatePendaftar, dbDeletePendaftar } from '@/lib/firestore-db'
import { getAuth, requireAdmin } from '@/lib/auth'

function validateAge(tanggalLahir: string): { status: string; usia: string; rekomendasi: string } {
  const refDate = new Date('2026-07-01')
  const birthDate = new Date(tanggalLahir)
  const cutoffAccepted = new Date('2020-06-30')
  const cutoffBatas = new Date('2020-07-01')

  if (birthDate <= cutoffAccepted) {
    let years = refDate.getFullYear() - birthDate.getFullYear()
    let months = refDate.getMonth() - birthDate.getMonth()
    if (months < 0) { years--; months += 12 }
    return { status: 'Diterima', usia: `${years} tahun ${months} bulan`, rekomendasi: 'Memenuhi syarat usia minimal' }
  } else if (
    birthDate.getFullYear() === cutoffBatas.getFullYear() &&
    birthDate.getMonth() === cutoffBatas.getMonth() &&
    birthDate.getDate() === cutoffBatas.getDate()
  ) {
    const years = refDate.getFullYear() - birthDate.getFullYear()
    return { status: 'Batas', usia: `${years} tahun 0 bulan`, rekomendasi: 'Batas minimum usia' }
  } else {
    let years = refDate.getFullYear() - birthDate.getFullYear()
    let months = refDate.getMonth() - birthDate.getMonth()
    if (months < 0) { years--; months += 12 }
    return { status: 'Ditolak', usia: `${years} tahun ${months} bulan`, rekomendasi: 'Tidak memenuhi syarat usia minimal' }
  }
}

// GET /api/spmb/pendaftar/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response

    const { id } = await params
    const pendaftar = await dbFindPendaftar({ id })
    if (!pendaftar) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 })
    }
    if (auth.user.role === 'SEKOLAH' && auth.user.npsn && pendaftar.npsn !== auth.user.npsn) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Data tidak termasuk sekolah Anda.' },
        { status: 403 }
      )
    }
    const validation = validateAge(pendaftar.tanggalLahir)
    return NextResponse.json({ success: true, data: { ...pendaftar, usia: validation.usia, rekomendasi: validation.rekomendasi } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// PUT /api/spmb/pendaftar/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response

    const { id } = await params
    const body = await request.json()
    const existing = await dbFindPendaftar({ id })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 })
    }
    if (auth.user.role === 'SEKOLAH' && auth.user.npsn && existing.npsn !== auth.user.npsn) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Data tidak termasuk sekolah Anda.' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = { ...body }
    // Re-validate age if tanggalLahir changed
    if (body.tanggalLahir && body.tanggalLahir !== existing.tanggalLahir) {
      const validation = validateAge(body.tanggalLahir)
      updateData.statusUsia = validation.status
    }
    delete updateData.id
    delete updateData.createdAt

    const pendaftar = await dbUpdatePendaftar(id, updateData)

    const validation = validateAge(pendaftar.tanggalLahir)
    return NextResponse.json({ success: true, data: { ...pendaftar, usia: validation.usia, rekomendasi: validation.rekomendasi } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// DELETE /api/spmb/pendaftar/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminCheck = requireAdmin(auth)
    if (!adminCheck.authenticated) return adminCheck.response

    const { id } = await params
    await dbDeletePendaftar(id)
    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
