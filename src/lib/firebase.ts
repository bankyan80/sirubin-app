import { initializeApp, cert, getApps, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let app: App
let db: Firestore

function loadServiceAccount(): Record<string, unknown> | null {
  const envVal = process.env.FIREBASE_SERVICE_ACCOUNT
  if (envVal) {
    try {
      return JSON.parse(envVal)
    } catch {
      console.error('[Firebase] Gagal parse FIREBASE_SERVICE_ACCOUNT env var')
      return null
    }
  }
  return null
}

export function getFirebaseApp(): App {
  if (!app) {
    const existingApps = getApps()
    if (existingApps.length > 0) {
      app = existingApps[0]
      return app
    }

    const sa = loadServiceAccount()
    if (sa) {
      app = initializeApp({ credential: cert(sa) })
      console.log('[Firebase] OK using env var')
      return app
    }

    throw new Error('[Firebase] FIREBASE_SERVICE_ACCOUNT tidak ditemukan! Set di environment variables.')
  }
  return app
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp())
  return db
}
