import { NextRequest, NextResponse } from 'next/server'
import { dbFindUser } from '@/lib/firestore-db'

export interface AuthContext {
  userId: string
  role: string
  npsn: string | null
  name: string
}

export interface AuthResult {
  authenticated: true
  user: AuthContext
}

export interface AuthError {
  authenticated: false
  response: NextResponse
}

type AuthCheck = AuthResult | AuthError

/**
 * Extract and validate auth from request headers.
 * Client should send: X-User-Id, X-User-Role, X-User-Npsn, X-User-Name
 * Validates against Firestore database to prevent spoofing.
 */
export async function getAuth(request: NextRequest): Promise<AuthCheck> {
  const userId = request.headers.get('x-user-id')
  const role = request.headers.get('x-user-role')
  const npsn = request.headers.get('x-user-npsn')
  const name = request.headers.get('x-user-name')

  if (!userId || !role) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, message: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      ),
    }
  }

  // Validate against Firestore (prevent header spoofing)
  const user = await dbFindUser({ id: userId })

  if (!user) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, message: 'User tidak ditemukan.' },
        { status: 401 }
      ),
    }
  }

  // Verify role matches
  if (user.role !== role.toUpperCase()) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, message: 'Akses tidak valid.' },
        { status: 401 }
      ),
    }
  }

  return {
    authenticated: true,
    user: {
      userId: user.id,
      role: user.role,
      npsn: user.npsn || null,
      name: user.name,
    },
  }
}

/**
 * Require admin role. Returns error if not admin.
 */
export function requireAdmin(auth: AuthResult): AuthCheck {
  if (auth.user.role !== 'ADMIN') {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, message: 'Akses ditolak. Hanya admin yang dapat mengakses.' },
        { status: 403 }
      ),
    }
  }
  return auth
}

/**
 * Get schoolId for a sekolah user. Returns error if sekolah user has no school.
 */
export function getSchoolNpsn(auth: AuthResult): string {
  if (auth.user.role === 'SEKOLAH' && !auth.user.npsn) {
    throw new Error('Akun sekolah belum terhubung ke data sekolah.')
  }
  return auth.user.npsn || ''
}
