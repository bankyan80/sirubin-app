import { NextRequest, NextResponse } from 'next/server'
import { dbListLaporan, dbUpsertLaporan } from '@/lib/firestore-db'
import { getAuth } from '@/lib/auth'

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const jenjang = searchParams.get('jenjang') || ''
    const bulan = searchParams.get('bulan') || ''
    const tahun = searchParams.get('tahun') || ''
    const status = searchParams.get('status') || ''
    let schoolId = searchParams.get('schoolId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // SEKOLAH role: force filter by their own NPSN
    if (auth.user.role === 'SEKOLAH') {
      if (auth.user.npsn) schoolId = auth.user.npsn
    }

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

    const body = await request.json()
    const {
      schoolId, npsn, namaSekolah, jenjang, bulan, tahun,
      dataSekolahUpdate, dataGuruUpdate, dataSiswaUpdate,
      jadwalTersedia, absensiTersedia, arsipTertata,
      kondisiRuangKelas, airBersih, toiletLayak, kebutuhanMendesak,
      jumlahGuru, jumlahSiswa, jumlahRombel,
      fotoUrl, fileUrl, kendala, keterangan, status,
    } = body

    if (!schoolId || !npsn || !namaSekolah || !jenjang || !bulan || !tahun) {
      return NextResponse.json({ success: false, message: 'Field wajib belum lengkap' }, { status: 400 })
    }

    // SEKOLAH role: verify the schoolId/npsn matches their own
    if (auth.user.role === 'SEKOLAH') {
      if (auth.user.npsn && npsn !== auth.user.npsn) {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak. Anda hanya dapat mengirim laporan untuk sekolah Anda sendiri.' },
          { status: 403 }
        )
      }
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
