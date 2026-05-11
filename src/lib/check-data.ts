import { getFirebaseApp } from '@/lib/firebase'
import { getFirestore } from 'firebase-admin/firestore'

async function check() {
  getFirebaseApp()
  const db = getFirestore()
  const cols = ['users', 'schools', 'laporan', 'pendaftar', 'kuotaSekolah', 'settings']
  for (const c of cols) {
    const snap = await db.collection(c).get()
    console.log(`\n${c}: ${snap.size} docs`)
    if (c === 'schools') snap.docs.slice(0, 5).forEach(d => console.log('  -', d.data().nama, '|', d.data().npsn))
    if (c === 'laporan') snap.docs.slice(0, 3).forEach(d => console.log('  -', d.data().namaSekolah, '| bulan', d.data().bulan, d.data().tahun))
    if (c === 'pendaftar') snap.docs.slice(0, 3).forEach(d => console.log('  -', d.data().namaSiswa, '|', d.data().namaSekolah))
    if (c === 'kuotaSekolah') snap.docs.slice(0, 3).forEach(d => console.log('  -', d.data().namaSekolah, '| kuota', d.data().kuota))
    if (c === 'users') snap.docs.filter(d => d.data().role === 'SEKOLAH').slice(0, 3).forEach(d => console.log('  -', d.data().name, '|', d.data().username))
  }
  process.exit(0)
}
check().catch(e => { console.error(e); process.exit(1) })
