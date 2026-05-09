import { NextRequest, NextResponse } from 'next/server'
import { dbFindUser, dbListUsers, dbCreateUser } from '@/lib/firestore-db'
import bcrypt from 'bcryptjs'
import { getAuth, requireAdmin } from '@/lib/auth'

// GET /api/users — list all users with search/filter
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminAuth = requireAdmin(auth)
    if (!adminAuth.authenticated) return adminAuth.response
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data: users, total } = await dbListUsers({
      search: search || undefined,
      role: role || undefined,
      page,
      limit,
    })

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// POST /api/users — create new user
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminAuth = requireAdmin(auth)
    if (!adminAuth.authenticated) return adminAuth.response
    const body = await request.json()
    const { username, password, role, name, jenjang, npsn } = body

    if (!username || !password || !role || !name) {
      return NextResponse.json(
        { success: false, message: 'Username, password, role, dan name wajib diisi' },
        { status: 400 }
      )
    }

    // Check duplicate username
    const existing = await dbFindUser({ username })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Username sudah digunakan' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await dbCreateUser({
      username,
      password: hashedPassword,
      role: role.toUpperCase(),
      name,
      jenjang: jenjang || null,
      npsn: npsn || null,
      mustChangePassword: true,
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create user'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
