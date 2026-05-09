import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding database...')

  // Clean existing users
  await db.user.deleteMany()

  // Admin user
  const adminPassword = await bcrypt.hash('admin456', 10)
  await db.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      name: 'Administrator',
      mustChangePassword: false,
    },
  })

  // School users with NPSN as username
  const schools = [
    // TK
    { npsn: '20101234', name: 'TK Al-Ikhlas', jenjang: 'TK' },
    { npsn: '20101235', name: 'TK Pelangi Ceria', jenjang: 'TK' },
    { npsn: '20101236', name: 'TK Cahaya Harapan', jenjang: 'TK' },
    { npsn: '20101237', name: 'TK Melati Putih', jenjang: 'TK' },
    { npsn: '20101238', name: 'TK Bintang Kecil', jenjang: 'TK' },
    { npsn: '20101239', name: 'TK Matahari Terbit', jenjang: 'TK' },
    { npsn: '20101240', name: 'TK Tunas Bangsa', jenjang: 'TK' },
    // PAUD
    { npsn: '30101234', name: 'PAUD Kasih Ibu', jenjang: 'PAUD' },
    { npsn: '30101235', name: 'PAUD Permata Hati', jenjang: 'PAUD' },
    { npsn: '30101236', name: 'PAUD Kuncup Melati', jenjang: 'PAUD' },
    { npsn: '30101237', name: 'PAUD Cempaka Putih', jenjang: 'PAUD' },
    { npsn: '30101238', name: 'PAUD Harapan Bangsa', jenjang: 'PAUD' },
    { npsn: '30101239', name: 'PAUD Pelangi Indah', jenjang: 'PAUD' },
    // SD
    { npsn: '40101234', name: 'SDN 1 Sukamaju', jenjang: 'SD' },
    { npsn: '40101235', name: 'SDN 2 Harapan Jaya', jenjang: 'SD' },
    { npsn: '40101236', name: 'SDN 3 Mekar Sari', jenjang: 'SD' },
    { npsn: '40101237', name: 'SDN 4 Cendekia', jenjang: 'SD' },
    { npsn: '40101238', name: 'SDN 5 Bina Ilmu', jenjang: 'SD' },
    { npsn: '40101239', name: 'SDN 6 Tunas Harapan', jenjang: 'SD' },
    { npsn: '40101240', name: 'SDN 7 Pelita Bangsa', jenjang: 'SD' },
    { npsn: '40101241', name: 'SDN 8 Sumber Ilmu', jenjang: 'SD' },
    { npsn: '40101242', name: 'SDN 9 Karya Ilmu', jenjang: 'SD' },
  ]

  const defaultPassword = await bcrypt.hash('nisn.la', 10)

  for (const school of schools) {
    await db.user.create({
      data: {
        username: school.npsn,
        password: defaultPassword,
        role: 'SEKOLAH',
        name: school.name,
        jenjang: school.jenjang,
        npsn: school.npsn,
        mustChangePassword: true,
      },
    })
  }

  console.log('Database seeded successfully!')
  console.log(`- 1 Admin user created`)
  console.log(`- ${schools.length} School users created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
