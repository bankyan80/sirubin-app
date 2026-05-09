import { getFirebaseApp } from '@/lib/firebase'
import { getFirestore, collection, getDocs, writeBatch, doc, setDoc, deleteDocs } from 'firebase-admin/firestore'
import bcrypt from 'bcryptjs'

/**
 * Firebase Seed Script
 * Run: bun run src/lib/seed-firebase.ts
 * 
 * Initializes Firebase with:
 * - 1 admin user (admin / admin456)
 * - 21 school users (username=NPSN, password=nisn.la)
 * - 21 schools
 */

const SCHOOLS = [
  { npsn: '10100001', nama: 'TK Pertiwi', jenjang: 'TK', alamat: 'Jl. Merdeka No. 1', kecamatan: 'Kec. Makmur', desa: 'Desa Mekar', kepalaSekolah: 'Siti Aminah', status: 'Aktif', noHp: '081234567890' },
  { npsn: '10100002', nama: 'TK Melati', jenjang: 'TK', alamat: 'Jl. Kenanga No. 5', kecamatan: 'Kec. Makmur', desa: 'Desa Mekar', kepalaSekolah: 'Rina Wati', status: 'Aktif', noHp: '081234567891' },
  { npsn: '10100003', nama: 'TK Mawar', jenjang: 'TK', alamat: 'Jl. Dahlia No. 10', kecamatan: 'Kec. Sejahtera', desa: 'Desa Jaya', kepalaSekolah: 'Dewi Lestari', status: 'Aktif', noHp: '081234567892' },
  { npsn: '10100004', nama: 'TK Cendana', jenjang: 'TK', alamat: 'Jl. Anggrek No. 3', kecamatan: 'Kec. Sejahtera', desa: 'Desa Jaya', kepalaSekolah: 'Ani Sulistyowati', status: 'Aktif', noHp: '081234567893' },
  { npsn: '10100005', nama: 'TK Flamboyan', jenjang: 'TK', alamat: 'Jl. Teratai No. 8', kecamatan: 'Kec. Harapan', desa: 'Desa Baru', kepalaSekolah: 'Bambang Supriadi', status: 'Aktif', noHp: '081234567894' },
  { npsn: '10100006', nama: 'PAUD Ceria', jenjang: 'PAUD', alamat: 'Jl. Mawar No. 2', kecamatan: 'Kec. Makmur', desa: 'Desa Mekar', kepalaSekolah: 'Eka Putri', status: 'Aktif', noHp: '081234567895' },
  { npsn: '10100007', nama: 'PAUD Pelangi', jenjang: 'PAUD', alamat: 'Jl. Melati No. 7', kecamatan: 'Kec. Makmur', desa: 'Desa Mekar', kepalaSekolah: 'Fitri Handayani', status: 'Aktif', noHp: '081234567896' },
  { npsn: '10100008', nama: 'PAUD Kuncup Mas', jenjang: 'PAUD', alamat: 'Jl. Cempaka No. 4', kecamatan: 'Kec. Sejahtera', desa: 'Desa Jaya', kepalaSekolah: 'Gunawan Wibowo', status: 'Aktif', noHp: '081234567897' },
  { npsn: '10100009', nama: 'PAUD Tunas Harapan', jenjang: 'PAUD', alamat: 'Jl. Bougenville No. 9', kecamatan: 'Kec. Sejahtera', desa: 'Desa Jaya', kepalaSekolah: 'Hani Pratiwi', status: 'Aktif', noHp: '081234567898' },
  { npsn: '10100010', nama: 'PAUD Bintang Kecil', jenjang: 'PAUD', alamat: 'Jl. Tulip No. 6', kecamatan: 'Kec. Harapan', desa: 'Desa Baru', kepalaSekolah: 'Indra Kusuma', status: 'Aktif', noHp: '081234567899' },
  { npsn: '10100011', nama: 'PAUD Cahaya Ilmu', jenjang: 'PAUD', alamat: 'Jl. Kenanga No. 12', kecamatan: 'Kec. Harapan', desa: 'Desa Baru', kepalaSekolah: 'Joko Prasetyo', status: 'Aktif', noHp: '081234560001' },
  { npsn: '10100012', nama: 'PAUD Permata Hati', jenjang: 'PAUD', alamat: 'Jl. Mawar No. 15', kecamatan: 'Kec. Harapan', desa: 'Desa Baru', kepalaSekolah: 'Kartika Sari', status: 'Aktif', noHp: '081234560002' },
  { npsn: '10100013', nama: 'SDN 1 Makmur', jenjang: 'SD', alamat: 'Jl. Sudirman No. 1', kecamatan: 'Kec. Makmur', desa: 'Desa Mekar', kepalaSekolah: 'Ahmad Fauzi', status: 'Aktif', noHp: '081234560003' },
  { npsn: '10100014', nama: 'SDN 2 Makmur', jenjang: 'SD', alamat: 'Jl. Diponegoro No. 5', kecamatan: 'Kec. Makmur', desa: 'Desa Mekar', kepalaSekolah: 'Badrun Mustofa', status: 'Aktif', noHp: '081234560004' },
  { npsn: '10100015', nama: 'SDN 3 Makmur', jenjang: 'SD', alamat: 'Jl. Gatot Subroto No. 10', kecamatan: 'Kec. Makmur', desa: 'Desa Mekar', kepalaSekolah: 'Cahyo Wicaksono', status: 'Aktif', noHp: '081234560005' },
  { npsn: '10100016', nama: 'SDN 1 Sejahtera', jenjang: 'SD', alamat: 'Jl. Ahmad Yani No. 3', kecamatan: 'Kec. Sejahtera', desa: 'Desa Jaya', kepalaSekolah: 'Dwi Ratnasari', status: 'Aktif', noHp: '081234560006' },
  { npsn: '10100017', nama: 'SDN 2 Sejahtera', jenjang: 'SD', alamat: 'Jl. Kartini No. 8', kecamatan: 'Kec. Sejahtera', desa: 'Desa Jaya', kepalaSekolah: 'Eko Prasetya', status: 'Aktif', noHp: '081234560007' },
  { npsn: '10100018', nama: 'SDN 1 Harapan', jenjang: 'SD', alamat: 'Jl. Pahlawan No. 2', kecamatan: 'Kec. Harapan', desa: 'Desa Baru', kepalaSekolah: 'Faridah Nurhayati', status: 'Aktif', noHp: '081234560008' },
  { npsn: '10100019', nama: 'SDN 2 Harapan', jenjang: 'SD', alamat: 'Jl. Pendidikan No. 6', kecamatan: 'Kec. Harapan', desa: 'Desa Baru', kepalaSekolah: 'Gilang Ramadhan', status: 'Aktif', noHp: '081234560009' },
  { npsn: '10100020', nama: 'SDN 3 Harapan', jenjang: 'SD', alamat: 'Jl. Perjuangan No. 11', kecamatan: 'Kec. Harapan', desa: 'Desa Baru', kepalaSekolah: 'Hendra Setiawan', status: 'Aktif', noHp: '081234560010' },
  { npsn: '10100021', nama: 'SDN 4 Harapan', jenjang: 'SD', alamat: 'Jl. Kemerdekaan No. 14', kecamatan: 'Kec. Harapan', desa: 'Desa Baru', kepalaSekolah: 'Ika Maulidya', status: 'Aktif', noHp: '081234560011' },
]

async function seed() {
  console.log('🔥 Initializing Firebase...')
  getFirebaseApp()
  const db = getFirestore()

  console.log('🗑️  Clearing existing collections...')

  // Clear all collections
  for (const colName of ['users', 'schools', 'laporan', 'pendaftar', 'kuotaSekolah', 'settings']) {
    const snapshot = await db.collection(colName).get()
    const batch = db.batch()
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref)
    }
    if (!snapshot.empty) await batch.commit()
    console.log(`  Cleared: ${colName} (${snapshot.size} docs)`)
  }

  console.log('📦 Seeding data...')

  // 1. Create admin user
  const adminPassword = await bcrypt.hash('admin456', 10)
  await db.collection('users').add({
    username: 'admin',
    password: adminPassword,
    role: 'ADMIN',
    name: 'Administrator SIRUBIN',
    jenjang: null,
    npsn: null,
    mustChangePassword: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  console.log('  ✅ Admin user created (admin / admin456)')

  // 2. Create schools and school users
  const schoolPassword = await bcrypt.hash('nisn.la', 10)
  let userCount = 0

  for (const school of SCHOOLS) {
    // Create school
    await db.collection('schools').add({
      ...school,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create school user
    await db.collection('users').add({
      username: school.npsn,
      password: schoolPassword,
      role: 'SEKOLAH',
      name: school.kepalaSekolah,
      jenjang: school.jenjang,
      npsn: school.npsn,
      mustChangePassword: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    userCount++
  }

  console.log(`  ✅ ${SCHOOLS.length} schools created`)
  console.log(`  ✅ ${userCount} school users created (NPSN / nisn.la)`)

  // 3. Save default settings
  await db.collection('settings').doc('system_settings').set({
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    batasTanggal: 10,
    persentaseMinimum: 75,
    autoReminder: true,
    reminderDaysBefore: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  console.log('  ✅ System settings created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('📊 Summary:')
  console.log(`   - 1 Admin user`)
  console.log(`   - ${SCHOOLS.length} Schools`)
  console.log(`   - ${userCount} School users`)
  console.log('   - System settings')
}

seed().catch(console.error)
