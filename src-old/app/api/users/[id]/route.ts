import { NextRequest, NextResponse } from 'next/server'
import { dbFindUser, dbUpdateUser, dbDeleteUser, dbCountUsers } from '@/lib/firestore-db'
import bcrypt from 'bcryptjs'
import { getAuth, requireAdmin } from '@/lib/auth'

// GET /api/users/[id]
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
    const user = await dbFindUser({ id })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// PUT /api/users/[id] — update user (admin: full access, sekolah: own name only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const { id } = await params
    const isSelf = auth.user.userId === id

    // Non-admin users can only update their own name
    if (!isSelf) {
      const adminAuth = requireAdmin(auth)
      if (!adminAuth.authenticated) return adminAuth.response
    }

    const body = await request.json()
    const { username, role, name, jenjang, npsn, mustChangePassword, newPassword } = body

    const existing = await dbFindUser({ id })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 })
    }

    // Self-update: only allow changing name
    if (isSelf && auth.user.role !== 'ADMIN') {
      const updateData: Record<string, unknown> = {}
      if (name) updateData.name = name
      const user = await dbUpdateUser(id, updateData)
      return NextResponse.json({ success: true, data: user })
    }

    // Admin: full update
    // Check username uniqueness if changed
    if (username && username !== existing.username) {
      const duplicate = await dbFindUser({ username })
      if (duplicate) {
        return NextResponse.json({ success: false, message: 'Username sudah digunakan' }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (username) updateData.username = username
    if (role) updateData.role = role.toUpperCase()
    if (name) updateData.name = name
    if (jenjang !== undefined) updateData.jenjang = jenjang || null
    if (npsn !== undefined) updateData.npsn = npsn || null
    if (mustChangePassword !== undefined) updateData.mustChangePassword = mustChangePassword

    // If admin wants to reset password
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10)
      updateData.mustChangePassword = true
    }

    const user = await dbUpdateUser(id, updateData)

    return NextResponse.json({ success: true, data: user })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// DELETE /api/users/[id]
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
    const existing = await dbFindUser({ id })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 })
    }

    // Don't allow deleting the last admin
    if (existing.role === 'ADMIN') {
      const adminCount = await dbCountUsers({ role: 'ADMIN' })
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: 'Tidak dapat menghapus admin terakhir' },
          { status: 400 }
        )
      }
    }

    await dbDeleteUser(id)

    return NextResponse.json({ success: true, message: 'User berhasil dihapus' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
