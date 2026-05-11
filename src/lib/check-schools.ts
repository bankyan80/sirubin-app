import { getFirebaseApp } from '@/lib/firebase'
import { getFirestore } from 'firebase-admin/firestore'

async function run() {
  getFirebaseApp()
  const db = getFirestore()
  const snap = await db.collection('schools').get()
  console.log(`Total: ${snap.size} schools\n`)
  snap.docs.forEach(d => {
    const data = d.data()
    console.log(`${data.nama} | npsn:${data.npsn} | jenjang:${data.jenjang} | status:${data.status}`)
  })
  process.exit(0)
}
run().catch(e => { console.error(e); process.exit(1) })
