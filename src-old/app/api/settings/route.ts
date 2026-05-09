import { NextRequest, NextResponse } from 'next/server'
import {
  dbGetSettings,
  dbSaveSettings,
  dbListAllSchools,
  dbCountLaporan,
  dbCountUsers,
  dbListAllLaporan,
  dbGroupSchools,
} from '@/lib/firestore-db'
import { getAuth, requireAdmin } from '@/lib/auth'

// GET /api/settings
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminAuth = requireAdmin(auth)
    if (!adminAuth.authenticated) return adminAuth.response

    const [settings, allSchools, totalLaporan, totalUsers, sekolahPerJenjang, allLaporan] = await Promise.all([
      dbGetSettings(),
      dbListAllSchools(),
      dbCountLaporan(),
      dbCountUsers(),
      dbGroupSchools('jenjang'),
      dbListAllLaporan(),
    ])

    const totalSekolah = allSchools.length

    // Get recent laporan (last 5 by updatedAt)
    const recentLaporan = [...allLaporan]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, 5)
      .map(({ id, namaSekolah, bulan, tahun, persentase, status, updatedAt }) => ({
        id,
        namaSekolah,
        bulan,
        tahun,
        persentase,
        status,
        updatedAt,
      }))

    // Count laporan for this month with 'Submitted' status
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const laporanThisMonth = await dbCountLaporan({
      bulan: currentMonth,
      tahun: currentYear,
      status: 'Submitted',
    })

    // Extract only the settings fields (no id/timestamps)
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...settingsData } = settings

    return NextResponse.json({
      success: true,
      data: {
        settings: settingsData,
        statistics: {
          totalSekolah,
          totalLaporan,
          totalUsers,
          laporanThisMonth,
          sekolahPerJenjang,
        },
        recentLaporan,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth.authenticated) return auth.response
    const adminAuth = requireAdmin(auth)
    if (!adminAuth.authenticated) return adminAuth.response
    const body = await request.json()
    const { tahunAjaran, semester, batasTanggal, persentaseMinimum, autoReminder, reminderDaysBefore } = body

    const currentSettings = await dbGetSettings()

    const updatedSettings: Record<string, unknown> = {
      tahunAjaran: currentSettings.tahunAjaran,
      semester: currentSettings.semester,
      batasTanggal: currentSettings.batasTanggal,
      persentaseMinimum: currentSettings.persentaseMinimum,
      autoReminder: currentSettings.autoReminder,
      reminderDaysBefore: currentSettings.reminderDaysBefore,
    }

    if (tahunAjaran !== undefined) updatedSettings.tahunAjaran = tahunAjaran
    if (semester !== undefined) updatedSettings.semester = semester
    if (batasTanggal !== undefined) updatedSettings.batasTanggal = batasTanggal
    if (persentaseMinimum !== undefined) updatedSettings.persentaseMinimum = persentaseMinimum
    if (autoReminder !== undefined) updatedSettings.autoReminder = autoReminder
    if (reminderDaysBefore !== undefined) updatedSettings.reminderDaysBefore = reminderDaysBefore

    const saved = await dbSaveSettings(updatedSettings)

    // Return only the settings fields (no id/timestamps)
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...settingsData } = saved

    return NextResponse.json({
      success: true,
      data: settingsData,
      message: 'Pengaturan berhasil disimpan',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update settings'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
