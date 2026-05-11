import { getFirebaseApp } from '@/lib/firebase'
import { getFirestore } from 'firebase-admin/firestore'

async function cleanup() {
  getFirebaseApp()
  const db = getFirestore()

  // Hapus semua schools (dummy)
  const schools = await db.collection('schools').get()
  if (!schools.empty) {
    const batch = db.batch()
    schools.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    console.log(`✅ Dihapus ${schools.size} schools dummy`)
  }

  // Hapus semua laporan (dummy)
  const laporan = await db.collection('laporan').get()
  if (!laporan.empty) {
    const batch = db.batch()
    laporan.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    console.log(`✅ Dihapus ${laporan.size} laporan dummy`)
  }

  // Hapus semua pendaftar (jaga-jaga)
  const pendaftar = await db.collection('pendaftar').get()
  if (!pendaftar.empty) {
    const batch = db.batch()
    pendaftar.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    console.log(`✅ Dihapus ${pendaftar.size} pendaftar dummy`)
  }

  // Hapus semua kuotaSekolah (jaga-jaga)
  const kuota = await db.collection('kuotaSekolah').get()
  if (!kuota.empty) {
    const batch = db.batch()
    kuota.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    console.log(`✅ Dihapus ${kuota.size} kuotaSekolah dummy`)
  }

  console.log('\n🎉 Cleanup selesai. Semua data dummy telah dihapus.')
  process.exit(0)
}
cleanup().catch(e => { console.error(e); process.exit(1) })
