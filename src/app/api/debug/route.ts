import { NextResponse } from 'next/server'
import { getFirebaseApp, getFirebaseDb } from '@/lib/firebase'

export async function GET() {
  const results: Record<string, unknown> = {}

  const envVal = process.env.FIREBASE_SERVICE_ACCOUNT
  results.hasEnv = !!envVal
  results.envLength = envVal ? envVal.length : 0
  results.envStart = envVal ? envVal.substring(0, 60) : null

  if (envVal) {
    try {
      const parsed = JSON.parse(envVal)
      results.parseOk = true
      results.projectId = parsed.project_id
    } catch (e) {
      results.parseOk = false
      results.parseError = e instanceof Error ? e.message : 'unknown'
    }
  }

  try {
    const app = getFirebaseApp()
    results.appOk = !!app
    const db = getFirebaseDb()
    const test = await db.collection('users').limit(1).get()
    results.firestoreOk = true
    results.docsCount = test.size
  } catch (e) {
    results.initError = e instanceof Error ? e.message : 'unknown error'
  }

  return NextResponse.json(results)
}
