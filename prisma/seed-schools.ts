import { db } from '@/lib/db'

async function main() {
  console.log('Seeding School data...')

  await db.school.deleteMany()

  const schools = [
    // TK
    { npsn: '20101234', nama: 'TK Al-Ikhlas', jenjang: 'TK', alamat: 'Jl. Pendidikan No. 1', kecamatan: 'Sukamaju', desa: 'Margahayu', kepalaSekolah: 'Hj. Siti Aminah, S.Pd', status: 'Aktif', noHp: '081234567890', email: 'tk.alikhlas@gmail.com', tahunBerdiri: '2005', akreditasi: 'A' },
    { npsn: '20101235', nama: 'TK Pelangi Ceria', jenjang: 'TK', alamat: 'Jl. Pelangi No. 5', kecamatan: 'Sukamaju', desa: 'Harapan Jaya', kepalaSekolah: 'Ibu Rina Wati, S.Pd', status: 'Aktif', noHp: '081234567891', email: 'tk.pelangiceria@gmail.com', tahunBerdiri: '2008', akreditasi: 'B' },
    { npsn: '20101236', nama: 'TK Cahaya Harapan', jenjang: 'TK', alamat: 'Jl. Harapan No. 12', kecamatan: 'Cikaret', desa: 'Cikaret', kepalaSekolah: 'Ibu Dewi Safitri, A.Ma', status: 'Aktif', noHp: '081234567892', email: 'tk.cahayaharapan@gmail.com', tahunBerdiri: '2010', akreditasi: 'A' },
    { npsn: '20101237', nama: 'TK Melati Putih', jenjang: 'TK', alamat: 'Jl. Melati No. 8', kecamatan: 'Cikaret', desa: 'Lebakgede', kepalaSekolah: 'Ibu Nurjanah, S.Pd', status: 'Aktif', noHp: '081234567893', email: 'tk.melatiputih@gmail.com', tahunBerdiri: '2007', akreditasi: 'B' },
    { npsn: '20101238', nama: 'TK Bintang Kecil', jenjang: 'TK', alamat: 'Jl. Bintang No. 3', kecamatan: 'Tanah Sareal', desa: 'Kebon Jeruk', kepalaSekolah: 'Ibu Yanti Sulistyowati, S.Pd', status: 'Aktif', noHp: '081234567894', email: 'tk.bintangkecil@gmail.com', tahunBerdiri: '2012', akreditasi: 'B' },
    { npsn: '20101239', nama: 'TK Matahari Terbit', jenjang: 'TK', alamat: 'Jl. Mentari No. 15', kecamatan: 'Tanah Sareal', desa: 'Sukaresmi', kepalaSekolah: 'Ibu Eti Sumiati, A.Ma', status: 'Nonaktif', noHp: '081234567895', email: 'tk.matahariterbit@gmail.com', tahunBerdiri: '2009', akreditasi: 'C' },
    { npsn: '20101240', nama: 'TK Tunas Bangsa', jenjang: 'TK', alamat: 'Jl. Tunas No. 7', kecamatan: 'Cibabat', desa: 'Cibabat', kepalaSekolah: 'Ibu Sri Mulyani, S.Pd', status: 'Aktif', noHp: '081234567896', email: 'tk.tunasbangsa@gmail.com', tahunBerdiri: '2015', akreditasi: 'A' },
    // PAUD
    { npsn: '30101234', nama: 'PAUD Kasih Ibu', jenjang: 'PAUD', alamat: 'Jl. Kasih No. 2', kecamatan: 'Sukamaju', desa: 'Sukamaju', kepalaSekolah: 'Ibu Ratna Dewi, S.Pd', status: 'Aktif', noHp: '082234567890', email: 'paud.kasihibu@gmail.com', tahunBerdiri: '2006', akreditasi: 'A' },
    { npsn: '30101235', nama: 'PAUD Permata Hati', jenjang: 'PAUD', alamat: 'Jl. Permata No. 10', kecamatan: 'Sukamaju', desa: 'Margahayu', kepalaSekolah: 'Ibu Lina Marlina, A.Ma', status: 'Aktif', noHp: '082234567891', email: 'paud.permatahati@gmail.com', tahunBerdiri: '2011', akreditasi: 'B' },
    { npsn: '30101236', nama: 'PAUD Kuncup Melati', jenjang: 'PAUD', alamat: 'Jl. Melati Raya No. 4', kecamatan: 'Cikaret', desa: 'Cikaret', kepalaSekolah: 'Ibu Winda Permatasari, S.Pd', status: 'Aktif', noHp: '082234567892', email: 'paud.kuncupmelati@gmail.com', tahunBerdiri: '2013', akreditasi: 'A' },
    { npsn: '30101237', nama: 'PAUD Cempaka Putih', jenjang: 'PAUD', alamat: 'Jl. Cempaka No. 6', kecamatan: 'Cikaret', desa: 'Lebakgede', kepalaSekolah: 'Ibu Ana Rohana, S.Pd', status: 'Aktif', noHp: '082234567893', email: 'paud.cempakaputih@gmail.com', tahunBerdiri: '2009', akreditasi: 'B' },
    { npsn: '30101238', nama: 'PAUD Harapan Bangsa', jenjang: 'PAUD', alamat: 'Jl. Harapan Bangsa No. 9', kecamatan: 'Tanah Sareal', desa: 'Kebon Jeruk', kepalaSekolah: 'Ibu Tuti Alawiyah, A.Ma', status: 'Aktif', noHp: '082234567894', email: 'paud.harapanbangsa@gmail.com', tahunBerdiri: '2014', akreditasi: 'B' },
    { npsn: '30101239', nama: 'PAUD Pelangi Indah', jenjang: 'PAUD', alamat: 'Jl. Pelangi Indah No. 1', kecamatan: 'Tanah Sareal', desa: 'Sukaresmi', kepalaSekolah: 'Ibu Rina Agustina, S.Pd', status: 'Nonaktif', noHp: '082234567895', email: 'paud.pelangiindah@gmail.com', tahunBerdiri: '2016', akreditasi: 'C' },
    // SD
    { npsn: '40101234', nama: 'SDN 1 Sukamaju', jenjang: 'SD', alamat: 'Jl. Pahlawan No. 1', kecamatan: 'Sukamaju', desa: 'Sukamaju', kepalaSekolah: 'Drs. Ahmad Sudrajat, M.Pd', status: 'Aktif', noHp: '083234567890', email: 'sdn1.sukamaju@gmail.com', tahunBerdiri: '1980', akreditasi: 'A' },
    { npsn: '40101235', nama: 'SDN 2 Harapan Jaya', jenjang: 'SD', alamat: 'Jl. Harapan No. 20', kecamatan: 'Sukamaju', desa: 'Harapan Jaya', kepalaSekolah: 'H. Dedi Supriatna, S.Pd, M.M', status: 'Aktif', noHp: '083234567891', email: 'sdn2.harapanjaya@gmail.com', tahunBerdiri: '1985', akreditasi: 'A' },
    { npsn: '40101236', nama: 'SDN 3 Mekar Sari', jenjang: 'SD', alamat: 'Jl. Mekar No. 14', kecamatan: 'Sukamaju', desa: 'Margahayu', kepalaSekolah: 'Ibu Sri Wahyuni, S.Pd, M.Pd', status: 'Aktif', noHp: '083234567892', email: 'sdn3.mekarsari@gmail.com', tahunBerdiri: '1990', akreditasi: 'A' },
    { npsn: '40101237', nama: 'SDN 4 Cendekia', jenjang: 'SD', alamat: 'Jl. Cendekia No. 8', kecamatan: 'Cikaret', desa: 'Cikaret', kepalaSekolah: 'Drs. Ujang Saepudin, M.Pd', status: 'Aktif', noHp: '083234567893', email: 'sdn4.cendekia@gmail.com', tahunBerdiri: '1992', akreditasi: 'A' },
    { npsn: '40101238', nama: 'SDN 5 Bina Ilmu', jenjang: 'SD', alamat: 'Jl. Ilmu No. 5', kecamatan: 'Cikaret', desa: 'Lebakgede', kepalaSekolah: 'H. Kusnadi, S.Pd', status: 'Aktif', noHp: '083234567894', email: 'sdn5.binailmu@gmail.com', tahunBerdiri: '1995', akreditasi: 'B' },
    { npsn: '40101239', nama: 'SDN 6 Tunas Harapan', jenjang: 'SD', alamat: 'Jl. Tunas No. 11', kecamatan: 'Tanah Sareal', desa: 'Kebon Jeruk', kepalaSekolah: 'Ibu Entin Kartinah, S.Pd, M.Pd', status: 'Aktif', noHp: '083234567895', email: 'sdn6.tunasharapan@gmail.com', tahunBerdiri: '2000', akreditasi: 'B' },
    { npsn: '40101240', nama: 'SDN 7 Pelita Bangsa', jenjang: 'SD', alamat: 'Jl. Pelita No. 3', kecamatan: 'Tanah Sareal', desa: 'Sukaresmi', kepalaSekolah: 'Drs. Wahyu Hidayat, M.M', status: 'Aktif', noHp: '083234567896', email: 'sdn7.pelitabangsa@gmail.com', tahunBerdiri: '2003', akreditasi: 'A' },
    { npsn: '40101241', nama: 'SDN 8 Sumber Ilmu', jenjang: 'SD', alamat: 'Jl. Sumber No. 16', kecamatan: 'Cibabat', desa: 'Cibabat', kepalaSekolah: 'Ibu Yuyun Yuliati, S.Pd', status: 'Aktif', noHp: '083234567897', email: 'sdn8.sumberilmu@gmail.com', tahunBerdiri: '2005', akreditasi: 'B' },
    { npsn: '40101242', nama: 'SDN 9 Karya Ilmu', jenjang: 'SD', alamat: 'Jl. Karya No. 7', kecamatan: 'Cibabat', desa: 'Cibabat', kepalaSekolah: 'Drs. Asep Saepudin, M.Pd', status: 'Nonaktif', noHp: '083234567898', email: 'sdn9.karyailmu@gmail.com', tahunBerdiri: '2008', akreditasi: 'C' },
  ]

  for (const s of schools) {
    await db.school.create({ data: s })
  }

  console.log(`Seeded ${schools.length} schools successfully!`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
