import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import * as path from 'path'
import * as fs from 'fs'

let app: App
let db: Firestore

export function getFirebaseApp(): App {
  if (!app) {
    // Method 1: File JSON (local development - easiest)
    const jsonPath = path.resolve(process.cwd(), 'serviceAccountKey.json')
    if (fs.existsSync(jsonPath)) {
      const serviceAccount = require(jsonPath)
      app = initializeApp({
        credential: cert(serviceAccount),
      })
      console.log('[Firebase] Initialized using serviceAccountKey.json')
    }
    // Method 2: Environment variable (Vercel / production)
    else {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      if (serviceAccount) {
        const credentials = typeof serviceAccount === 'string'
          ? JSON.parse(serviceAccount)
          : serviceAccount
        app = initializeApp({
          credential: cert(credentials),
        })
        console.log('[Firebase] Initialized using FIREBASE_SERVICE_ACCOUNT env')
      } else {
        throw new Error(
          '[Firebase] Tidak dapat menginisialisasi Firebase.\n' +
          'Pilih salah satu:\n' +
          '1. Taruh file serviceAccountKey.json di root folder project\n' +
          '2. Set FIREBASE_SERVICE_ACCOUNT di file .env'
        )
      }
    }
  }
  return app
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp())
  }
  return db
}