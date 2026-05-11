import { getFirebaseApp } from '@/lib/firebase'
import { dbListSchools } from '@/lib/firestore-db'

async function run() {
  getFirebaseApp()
  const result = await dbListSchools({ page: 1, limit: 50 })
  console.log(`dbListSchools: ${result.total} total, ${result.data.length} returned`)
  result.data.slice(0, 5).forEach((s: any) => console.log(' -', s.nama, '|', s.jenjang))
  process.exit(0)
}
run().catch(e => { console.error(e); process.exit(1) })
