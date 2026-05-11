import { NextRequest, NextResponse } from 'next/server'
import { dbFindKuota, dbUpdateKuota, dbDeleteKuota } from '@/lib/firestore-db'
import { getAuth, requireAdmin } from '@/lib/auth'

// GET /api/spmb/kuota/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminCheck = requireAdmin(auth)
    if (!adminCheck.authenticated) return adminCheck.response

    const { id } = await params
    const kuota = await dbFindKuota({ id })
    if (!kuota) {
      return NextResponse.json({ success: false, message: 'Kuota tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: kuota })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// PUT /api/spmb/kuota/[id] — update rombel & kuota (inline edit)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminCheck = requireAdmin(auth)
    if (!adminCheck.authenticated) return adminCheck.response

    const { id } = await params
    const body = await request.json()
    const { rombel } = body

    const existing = await dbFindKuota({ id })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Kuota tidak ditemukan' }, { status: 404 })
    }

    const newRombel = rombel !== undefined ? rombel : existing.rombel
    const newKuota = newRombel * 40

    const data = await dbUpdateKuota(id, { rombel: newRombel, kuota: newKuota })

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// DELETE /api/spmb/kuota/[id]
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
    await dbDeleteKuota(id)
    return NextResponse.json({ success: true, message: 'Kuota berhasil dihapus' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
