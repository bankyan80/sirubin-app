import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { dbListAllSchools, dbListAllLaporan } from '@/lib/firestore-db'

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated via headers, but allow public access
    const userId = request.headers.get('x-user-id')
    const role = request.headers.get('x-user-role')

    let user: any = null

    if (userId && role) {
      try {
        const authResult = await getAuth(request)
        if (authResult.authenticated) {
          user = authResult.user
        }
      } catch (e) {
        // Ignore auth errors - allow public access
      }
    }
    // If no auth headers, allow public access (user stays null)

    const { searchParams } = new URL(request.url)
    const tahun = searchParams.get('tahun') || String(new Date().getFullYear())
    const bulan = searchParams.get('bulan') || ''
    const jenjang = searchParams.get('jenjang') || ''
    const kecamatan = searchParams.get('kecamatan') || ''

    // 1. Get schools matching filter
    let schools = await dbListAllSchools()
    if (jenjang) schools = schools.filter((s) => s.jenjang === jenjang)
    if (kecamatan) schools = schools.filter((s) => s.kecamatan === kecamatan)
    // 2. Get all laporan for this year matching filters
    let allLaporan = await dbListAllLaporan({ tahun: parseInt(tahun) })
    if (bulan) allLaporan = allLaporan.filter((l) => l.bulan === parseInt(bulan))
    if (jenjang) allLaporan = allLaporan.filter((l) => l.jenjang === jenjang)

    // Build lookup: schoolId_bulan -> laporan
    const laporanMap = new Map<string, (typeof allLaporan)[0]>()
    for (const l of allLaporan) {
      laporanMap.set(`${l.schoolId}_${l.bulan}`, l)
    }

    // Get unique kecamatan from schools
    const kecamatanList = [...new Set(schools.map((s) => s.kecamatan))].sort()

    // 3. Build per-school monthly data
    const months = bulan ? [parseInt(bulan)] : [1,2,3,4,5,6,7,8,9,10,11,12]
    const schoolMonthlyData = schools.map((school) => {
      const monthly: { bulan: number; bulanNama: string; persentase: number; status: string }[] = []
      let totalPersentase = 0
      let totalLaporan = 0

      for (const m of months) {
        const l = laporanMap.get(`${school.npsn}_${m}`)
        const persentase = l ? l.persentase : -1
        const status = l ? l.status : 'Belum'
        monthly.push({ bulan: m, bulanNama: BULAN[m] || '', persentase, status })
        if (l && l.status === 'Submitted') {
          totalPersentase += l.persentase
          totalLaporan++
        }
      }

      const avgPersentase = totalLaporan > 0 ? Math.round(totalPersentase / totalLaporan) : 0
      const sudahLapor = monthly.filter((m) => m.status === 'Submitted').length

      return {
        schoolId: school.npsn,
        npsn: school.npsn,
        nama: school.nama,
        jenjang: school.jenjang,
        kecamatan: school.kecamatan,
        monthly,
        avgPersentase,
        sudahLapor,
        totalBulan: months.length,
        belumLapor: months.length - sudahLapor,
      }
    })

    // 4. Summary stats
    const totalSekolah = schools.length
    const sudahLaporGlobal = bulan
      ? schoolMonthlyData.filter((s) => s.monthly[0]?.status === 'Submitted').length
      : schoolMonthlyData.filter((s) => s.sudahLapor > 0).length
    const belumLaporGlobal = totalSekolah - sudahLaporGlobal
    const avgPersentaseGlobal = schoolMonthlyData.length > 0
      ? Math.round(schoolMonthlyData.reduce((sum, s) => sum + s.avgPersentase, 0) / schoolMonthlyData.filter((s) => s.avgPersentase > 0).length) || 0
      : 0

    // 5. Per-jenjang stats
    const jenjangList = jenjang ? [jenjang] : ['TK', 'PAUD', 'SD']
    const perJenjang = jenjangList.map((j) => {
      const schoolsJ = schoolMonthlyData.filter((s) => s.jenjang === j)
      const total = schoolsJ.length
      const sudahLaporJ = schoolsJ.filter((s) => s.sudahLapor > 0).length
      const avgP = schoolsJ.length > 0
        ? Math.round(schoolsJ.reduce((sum, s) => sum + s.avgPersentase, 0) / schoolsJ.filter((s) => s.avgPersentase > 0).length) || 0
        : 0
      return { jenjang: j, total, sudahLapor: sudahLaporJ, belumLapor: total - sudahLaporJ, avgPersentase: avgP }
    })

    // 6. Monthly trend data for charts
    const monthlyTrend = (bulan ? [parseInt(bulan)] : [1,2,3,4,5,6,7,8,9,10,11,12]).map((m) => {
      const laporanBulan = allLaporan.filter((l) => l.bulan === m && l.status === 'Submitted')
      const total = laporanBulan.length
      const avgP = total > 0 ? Math.round(laporanBulan.reduce((s, l) => s + l.persentase, 0) / total) : 0

      const tkL = laporanBulan.filter((l) => l.jenjang === 'TK')
      const paudL = laporanBulan.filter((l) => l.jenjang === 'PAUD')
      const sdL = laporanBulan.filter((l) => l.jenjang === 'SD')
      return {
        bulan: m,
        bulanNama: BULAN[m]?.slice(0, 3) || '',
        total,
        avgPersentase: avgP,
        tk: tkL.length > 0 ? Math.round(tkL.reduce((s, l) => s + l.persentase, 0) / tkL.length) : 0,
        paud: paudL.length > 0 ? Math.round(paudL.reduce((s, l) => s + l.persentase, 0) / paudL.length) : 0,
        sd: sdL.length > 0 ? Math.round(sdL.reduce((s, l) => s + l.persentase, 0) / sdL.length) : 0,
      }
    })

    // 7. Ranking
    const ranking = [...schoolMonthlyData]
      .sort((a, b) => b.avgPersentase - a.avgPersentase || a.nama.localeCompare(b.nama))
      .map((s, i) => ({ rank: i + 1, ...s }))

    // 8. Insights
    const insights: { type: string; icon: string; text: string; color: string }[] = []

    // Most active school
    const mostActive = ranking[0]
    if (mostActive && mostActive.avgPersentase > 0) {
      insights.push({ type: 'success', icon: 'trophy', text: `Sekolah paling rajin: ${mostActive.nama} (${mostActive.avgPersentase}%)`, color: 'emerald' })
    }

    // Schools below 75%
    const belowThreshold = schoolMonthlyData.filter((s) => s.avgPersentase > 0 && s.avgPersentase < 75)
    if (belowThreshold.length > 0) {
      insights.push({ type: 'warning', icon: 'alert', text: `${belowThreshold.length} sekolah dengan rata-rata di bawah 75%`, color: 'amber' })
    }

    // Lowest jenjang
    const lowestJenjang = [...perJenjang].sort((a, b) => a.avgPersentase - b.avgPersentase)[0]
    if (lowestJenjang && lowestJenjang.avgPersentase > 0) {
      insights.push({ type: 'info', icon: 'trend-down', text: `Jenjang progres terendah: ${lowestJenjang.jenjang} (${lowestJenjang.avgPersentase}%)`, color: 'violet' })
    }

    // Trend analysis
    if (monthlyTrend.length >= 2) {
      const recent = monthlyTrend[monthlyTrend.length - 1]
      const prev = monthlyTrend[monthlyTrend.length - 2]
      if (recent.avgPersentase > prev.avgPersentase) {
        insights.push({ type: 'success', icon: 'trend-up', text: `Tren naik: ${prev.bulanNama} (${prev.avgPersentase}%) → ${recent.bulanNama} (${recent.avgPersentase}%)`, color: 'emerald' })
      } else if (recent.avgPersentase < prev.avgPersentase) {
        insights.push({ type: 'warning', icon: 'trend-down', text: `Tren turun: ${prev.bulanNama} (${prev.avgPersentase}%) → ${recent.bulanNama} (${recent.avgPersentase}%)`, color: 'red' })
      }
    }

    // 9. Warning list
    const warnings: { type: string; school: string; jenjang: string; message: string; npsn: string }[] = []

    // Schools belum lapor for selected month
    if (bulan) {
      for (const s of schoolMonthlyData) {
        if (s.monthly[0]?.status === 'Belum') {
          warnings.push({ type: 'belum', school: s.nama, jenjang: s.jenjang, message: 'Belum mengirim laporan', npsn: s.npsn })
        }
      }
    }

    // Schools below 75%
    for (const s of schoolMonthlyData) {
      if (s.avgPersentase > 0 && s.avgPersentase < 75) {
        warnings.push({ type: 'rendah', school: s.nama, jenjang: s.jenjang, message: `Rata-rata ${s.avgPersentase}% (di bawah 75%)`, npsn: s.npsn })
      }
    }

    // Schools with no reports at all
    const noReports = schoolMonthlyData.filter((s) => s.sudahLapor === 0)
    for (const s of noReports) {
      warnings.push({ type: 'nihil', school: s.nama, jenjang: s.jenjang, message: 'Tidak ada laporan sama sekali', npsn: s.npsn })
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: { totalSekolah, sudahLapor: sudahLaporGlobal, belumLapor: belumLaporGlobal, avgPersentase: avgPersentaseGlobal },
        schoolData: schoolMonthlyData,
        perJenjang,
        monthlyTrend,
        ranking,
        insights,
        warnings,
        kecamatanList,
        tahun: parseInt(tahun),
        bulan: bulan ? parseInt(bulan) : null,
        filterJenjang: jenjang,
        filterKecamatan: kecamatan,
        months: months.map((m) => ({ value: m, label: BULAN[m] })),
      },
    })
  } catch (error) {
    console.error('GET /api/rekapitulasi error:', error)
    return NextResponse.json({ success: false, message: 'Gagal memuat data rekapitulasi' }, { status: 500 })
  }
}
