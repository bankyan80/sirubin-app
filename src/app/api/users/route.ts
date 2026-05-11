import { NextRequest, NextResponse } from 'next/server'
import { dbFindUser, dbListUsers, dbCreateUser } from '@/lib/firestore-db'
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
    const { email, name, role, jenjang, npsn } = body

    if (!email || !name || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, nama, dan role wajib diisi' },
        { status: 400 }
      )
    }

    // Check duplicate email
    const existing = await dbFindUser({ email })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email sudah digunakan' },
        { status: 400 }
      )
    }

    const user = await dbCreateUser({
      email,
      username: email,
      name,
      role: role.toUpperCase(),
      jenjang: jenjang || null,
      npsn: npsn || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create user'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
