'use client'

import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
  Cell,
} from 'recharts'

const monthlyData = [
  { month: 'Jan', tk: 75, paud: 60, sd: 70 },
  { month: 'Feb', tk: 80, paud: 65, sd: 75 },
  { month: 'Mar', tk: 82, paud: 68, sd: 78 },
  { month: 'Apr', tk: 85, paud: 70, sd: 80 },
  { month: 'Mei', tk: 87, paud: 72, sd: 82 },
  { month: 'Jun', tk: 88, paud: 74, sd: 84 },
  { month: 'Jul', tk: 85, paud: 60, sd: 78 },
  { month: 'Agu', tk: 82, paud: 55, sd: 75 },
  { month: 'Sep', tk: 86, paud: 62, sd: 80 },
  { month: 'Okt', tk: 90, paud: 68, sd: 85 },
  { month: 'Nov', tk: 92, paud: 75, sd: 88 },
  { month: 'Des', tk: 72, paud: 61, sd: 65 },
]

const jenjangComparison = [
  { name: 'TK', laporan: 7, total: 7, progress: 72, color: '#ec4899' },
  { name: 'PAUD', laporan: 6, total: 6, progress: 61, color: '#8b5cf6' },
  { name: 'SD', laporan: 9, total: 9, progress: 65, color: '#3b82f6' },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-700 mb-1.5">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 capitalize">{entry.name}:</span>
            <span className="font-bold text-slate-700">{entry.value}%</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Line/Area Chart - Monthly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-2xl border border-slate-100 p-5 lg:p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-800">Progres Bulanan</h3>
          <p className="text-sm text-slate-500 mt-0.5">Tren persentase pelaporan per jenjang</p>
        </div>

        <div className="h-64 lg:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTK" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPAUD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="tk"
                name="TK"
                stroke="#ec4899"
                strokeWidth={2.5}
                fill="url(#gradTK)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#ec4899' }}
              />
              <Area
                type="monotone"
                dataKey="paud"
                name="PAUD"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#gradPAUD)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#8b5cf6' }}
              />
              <Area
                type="monotone"
                dataKey="sd"
                name="SD"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#gradSD)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bar Chart - Per Jenjang Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="bg-white rounded-2xl border border-slate-100 p-5 lg:p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-800">Perbandingan per Jenjang</h3>
          <p className="text-sm text-slate-500 mt-0.5">Rata-rata persentase pelaporan sekolah</p>
        </div>

        <div className="h-64 lg:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jenjangComparison} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={52}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as typeof jenjangComparison[0]
                    return (
                      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-700">{data.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {data.total} sekolah &middot; Rata-rata: <span className="font-bold text-slate-700">{data.progress}%</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="progress" radius={[10, 10, 4, 4]}>
                {jenjangComparison.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
