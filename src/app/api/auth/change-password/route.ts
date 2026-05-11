import { NextRequest, NextResponse } from 'next/server'
import { dbFindUserWithPassword, dbUpdateUser } from '@/lib/firestore-db'
import bcrypt from 'bcryptjs'
import { getAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response

    const { userId, currentPassword, newPassword } = await request.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Verify the authenticated user can only change their own password
    if (auth.user.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Anda hanya dapat mengubah password Anda sendiri.' },
        { status: 403 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password baru minimal 6 karakter' },
        { status: 400 }
      )
    }

    const user = await dbFindUserWithPassword({ id: userId })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Password saat ini salah' },
        { status: 401 }
      )
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await dbUpdateUser(userId, {
      password: hashedNewPassword,
      mustChangePassword: false,
    })

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
