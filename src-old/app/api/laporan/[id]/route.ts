import { NextRequest, NextResponse } from 'next/server'
import { dbFindLaporan, dbUpdateLaporan, dbDeleteLaporan } from '@/lib/firestore-db'
import { getAuth, requireAdmin } from '@/lib/auth'

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response

    const { id } = await params
    const laporan = await dbFindLaporan({ id })
    if (!laporan) {
      return NextResponse.json({ success: false, message: 'Laporan tidak ditemukan' }, { status: 404 })
    }

    // SEKOLAH role: verify the laporan belongs to their school
    if (auth.user.role === 'SEKOLAH') {
      if (auth.user.npsn && laporan.npsn !== auth.user.npsn) {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak. Laporan ini bukan milik sekolah Anda.' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...laporan, bulanNama: BULAN[laporan.bulan] || '' },
    })
  } catch (error) {
    console.error('GET /api/laporan/[id] error:', error)
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

    const { id } = await params
    const body = await request.json()

    const existing = await dbFindLaporan({ id })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Laporan tidak ditemukan' }, { status: 404 })
    }

    // SEKOLAH role: verify the laporan belongs to their school
    if (auth.user.role === 'SEKOLAH') {
      if (auth.user.npsn && existing.npsn !== auth.user.npsn) {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak. Laporan ini bukan milik sekolah Anda.' },
          { status: 403 }
        )
      }
    }

    // Recalculate percentage from checklist
    const checklist = [
      body.dataSekolahUpdate ?? existing.dataSekolahUpdate,
      body.dataGuruUpdate ?? existing.dataGuruUpdate,
      body.dataSiswaUpdate ?? existing.dataSiswaUpdate,
      body.jadwalTersedia ?? existing.jadwalTersedia,
      body.absensiTersedia ?? existing.absensiTersedia,
      body.arsipTertata ?? existing.arsipTertata,
    ]
    const filled = checklist.filter(Boolean).length
    const persentase = Math.round((filled / 6) * 100)

    const laporan = await dbUpdateLaporan(id, {
      ...body,
      persentase,
      submittedAt: body.status === 'Submitted' ? new Date().toISOString() : existing.submittedAt,
    })

    return NextResponse.json({ success: true, data: laporan, message: 'Laporan berhasil diperbarui' })
  } catch (error) {
    console.error('PUT /api/laporan/[id] error:', error)
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

    // Only admin can delete laporan
    const adminCheck = requireAdmin(auth)
    if (!adminCheck.authenticated) return adminCheck.response

    const { id } = await params
    const existing = await dbFindLaporan({ id })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Laporan tidak ditemukan' }, { status: 404 })
    }
    await dbDeleteLaporan(id)
    return NextResponse.json({ success: true, message: 'Laporan berhasil dihapus' })
  } catch (error) {
    console.error('DELETE /api/laporan/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Gagal menghapus' }, { status: 500 })
  }
}
