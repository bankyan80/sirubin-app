'use client'

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

let app: FirebaseApp | undefined
let auth: Auth | undefined
let provider: GoogleAuthProvider | undefined

export function getFirebaseClientApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }
  return app
}

export function getFirebaseClientAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseClientApp())
  }
  return auth
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!provider) {
    provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
  }
  return provider
}
