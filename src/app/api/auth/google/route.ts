import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseApp } from '@/lib/firebase'
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth'
import { dbFindUser, dbUpdateUser, dbCreateUser, dbCountUsers } from '@/lib/firestore-db'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'Token diperlukan' },
        { status: 400 }
      )
    }

    // Verify Google ID token
    const app = getFirebaseApp()
    let decoded
    try {
      decoded = await getFirebaseAuth(app).verifyIdToken(idToken)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Token tidak valid' },
        { status: 401 }
      )
    }

    const { email, name, picture, uid } = decoded

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email tidak ditemukan di akun Google' },
        { status: 400 }
      )
    }

    // Cek apakah user sudah ada
    const existingUser = await dbFindUser({ email })

    // Jika user sudah ada → login normal
    if (existingUser) {
      await dbUpdateUser(existingUser.id, {
        googleUid: uid,
        photoURL: picture || null,
        lastLogin: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          jenjang: existingUser.jenjang,
          npsn: existingUser.npsn,
          photoURL: picture || null,
        },
      })
    }

    // Jika belum ada user sama sekali → auto-create sebagai ADMIN
    const totalUsers = await dbCountUsers()
    if (totalUsers === 0) {
      const newUser = await dbCreateUser({
        email,
        username: email,
        name: name || email.split('@')[0],
        role: 'ADMIN',
        jenjang: null,
        npsn: null,
        googleUid: uid,
        photoURL: picture || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email,
          name: name || email.split('@')[0],
          role: 'ADMIN',
          jenjang: null,
          npsn: null,
          photoURL: picture || null,
        },
      })
    }

    // Jika user belum terdaftar dan sudah ada user lain → auto-create sebagai PENGGUNA
    const newUser = await dbCreateUser({
      email,
      username: email,
      name: name || email.split('@')[0],
      role: 'PENGGUNA',
      jenjang: null,
      npsn: null,
      googleUid: uid,
      photoURL: picture || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email,
        name: name || email.split('@')[0],
        role: 'PENGGUNA',
        jenjang: null,
        npsn: null,
        photoURL: picture || null,
      },
    })
  } catch (error) {
    console.error('Google login error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    )
  }
}
