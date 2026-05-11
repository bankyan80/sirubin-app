import { getFirebaseApp } from '@/lib/firebase'
import { getFirestore } from 'firebase-admin/firestore'

async function run() {
  getFirebaseApp()
  const db = getFirestore()
  
  // Simulate what dbListSchools does
  try {
    const snap = await db.collection('schools')
      .orderBy('jenjang')
      .orderBy('nama')
      .limit(50)
      .get()
    console.log(`orderBy jenjang+nama: ${snap.size} results`)
    snap.docs.slice(0,3).forEach(d => console.log(' -', d.data().nama))
  } catch (e) {
    console.error('orderBy error:', e)
  }

  // Try without orderBy
  try {
    const snap2 = await db.collection('schools').limit(50).get()
    console.log(`\nno orderBy: ${snap2.size} results`)
  } catch (e) {
    console.error('no orderBy error:', e)
  }

  process.exit(0)
}
run().catch(e => { console.error(e); process.exit(1) })
