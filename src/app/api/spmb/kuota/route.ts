import { NextRequest, NextResponse } from 'next/server'
import { dbListAllKuota, dbUpsertKuota } from '@/lib/firestore-db'
import { getAuth, requireAdmin } from '@/lib/auth'

// GET /api/spmb/kuota — list all quotas
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminCheck = requireAdmin(auth)
    if (!adminCheck.authenticated) return adminCheck.response

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId') || ''

    const kuota = await dbListAllKuota(schoolId || undefined)

    return NextResponse.json({ success: true, data: kuota })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch kuota'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// POST /api/spmb/kuota — create or update quota (upsert)
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminCheck = requireAdmin(auth)
    if (!adminCheck.authenticated) return adminCheck.response

    const body = await request.json()
    const { schoolId, npsn, namaSekolah, rombel } = body

    if (!schoolId || !npsn || !namaSekolah) {
      return NextResponse.json(
        { success: false, message: 'schoolId, npsn, namaSekolah wajib diisi' },
        { status: 400 }
      )
    }

    const kuota = rombel ? rombel * 40 : 40

    const data = await dbUpsertKuota(schoolId, {
      schoolId,
      npsn,
      namaSekolah,
      rombel: rombel || 1,
      kuota,
    })

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save kuota'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
