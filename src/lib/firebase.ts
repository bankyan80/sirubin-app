import { initializeApp, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

let app: App
let db: Firestore

export function getFirebaseApp(): App {
  if (!app) {
    let initialized = false
    const paths = [resolve(process.cwd(), 'serviceAccountKey.json')]
    for (const p of paths) {
      if (existsSync(p)) {
        const raw = readFileSync(p, 'utf-8')
        app = initializeApp({ credential: cert(JSON.parse(raw.trim())) })
        console.log('[Firebase] OK using:', p)
        initialized = true
        break
      }
    }
    if (!initialized) {
      const envVal = process.env.FIREBASE_SERVICE_ACCOUNT
      if (envVal) {
        app = initializeApp({ credential: cert(JSON.parse(envVal)) })
        console.log('[Firebase] OK using env var')
        initialized = true
      }
    }
    if (!initialized) {
      throw new Error('[Firebase] serviceAccountKey.json tidak ditemukan!')
    }
  }
  return app
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp())
  return db
}
