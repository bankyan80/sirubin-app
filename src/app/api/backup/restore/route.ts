import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseDb } from '@/lib/firebase'
import { getAuth, requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminAuth = requireAdmin(auth)
    if (!adminAuth.authenticated) return adminAuth.response

    const { collection, data } = await request.json()

    if (!collection || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, message: 'Data tidak valid' },
        { status: 400 }
      )
    }

    const validCollections = ['sekolah', 'laporan', 'users']
    if (!validCollections.includes(collection)) {
      return NextResponse.json(
        { success: false, message: 'Koleksi tidak valid' },
        { status: 400 }
      )
    }

    const db = getFirebaseDb()
    const batch = db.batch()
    const colRef = db.collection(collection)
    let count = 0

    for (const item of data) {
      const { id, ...rest } = item as Record<string, unknown>
      const docRef = id ? colRef.doc(String(id)) : colRef.doc()
      batch.set(docRef, {
        ...rest,
        updatedAt: new Date(),
      })
      count++
    }

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: `Berhasil merestore ${count} data ke koleksi ${collection}`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal restore data'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
