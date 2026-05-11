import { getFirebaseApp } from '@/lib/firebase'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Replace dummy school users with real data
 * Run: npm run seed
 *
 * - Hapus semua user dengan role SEKOLAH
 * - Buat ulang dengan data nyata (email = npsn@sekolah.sirubin, login via Google)
 * - Admin tidak disentuh
 */

const USERS: { name: string; npsn: string; jenjang: string }[] = [
  { name: 'SD NEGERI 1 ASEM', npsn: '20215216', jenjang: 'SD' },
  { name: 'SD NEGERI 1 BELAWA', npsn: '20215230', jenjang: 'SD' },
  { name: 'SD NEGERI 1 CIPEUJEUH KULON', npsn: '20215287', jenjang: 'SD' },
  { name: 'SD NEGERI 1 CIPEUJEUH WETAN', npsn: '20215286', jenjang: 'SD' },
  { name: 'SD NEGERI 1 LEMAHABANG', npsn: '20215162', jenjang: 'SD' },
  { name: 'SD NEGERI 1 LEMAHABANG KULON', npsn: '20215161', jenjang: 'SD' },
  { name: 'SD NEGERI 1 LEUWIDINGDING', npsn: '20215164', jenjang: 'SD' },
  { name: 'SD NEGERI 1 PICUNGPUGUR', npsn: '20246442', jenjang: 'SD' },
  { name: 'SD NEGERI 1 SARAJAYA', npsn: '20215517', jenjang: 'SD' },
  { name: 'SD NEGERI 1 SIGONG', npsn: '20215506', jenjang: 'SD' },
  { name: 'SD NEGERI 1 SINDANGLAUT', npsn: '20215464', jenjang: 'SD' },
  { name: 'SD NEGERI 1 TUK KARANGSUWUNG', npsn: '20246445', jenjang: 'SD' },
  { name: 'SD NEGERI 1 WANGKELANG', npsn: '20215584', jenjang: 'SD' },
  { name: 'SD NEGERI 2 BELAWA', npsn: '20215564', jenjang: 'SD' },
  { name: 'SD NEGERI 2 CIPEUJEUH KULON', npsn: '20215381', jenjang: 'SD' },
  { name: 'SD NEGERI 2 CIPEUJEUH WETAN', npsn: '20215380', jenjang: 'SD' },
  { name: 'SD NEGERI 2 LEMAHABANG', npsn: '20214656', jenjang: 'SD' },
  { name: 'SD NEGERI 2 SARAJAYA', npsn: '20214726', jenjang: 'SD' },
  { name: 'SD NEGERI 3 CIPEUJEUH WETAN', npsn: '20214479', jenjang: 'SD' },
  { name: 'SD NEGERI 3 SIGONG', npsn: '20214570', jenjang: 'SD' },
  { name: 'SD NEGERI 4 SIGONG', npsn: '20244513', jenjang: 'SD' },
  { name: 'SD IT AL IRSYAD AL ISLAMIYYAH', npsn: '20215221', jenjang: 'SD' },
  { name: 'TK NEGERI LEMAHABANG', npsn: '20270605', jenjang: 'TK' },
  { name: 'TK AISYIYAH LEMAHABANG', npsn: '20254372', jenjang: 'TK' },
  { name: 'TK AL-AQSO', npsn: '20254376', jenjang: 'TK' },
  { name: 'TK AL-IRSYAD AL-ISLAMIYYAH', npsn: '20254373', jenjang: 'TK' },
  { name: 'TK BPP KENANGA', npsn: '20254374', jenjang: 'TK' },
  { name: 'TK GELATIK', npsn: '20254370', jenjang: 'TK' },
  { name: 'TK MELATI', npsn: '20254378', jenjang: 'TK' },
  { name: 'TK MUSLIMAT NU', npsn: '20254375', jenjang: 'TK' },
  { name: 'KB A.H. PLUS', npsn: '70039880', jenjang: 'KB' },
  { name: 'KB AMALIA SALSABILA', npsn: '69804039', jenjang: 'KB' },
  { name: 'KB AZ-ZAHRA', npsn: '69804068', jenjang: 'KB' },
  { name: 'KB MUTIARA', npsn: '70044538', jenjang: 'KB' },
  { name: 'KB PALAPA', npsn: '69870486', jenjang: 'KB' },
  { name: 'KB PERMATA BUNDA', npsn: '70024652', jenjang: 'KB' },
  { name: 'PAUD AL HAMBRA', npsn: '69947715', jenjang: 'PAUD' },
  { name: 'PAUD AL-HIDAYAH', npsn: '69870488', jenjang: 'PAUD' },
  { name: 'PAUD AL-HUSNA', npsn: '69870479', jenjang: 'PAUD' },
  { name: 'PAUD AMANAH', npsn: '69870482', jenjang: 'PAUD' },
  { name: 'PAUD AN NAIM', npsn: '69870484', jenjang: 'PAUD' },
  { name: 'PAUD ASY-SYAFIIYAH', npsn: '69870485', jenjang: 'PAUD' },
  { name: 'PAUD BUDGENVIL', npsn: '69870489', jenjang: 'PAUD' },
  { name: 'PAUD TUNAS HARAPAN', npsn: '69870490', jenjang: 'PAUD' },
  { name: 'PAUD SPS MELATI', npsn: '69804044', jenjang: 'PAUD' },
]

async function seedUsers() {
  console.log('Initializing Firebase...')
  getFirebaseApp()
  const db = getFirestore()

  // 1. Hapus semua user SEKOLAH
  console.log('Menghapus semua user SEKOLAH lama...')
  const snapshot = await db.collection('users').where('role', '==', 'SEKOLAH').get()
  if (!snapshot.empty) {
    const batch = db.batch()
    for (const d of snapshot.docs) batch.delete(d.ref)
    await batch.commit()
    console.log(`  Dihapus: ${snapshot.size} user SEKOLAH`)
  } else {
    console.log('  Tidak ada user SEKOLAH lama')
  }

  // 2. Buat user baru
  console.log('Membuat user baru...')
  const now = new Date()

  for (const u of USERS) {
    const email = `${u.npsn}@sekolah.sirubin`
    await db.collection('users').add({
      email,
      username: u.npsn,
      role: 'SEKOLAH',
      name: u.name,
      jenjang: u.jenjang,
      npsn: u.npsn,
      createdAt: now,
      updatedAt: now,
    })
    console.log(`  ${u.name} (${email})`)
  }

  console.log(`\nSelesai! ${USERS.length} user berhasil dibuat.`)
  console.log('   Login menggunakan Google dengan email terdaftar.')
  process.exit(0)
}

seedUsers().catch((e) => { console.error(e); process.exit(1) })
