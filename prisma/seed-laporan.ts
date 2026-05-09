import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const schools = [
  { npsn: '10101001', nama: 'TK Melati Indah', jenjang: 'TK', schoolId: 'sch_tk_01' },
  { npsn: '10101002', nama: 'TK Mawar Putih', jenjang: 'TK', schoolId: 'sch_tk_02' },
  { npsn: '10101003', nama: 'TK Matahari Terbit', jenjang: 'TK', schoolId: 'sch_tk_03' },
  { npsn: '10101004', nama: 'TK Tunas Harapan', jenjang: 'TK', schoolId: 'sch_tk_04' },
  { npsn: '10101005', nama: 'TK Cerdas Mandiri', jenjang: 'TK', schoolId: 'sch_tk_05' },
  { npsn: '10101006', nama: 'TK Pelangi Ceria', jenjang: 'TK', schoolId: 'sch_tk_06' },
  { npsn: '10101007', nama: 'TK Bintang Kecil', jenjang: 'TK', schoolId: 'sch_tk_07' },
  { npsn: '20102001', nama: 'PAUD Anak Pintar', jenjang: 'PAUD', schoolId: 'sch_paud_01' },
  { npsn: '20102002', nama: 'PAUD Cerdas Ceria', jenjang: 'PAUD', schoolId: 'sch_paud_02' },
  { npsn: '20102003', nama: 'PAUD Pelangi Indah', jenjang: 'PAUD', schoolId: 'sch_paud_03' },
  { npsn: '20102004', nama: 'PAUD Tunas Bangsa', jenjang: 'PAUD', schoolId: 'sch_paud_04' },
  { npsn: '20102005', nama: 'PAUD Kasih Ibu', jenjang: 'PAUD', schoolId: 'sch_paud_05' },
  { npsn: '20102006', nama: 'PAUD Permata Hati', jenjang: 'PAUD', schoolId: 'sch_paud_06' },
  { npsn: '30103001', nama: 'SDN 1 Sukamaju', jenjang: 'SD', schoolId: 'sch_sd_01' },
  { npsn: '30103002', nama: 'SDN 2 Sukamaju', jenjang: 'SD', schoolId: 'sch_sd_02' },
  { npsn: '30103003', nama: 'SDN 1 Cikaret', jenjang: 'SD', schoolId: 'sch_sd_03' },
  { npsn: '30103004', nama: 'SDN 3 Tanah Sareal', jenjang: 'SD', schoolId: 'sch_sd_04' },
  { npsn: '30103005', nama: 'SDN 5 Cibabat', jenjang: 'SD', schoolId: 'sch_sd_05' },
  { npsn: '30103006', nama: 'SDN 7 Sukamaju', jenjang: 'SD', schoolId: 'sch_sd_06' },
  { npsn: '30103007', nama: 'SDN 9 Karya Ilmu', jenjang: 'SD', schoolId: 'sch_sd_07' },
  { npsn: '30103008', nama: 'SDN 11 Cikaret', jenjang: 'SD', schoolId: 'sch_sd_08' },
  { npsn: '30103009', nama: 'SDN 13 Tanah Sareal', jenjang: 'SD', schoolId: 'sch_sd_09' },
]

function randomChecklist() {
  const items = [false, false, false, false, false, false]
  const count = Math.floor(Math.random() * 4) + 3 // 3-6 items true
  for (let i = 0; i < count; i++) items[i] = true
  return items
}

function makeLaporan(school: typeof schools[0], bulan: number, tahun: number, submitted: boolean) {
  const [a, b, c, d, e, f] = randomChecklist()
  const persentase = Math.round(((a?1:0)+(b?1:0)+(c?1:0)+(d?1:0)+(e?1:0)+(f?1:0)) / 6 * 100)
  const kondisi = ['Baik', 'Rusak Ringan', 'Baik', 'Baik', 'Rusak Berat'][Math.floor(Math.random() * 5)]
  return {
    schoolId: school.schoolId,
    npsn: school.npsn,
    namaSekolah: school.nama,
    jenjang: school.jenjang,
    bulan,
    tahun,
    dataSekolahUpdate: a,
    dataGuruUpdate: b,
    dataSiswaUpdate: c,
    jadwalTersedia: d,
    absensiTersedia: e,
    arsipTertata: f,
    kondisiRuangKelas: kondisi,
    airBersih: Math.random() > 0.2,
    toiletLayak: Math.random() > 0.3,
    kebutuhanMendesak: Math.random() > 0.7 ? 'Perbaikan atap ruang kelas 3' : null,
    jumlahGuru: school.jenjang === 'TK' ? Math.floor(Math.random()*4)+3 : school.jenjang === 'PAUD' ? Math.floor(Math.random()*5)+4 : Math.floor(Math.random()*8)+6,
    jumlahSiswa: school.jenjang === 'TK' ? Math.floor(Math.random()*30)+20 : school.jenjang === 'PAUD' ? Math.floor(Math.random()*25)+25 : Math.floor(Math.random()*80)+100,
    jumlahRombel: school.jenjang === 'SD' ? Math.floor(Math.random()*4)+3 : 1,
    kendala: Math.random() > 0.6 ? 'Kendala kurangnya tenaga pendamping' : null,
    keterangan: Math.random() > 0.7 ? 'Laporan bulan ini sudah lengkap' : null,
    persentase,
    status: submitted ? 'Submitted' : 'Draft',
    submittedAt: submitted ? new Date() : null,
  }
}

async function main() {
  // Clear existing
  await db.laporan.deleteMany({})
  console.log('Cleared existing laporan')

  const bulan = 4 // April
  const tahun = 2026
  const laporanData: ReturnType<typeof makeLaporan>[] = []

  // Generate for all 22 schools for April 2026
  for (const school of schools) {
    const submitted = Math.random() > 0.3 // 70% submitted
    laporanData.push(makeLaporan(school, bulan, tahun, submitted))
  }

  // Also add some for previous months
  for (const school of schools.slice(0, 15)) {
    laporanData.push(makeLaporan(school, 3, tahun, true)) // March
  }
  for (const school of schools.slice(0, 18)) {
    laporanData.push(makeLaporan(school, 2, tahun, true)) // February
  }
  for (const school of schools.slice(0, 12)) {
    laporanData.push(makeLaporan(school, 1, tahun, true)) // January
  }

  // Use upsert for safety
  for (const l of laporanData) {
    await db.laporan.upsert({
      where: {
        schoolId_bulan_tahun: {
          schoolId: l.schoolId,
          bulan: l.bulan,
          tahun: l.tahun,
        },
      },
      create: l,
      update: l,
    })
  }

  console.log(`Seeded ${laporanData.length} laporan records`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
