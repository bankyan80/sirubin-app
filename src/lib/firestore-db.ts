import { getFirebaseDb } from '@/lib/firebase'
import { FieldValue, Query, DocumentSnapshot, CollectionReference, WriteBatch } from 'firebase-admin/firestore'

// ==================== HELPER FUNCTIONS ====================

/** Convert Firestore Timestamp to ISO string or null */
function tsToISO(ts: any): string | null {
  if (!ts) return null
  if (typeof ts.toDate === 'function') return ts.toDate().toISOString()
  if (typeof ts === 'string') return ts
  return new Date(ts).toISOString()
}

/** Convert Date/ISO to Firestore Timestamp */
function toTimestamp(val: any): any {
  if (!val) return null
  if (val._seconds) return val // Already a Firestore Timestamp
  return new Date(val)
}

/** Sanitize a document snapshot to a plain object */
function sanitize(doc: DocumentSnapshot): Record<string, any> | null {
  if (!doc.exists) return null
  const data = doc.data()!
  return {
    id: doc.id,
    ...data,
    createdAt: tsToISO(data.createdAt),
    updatedAt: tsToISO(data.updatedAt),
    submittedAt: tsToISO(data.submittedAt),
  }
}

/** Apply pagination and ordering */
async function queryWithPagination<T>(
  collection: CollectionReference,
  filters: Record<string, unknown>,
  orderBy: string[],
  page: number,
  limit: number
): Promise<{ data: T[]; total: number }> {
  let query: Query = collection

  // Apply filters
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      query = query.where(key, '==', value)
    }
  }

  // Fetch all matching docs, sort in memory (avoids composite index requirement)
  const snapshot = await query.get()
  let all = snapshot.docs.map(d => sanitize(d)) as T[]

  // Sort in memory
  if (orderBy.length > 0) {
    all = all.sort((a: any, b: any) => {
      for (const field of orderBy) {
        const cmp = (a[field] || '').localeCompare(b[field] || '')
        if (cmp !== 0) return cmp
      }
      return 0
    })
  }

  const total = all.length
  const offset = (page - 1) * limit
  const data = all.slice(offset, offset + limit)

  return { data, total }
}

/** Apply OR-like filter by running multiple queries and merging */
async function queryWithOr<T>(
  collection: CollectionReference,
  orFields: Array<{ field: string; value: string }>,
  baseFilters: Record<string, unknown>,
  orderBy: string[],
  page: number,
  limit: number
): Promise<{ data: T[]; total: number }> {
  // Firestore doesn't support OR natively, so we query each OR branch separately
  const seen = new Set<string>()
  const results: T[] = []

  for (const { field, value } of orFields) {
    let query: Query = collection.where(field, '==', value)
    for (const [key, val] of Object.entries(baseFilters)) {
      if (val !== undefined && val !== null && val !== '' && key !== 'OR') {
        query = query.where(key, '==', val)
      }
    }
    const snapshot = await query.get()
    for (const doc of snapshot.docs) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id)
        results.push(sanitize(doc) as T)
      }
    }
  }

  // Simple client-side pagination
  const total = results.length
  const offset = (page - 1) * limit
  const data = results.slice(offset, offset + limit)

  return { data, total }
}

// ==================== COLLECTION REFERENCES ====================

export function usersCollection() { return getFirebaseDb().collection('users') }
export function schoolsCollection() { return getFirebaseDb().collection('schools') }
export function laporanCollection() { return getFirebaseDb().collection('laporan') }
export function pendaftarCollection() { return getFirebaseDb().collection('pendaftar') }
export function kuotaCollection() { return getFirebaseDb().collection('kuotaSekolah') }
export function settingsCollection() { return getFirebaseDb().collection('settings') }

// ==================== USERS ====================

export async function dbFindUser(where: { id?: string; username?: string; email?: string }): Promise<Record<string, any> | null> {
  const col = usersCollection()
  let doc: DocumentSnapshot | null = null

  if (where.id) {
    doc = await col.doc(where.id).get()
  } else if (where.email) {
    const snapshot = await col.where('email', '==', where.email).limit(1).get()
    if (!snapshot.empty) doc = snapshot.docs[0]
  } else if (where.username) {
    const snapshot = await col.where('username', '==', where.username).limit(1).get()
    if (!snapshot.empty) doc = snapshot.docs[0]
  }

  if (!doc || !doc.exists) return null
  const data = sanitize(doc)!
  // Remove password from default response
  const { password, ...rest } = data
  return rest
}

export async function dbFindUserWithPassword(where: { id?: string; username?: string; email?: string }): Promise<Record<string, any> | null> {
  const col = usersCollection()
  let doc: DocumentSnapshot | null = null

  if (where.id) {
    doc = await col.doc(where.id).get()
  } else if (where.username) {
    const snapshot = await col.where('username', '==', where.username).limit(1).get()
    if (!snapshot.empty) doc = snapshot.docs[0]
  }

  if (!doc || !doc.exists) return null
  return sanitize(doc)
}

export async function dbCreateUser(data: Record<string, any>): Promise<Record<string, any>> {
  const col = usersCollection()
  const now = new Date()
  const docRef = await col.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  const doc = await docRef.get()
  const result = sanitize(doc)!
  const { password, ...rest } = result
  return rest
}

export async function dbUpdateUser(id: string, data: Record<string, any>): Promise<Record<string, any>> {
  const col = usersCollection()
  await col.doc(id).update({
    ...data,
    updatedAt: new Date(),
  })
  const doc = await col.doc(id).get()
  const result = sanitize(doc)!
  const { password, ...rest } = result
  return rest
}

export async function dbDeleteUser(id: string): Promise<void> {
  await usersCollection().doc(id).delete()
}

export async function dbCountUsers(where?: Record<string, unknown>): Promise<number> {
  let query: Query = usersCollection()
  if (where) {
    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.where(key, '==', value)
      }
    }
  }
  const snapshot = await query.count().get()
  return snapshot.data().count
}

export async function dbListUsers(params: {
  search?: string; role?: string; page?: number; limit?: number
}): Promise<{ data: Record<string, any>[]; total: number }> {
  const col = usersCollection()
  const page = params.page || 1
  const limit = params.limit || 50

  // Build OR conditions for search
  const orFields: Array<{ field: string; value: string }> = []
  if (params.search) {
    orFields.push({ field: 'name', value: params.search })
    orFields.push({ field: 'email', value: params.search })
    orFields.push({ field: 'username', value: params.search })
    orFields.push({ field: 'npsn', value: params.search })
  }

  const baseFilters: Record<string, unknown> = {}
  if (params.role) baseFilters.role = params.role

  if (orFields.length > 0) {
    return queryWithOr(col, orFields, baseFilters, ['createdAt'], page, limit)
  }

  return queryWithPagination(col, baseFilters, ['createdAt'], page, limit)
}

// ==================== SCHOOLS ====================

export async function dbFindSchool(where: { id?: string; npsn?: string }): Promise<Record<string, any> | null> {
  const col = schoolsCollection()
  let doc: DocumentSnapshot | null = null

  if (where.id) {
    doc = await col.doc(where.id).get()
  } else if (where.npsn) {
    const snapshot = await col.where('npsn', '==', where.npsn).limit(1).get()
    if (!snapshot.empty) doc = snapshot.docs[0]
  }

  return doc && doc.exists ? sanitize(doc) : null
}

export async function dbCreateSchool(data: Record<string, any>): Promise<Record<string, any>> {
  const col = schoolsCollection()
  const now = new Date()
  const docRef = await col.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  const doc = await docRef.get()
  return sanitize(doc)!
}

export async function dbUpdateSchool(id: string, data: Record<string, any>): Promise<Record<string, any>> {
  const col = schoolsCollection()
  await col.doc(id).update({
    ...data,
    updatedAt: new Date(),
  })
  const doc = await col.doc(id).get()
  return sanitize(doc)!
}

export async function dbDeleteSchool(id: string): Promise<void> {
  await schoolsCollection().doc(id).delete()
}

export async function dbListSchools(params: {
  search?: string; jenjang?: string; kecamatan?: string; status?: string
  page?: number; limit?: number
}): Promise<{ data: Record<string, any>[]; total: number }> {
  const col = schoolsCollection()
  const page = params.page || 1
  const limit = params.limit || 50

  const orFields: Array<{ field: string; value: string }> = []
  if (params.search) {
    orFields.push({ field: 'nama', value: params.search })
    orFields.push({ field: 'npsn', value: params.search })
    orFields.push({ field: 'kepalaSekolah', value: params.search })
    orFields.push({ field: 'kecamatan', value: params.search })
  }

  const baseFilters: Record<string, unknown> = {}
  if (params.jenjang) baseFilters.jenjang = params.jenjang
  if (params.kecamatan) baseFilters.kecamatan = params.kecamatan
  if (params.status) baseFilters.status = params.status

  if (orFields.length > 0) {
    return queryWithOr(col, orFields, baseFilters, ['jenjang', 'nama'], page, limit)
  }

  return queryWithPagination(col, baseFilters, ['jenjang', 'nama'], page, limit)
}

export async function dbListAllSchools(filters?: Record<string, unknown>): Promise<Record<string, any>[]> {
  const col = schoolsCollection()
  let query: Query = col

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.where(key, '==', value)
      }
    }
  }

    const snapshot = await query.get()
    const results = snapshot.docs.map(d => sanitize(d)!)
    return results.sort((a, b) => (a.jenjang || '').localeCompare(b.jenjang || '') || (a.nama || '').localeCompare(b.nama || ''))
}

export async function dbGroupSchools(field: string): Promise<Array<{ [key: string]: string; count: number }>> {
  const col = schoolsCollection()
  const snapshot = await col.get()
  const groups = new Map<string, number>()
  
  for (const doc of snapshot.docs) {
    const data = doc.data()
    const val = data[field] || 'Lainnya'
    groups.set(val, (groups.get(val) || 0) + 1)
  }

  return Array.from(groups.entries()).map(([value, count]) => ({ [field]: value, count }))
}

// ==================== LAPORAN ====================

export async function dbFindLaporan(where: { id?: string; schoolId?: string; bulan?: number; tahun?: number }): Promise<Record<string, any> | null> {
  const col = laporanCollection()
  let doc: DocumentSnapshot | null = null

  if (where.id) {
    doc = await col.doc(where.id).get()
  } else if (where.schoolId && where.bulan !== undefined && where.tahun !== undefined) {
    const snapshot = await col
      .where('schoolId', '==', where.schoolId)
      .where('bulan', '==', where.bulan)
      .where('tahun', '==', where.tahun)
      .limit(1).get()
    if (!snapshot.empty) doc = snapshot.docs[0]
  }

  return doc && doc.exists ? sanitize(doc) : null
}

export async function dbCreateLaporan(data: Record<string, any>): Promise<Record<string, any>> {
  const col = laporanCollection()
  const now = new Date()
  const docRef = await col.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  const doc = await docRef.get()
  return sanitize(doc)!
}

export async function dbUpsertLaporan(
  schoolId: string, bulan: number, tahun: number,
  data: Record<string, any>
): Promise<{ doc: Record<string, any>; isNew: boolean }> {
  const existing = await dbFindLaporan({ schoolId, bulan, tahun })

  if (existing) {
    const updated = await dbUpdateLaporan(existing.id, data)
    return { doc: updated, isNew: false }
  } else {
    const created = await dbCreateLaporan(data)
    return { doc: created, isNew: true }
  }
}

export async function dbUpdateLaporan(id: string, data: Record<string, any>): Promise<Record<string, any>> {
  const col = laporanCollection()
  await col.doc(id).update({
    ...data,
    updatedAt: new Date(),
  })
  const doc = await col.doc(id).get()
  return sanitize(doc)!
}

export async function dbDeleteLaporan(id: string): Promise<void> {
  await laporanCollection().doc(id).delete()
}

export async function dbListLaporan(params: {
  search?: string; jenjang?: string; bulan?: string; tahun?: string
  status?: string; schoolId?: string; npsn?: string; page?: number; limit?: number
}): Promise<{ data: Record<string, any>[]; total: number }> {
  const col = laporanCollection()
  const page = params.page || 1
  const limit = params.limit || 50

  const orFields: Array<{ field: string; value: string }> = []
  if (params.search) {
    orFields.push({ field: 'namaSekolah', value: params.search })
    orFields.push({ field: 'npsn', value: params.search })
  }

  const baseFilters: Record<string, unknown> = {}
  if (params.jenjang) baseFilters.jenjang = params.jenjang
  if (params.bulan) baseFilters.bulan = parseInt(params.bulan)
  if (params.tahun) baseFilters.tahun = parseInt(params.tahun)
  if (params.status) baseFilters.status = params.status
  if (params.schoolId) baseFilters.schoolId = params.schoolId
  if (params.npsn) baseFilters.npsn = params.npsn

  if (orFields.length > 0) {
    return queryWithOr(col, orFields, baseFilters, ['tahun', 'bulan', 'createdAt'], page, limit)
  }

  return queryWithPagination(col, baseFilters, ['tahun', 'bulan', 'createdAt'], page, limit)
}

export async function dbCountLaporan(filters?: Record<string, unknown>): Promise<number> {
  const col = laporanCollection()
  let query: Query = col
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.where(key, '==', value)
      }
    }
  }
  const snapshot = await query.count().get()
  return snapshot.data().count
}

export async function dbListAllLaporan(filters?: Record<string, unknown>): Promise<Record<string, any>[]> {
  const col = laporanCollection()
  let query: Query = col
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.where(key, '==', value)
      }
    }
  }
  const snapshot = await query.get()
  return snapshot.docs.map(d => sanitize(d)!)
}

// ==================== PENDAFTAR (SPMB) ====================

export async function dbFindPendaftar(where: { id?: string }): Promise<Record<string, any> | null> {
  if (where.id) {
    const doc = await pendaftarCollection().doc(where.id).get()
    return doc.exists ? sanitize(doc) : null
  }
  return null
}

export async function dbCreatePendaftar(data: Record<string, any>): Promise<Record<string, any>> {
  const col = pendaftarCollection()
  const now = new Date()
  const docRef = await col.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  const doc = await docRef.get()
  return sanitize(doc)!
}

export async function dbUpdatePendaftar(id: string, data: Record<string, any>): Promise<Record<string, any>> {
  await pendaftarCollection().doc(id).update({ ...data, updatedAt: new Date() })
  const doc = await pendaftarCollection().doc(id).get()
  return sanitize(doc)!
}

export async function dbDeletePendaftar(id: string): Promise<void> {
  await pendaftarCollection().doc(id).delete()
}

export async function dbListPendaftar(params: {
  search?: string; statusUsia?: string; npsn?: string; schoolId?: string
}): Promise<Record<string, any>[]> {
  const col = pendaftarCollection()
  let query: Query = col.orderBy('schoolId').orderBy('noUrut').orderBy('createdAt')

  const orFields: Array<{ field: string; value: string }> = []
  if (params.search) {
    orFields.push({ field: 'namaSiswa', value: params.search })
    orFields.push({ field: 'nisn', value: params.search })
    orFields.push({ field: 'namaSekolah', value: params.search })
  }

  if (orFields.length > 0) {
    const baseFilters: Record<string, unknown> = {}
    if (params.statusUsia) baseFilters.statusUsia = params.statusUsia
    if (params.npsn) baseFilters.npsn = params.npsn
    if (params.schoolId) baseFilters.schoolId = params.schoolId

    const result = await queryWithOr(col, orFields, baseFilters, ['schoolId', 'noUrut', 'createdAt'], 1, 10000)
    return result.data
  }

  if (params.statusUsia) query = query.where('statusUsia', '==', params.statusUsia)
  if (params.npsn) query = query.where('npsn', '==', params.npsn)
  if (params.schoolId) query = query.where('schoolId', '==', params.schoolId)

  const snapshot = await query.get()
  return snapshot.docs.map(d => sanitize(d)!)
}

// ==================== KUOTA SEKOLAH ====================

export async function dbFindKuota(where: { id?: string; schoolId?: string }): Promise<Record<string, any> | null> {
  const col = kuotaCollection()
  let doc: DocumentSnapshot | null = null

  if (where.id) {
    doc = await col.doc(where.id).get()
  } else if (where.schoolId) {
    const snapshot = await col.where('schoolId', '==', where.schoolId).limit(1).get()
    if (!snapshot.empty) doc = snapshot.docs[0]
  }

  return doc && doc.exists ? sanitize(doc) : null
}

export async function dbUpsertKuota(schoolId: string, data: Record<string, any>): Promise<Record<string, any>> {
  const existing = await dbFindKuota({ schoolId })
  if (existing) {
    return dbUpdateKuota(existing.id, data)
  } else {
    return dbCreateKuota(data)
  }
}

export async function dbCreateKuota(data: Record<string, any>): Promise<Record<string, any>> {
  const col = kuotaCollection()
  const now = new Date()
  const docRef = await col.add({ ...data, createdAt: now, updatedAt: now })
  const doc = await docRef.get()
  return sanitize(doc)!
}

export async function dbUpdateKuota(id: string, data: Record<string, any>): Promise<Record<string, any>> {
  await kuotaCollection().doc(id).update({ ...data, updatedAt: new Date() })
  const doc = await kuotaCollection().doc(id).get()
  return sanitize(doc)!
}

export async function dbDeleteKuota(id: string): Promise<void> {
  await kuotaCollection().doc(id).delete()
}

export async function dbListAllKuota(schoolId?: string): Promise<Record<string, any>[]> {
  const col = kuotaCollection()
  let query: Query = col.orderBy('namaSekolah')
  if (schoolId) query = query.where('schoolId', '==', schoolId)
  const snapshot = await query.get()
  return snapshot.docs.map(d => sanitize(d)!)
}

// ==================== SETTINGS ====================

const SETTINGS_DOC_ID = 'system_settings'

export async function dbGetSettings(): Promise<Record<string, any>> {
  const doc = await settingsCollection().doc(SETTINGS_DOC_ID).get()
  if (doc.exists) {
    return sanitize(doc)!
  }
  // Return defaults if no settings exist
  return {
    id: SETTINGS_DOC_ID,
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    batasTanggal: 10,
    persentaseMinimum: 75,
    autoReminder: true,
    reminderDaysBefore: 3,
  }
}

export async function dbSaveSettings(data: Record<string, any>): Promise<Record<string, any>> {
  await settingsCollection().doc(SETTINGS_DOC_ID).set({
    ...data,
    updatedAt: new Date(),
  }, { merge: true })
  const doc = await settingsCollection().doc(SETTINGS_DOC_ID).get()
  return sanitize(doc)!
}
