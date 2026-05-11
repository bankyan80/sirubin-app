import { NextRequest, NextResponse } from 'next/server'
import { dbListLaporan, dbUpsertLaporan } from '@/lib/firestore-db'
import { getAuth } from '@/lib/auth'

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const user = auth.user

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const jenjang = searchParams.get('jenjang') || ''
    const bulan = searchParams.get('bulan') || ''
    const tahun = searchParams.get('tahun') || ''
    const status = searchParams.get('status') || ''
    let schoolId = searchParams.get('schoolId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data, total } = await dbListLaporan({ search, jenjang, bulan, tahun, status, schoolId })

    // Enrich with bulan names
    const enriched = data.map(l => ({
      ...l,
      bulanNama: BULAN[l.bulan] || '',
    }))

    return NextResponse.json({
      success: true,
      data: enriched,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('GET /api/laporan error:', error)
    return NextResponse.json({ success: false, message: 'Gagal memuat data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const user = auth.user

    const body = await request.json()
    const {
      schoolId, npsn, namaSekolah, jenjang, bulan, tahun,
      dataSekolahUpdate, dataGuruUpdate, dataSiswaUpdate,
      jadwalTersedia, absensiTersedia, arsipTertata,
      kondisiRuangKelas, airBersih, toiletLayak, kebutuhanMendesak,
      jumlahGuru, jumlahSiswa, jumlahRombel,
      siswaMasuk, siswaKeluar, siswaL, siswaP,
      kelas1, kelas2, kelas3, kelas4, kelas5, kelas6,
      guruPns, guruPppk, guruHonorer, guruGol34, guruGol9,
      guruUsia2029, guruUsia3039, guruUsia4049, guruUsia5059, guruL, guruP,
      guruMkKurang5, guruMk5_10, guruMk10_20, guruMkLebih20,
      guruJabKelas, guruJabMapel, guruJabBK, guruJabLainnya,
      tendikTotal, tendikPns, tendikPppk, tendikHonorer, tendikGol34, tendikGol9,
      tendikUsia2029, tendikUsia3039, tendikUsia4049, tendikUsia5059, tendikL, tendikP,
      tendikMkKurang5, tendikMk5_10, tendikMk10_20, tendikMkLebih20,
      tendikJabTU, tendikJabPerpus, tendikJabLab, tendikJabLainnya,
      fotoUrl, fileUrl, kendala, keterangan, status,
    } = body

    if (!npsn || !bulan || !tahun) {
      return NextResponse.json({ success: false, message: 'Field wajib belum lengkap' }, { status: 400 })
    }

    // Calculate percentage from checklist (6 items)
    const checklist = [dataSekolahUpdate, dataGuruUpdate, dataSiswaUpdate, jadwalTersedia, absensiTersedia, arsipTertata]
    const filled = checklist.filter(Boolean).length
    const persentase = Math.round((filled / 6) * 100)

    const { doc, isNew } = await dbUpsertLaporan(schoolId, parseInt(bulan), parseInt(tahun), {
      schoolId, npsn, namaSekolah, jenjang,
      bulan: parseInt(bulan), tahun: parseInt(tahun),
      dataSekolahUpdate: !!dataSekolahUpdate,
      dataGuruUpdate: !!dataGuruUpdate,
      dataSiswaUpdate: !!dataSiswaUpdate,
      jadwalTersedia: !!jadwalTersedia,
      absensiTersedia: !!absensiTersedia,
      arsipTertata: !!arsipTertata,
      kondisiRuangKelas: kondisiRuangKelas || 'Baik',
      airBersih: !!airBersih,
      toiletLayak: !!toiletLayak,
      kebutuhanMendesak: kebutuhanMendesak || null,
      jumlahGuru: parseInt(jumlahGuru) || 0,
      jumlahSiswa: parseInt(jumlahSiswa) || 0,
      jumlahRombel: parseInt(jumlahRombel) || 0,
      // Data Siswa
      siswaMasuk: parseInt(siswaMasuk) || 0,
      siswaKeluar: parseInt(siswaKeluar) || 0,
      siswaL: parseInt(siswaL) || 0,
      siswaP: parseInt(siswaP) || 0,
      kelas1: parseInt(kelas1) || 0,
      kelas2: parseInt(kelas2) || 0,
      kelas3: parseInt(kelas3) || 0,
      kelas4: parseInt(kelas4) || 0,
      kelas5: parseInt(kelas5) || 0,
      kelas6: parseInt(kelas6) || 0,
      // Data Guru
      guruPns: parseInt(guruPns) || 0,
      guruPppk: parseInt(guruPppk) || 0,
      guruHonorer: parseInt(guruHonorer) || 0,
      guruGol34: parseInt(guruGol34) || 0,
      guruGol9: parseInt(guruGol9) || 0,
      guruUsia2029: parseInt(guruUsia2029) || 0,
      guruUsia3039: parseInt(guruUsia3039) || 0,
      guruUsia4049: parseInt(guruUsia4049) || 0,
      guruUsia5059: parseInt(guruUsia5059) || 0,
      guruL: parseInt(guruL) || 0,
      guruP: parseInt(guruP) || 0,
      guruMkKurang5: parseInt(guruMkKurang5) || 0,
      guruMk5_10: parseInt(guruMk5_10) || 0,
      guruMk10_20: parseInt(guruMk10_20) || 0,
      guruMkLebih20: parseInt(guruMkLebih20) || 0,
      guruJabKelas: parseInt(guruJabKelas) || 0,
      guruJabMapel: parseInt(guruJabMapel) || 0,
      guruJabBK: parseInt(guruJabBK) || 0,
      guruJabLainnya: parseInt(guruJabLainnya) || 0,
      // Data Pegawai
      tendikTotal: parseInt(tendikTotal) || 0,
      tendikPns: parseInt(tendikPns) || 0,
      tendikPppk: parseInt(tendikPppk) || 0,
      tendikHonorer: parseInt(tendikHonorer) || 0,
      tendikGol34: parseInt(tendikGol34) || 0,
      tendikGol9: parseInt(tendikGol9) || 0,
      tendikUsia2029: parseInt(tendikUsia2029) || 0,
      tendikUsia3039: parseInt(tendikUsia3039) || 0,
      tendikUsia4049: parseInt(tendikUsia4049) || 0,
      tendikUsia5059: parseInt(tendikUsia5059) || 0,
      tendikL: parseInt(tendikL) || 0,
      tendikP: parseInt(tendikP) || 0,
      tendikMkKurang5: parseInt(tendikMkKurang5) || 0,
      tendikMk5_10: parseInt(tendikMk5_10) || 0,
      tendikMk10_20: parseInt(tendikMk10_20) || 0,
      tendikMkLebih20: parseInt(tendikMkLebih20) || 0,
      tendikJabTU: parseInt(tendikJabTU) || 0,
      tendikJabPerpus: parseInt(tendikJabPerpus) || 0,
      tendikJabLab: parseInt(tendikJabLab) || 0,
      tendikJabLainnya: parseInt(tendikJabLainnya) || 0,
      fotoUrl: fotoUrl || null,
      fileUrl: fileUrl || null,
      kendala: kendala || null,
      keterangan: keterangan || null,
      persentase,
      status: status || 'Draft',
      submittedAt: status === 'Submitted' ? new Date().toISOString() : null,
    })

    return NextResponse.json({
      success: true,
      data: doc,
      message: isNew ? 'Laporan berhasil disimpan' : 'Laporan berhasil diperbarui',
    })
  } catch (error) {
    console.error('POST /api/laporan error:', error)
    return NextResponse.json({ success: false, message: 'Gagal menyimpan laporan' }, { status: 500 })
  }
}
