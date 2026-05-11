import { NextRequest, NextResponse } from 'next/server'
import { dbCreatePendaftar, dbListPendaftar } from '@/lib/firestore-db'

const REF_DATE = new Date('2026-07-01')
const CUTOFF_ACCEPTED = new Date('2020-06-30')
const CUTOFF_BATAS = new Date('2020-07-01')

function validateAge(tanggalLahir: string): { status: string; usia: string; rekomendasi: string } {
  const birthDate = new Date(tanggalLahir)

  if (birthDate <= CUTOFF_ACCEPTED) {
    let years = REF_DATE.getFullYear() - birthDate.getFullYear()
    let months = REF_DATE.getMonth() - birthDate.getMonth()
    if (months < 0) { years--; months += 12 }
    return { status: 'Diterima', usia: `${years} tahun ${months} bulan`, rekomendasi: 'Memenuhi syarat usia minimal' }
  } else if (
    birthDate.getFullYear() === CUTOFF_BATAS.getFullYear() &&
    birthDate.getMonth() === CUTOFF_BATAS.getMonth() &&
    birthDate.getDate() === CUTOFF_BATAS.getDate()
  ) {
    return { status: 'Batas', usia: '6 tahun 0 bulan', rekomendasi: 'Batas minimum usia — perlu konfirmasi' }
  } else {
    let years = REF_DATE.getFullYear() - birthDate.getFullYear()
    let months = REF_DATE.getMonth() - birthDate.getMonth()
    if (months < 0) { years--; months += 12 }
    return { status: 'Ditolak', usia: `${years} tahun ${months} bulan`, rekomendasi: 'Tidak memenuhi syarat usia minimal' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      schoolId, npsn, namaSekolah,
      namaSiswa, nisn, tanggalLahir, jenisKelamin, asalSekolah,
      nik, parentName, parentPhone, parentAddress, alamat,
    } = body

    if (!schoolId || !npsn || !namaSekolah || !namaSiswa || !tanggalLahir || !jenisKelamin) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap. Isi semua field wajib.' },
        { status: 400 }
      )
    }

    const validation = validateAge(tanggalLahir)

    const allSchoolPendaftar = await dbListPendaftar({ schoolId })
    const lastNo = allSchoolPendaftar.reduce((max, p) => Math.max(max, p.noUrut || 0), 0)
    const noUrut = lastNo + 1

    const pendaftar = await dbCreatePendaftar({
      schoolId,
      npsn,
      namaSekolah,
      namaSiswa: namaSiswa.toUpperCase(),
      nisn: nisn || null,
      tanggalLahir,
      jenisKelamin,
      asalSekolah: asalSekolah || 'Lainnya',
      statusUsia: validation.status,
      noUrut,
      nik: nik || null,
      alamat: alamat || null,
      parentName: parentName || null,
      parentPhone: parentPhone || null,
      parentAddress: parentAddress || null,
      catatan: 'Pendaftaran mandiri oleh orang tua',
      submittedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      data: {
        ...pendaftar,
        usia: validation.usia,
        rekomendasi: validation.rekomendasi,
      },
    }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mendaftarkan siswa'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
