'use client'

import { motion } from 'framer-motion'
import { School, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react'

const stats = [
  {
    title: 'Total Sekolah',
    value: '48',
    subtitle: 'TK, PAUD & SD',
    icon: School,
    gradient: 'from-blue-500 to-blue-600',
    shadowColor: 'shadow-blue-500/20',
    bgGlow: 'from-blue-500/5',
    change: '+3 bulan ini',
    changeType: 'positive' as const,
  },
  {
    title: 'Sudah Lapor',
    value: '32',
    subtitle: '67% dari total',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/20',
    bgGlow: 'from-emerald-500/5',
    change: '+12 bulan ini',
    changeType: 'positive' as const,
  },
  {
    title: 'Belum Lapor',
    value: '16',
    subtitle: '33% dari total',
    icon: Clock,
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/20',
    bgGlow: 'from-amber-500/5',
    change: '-5 dari bulan lalu',
    changeType: 'negative' as const,
  },
  {
    title: 'Keseluruhan',
    value: '67%',
    subtitle: 'Rata-rata progres',
    icon: TrendingUp,
    gradient: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/20',
    bgGlow: 'from-violet-500/5',
    change: '+8.5% dari bulan lalu',
    changeType: 'positive' as const,
  },
]

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="group relative"
          >
            <div className={`
              relative overflow-hidden rounded-2xl bg-white border border-slate-100
              p-5 lg:p-6 transition-all duration-300
              hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5
              hover:border-slate-200/80
            `}>
              {/* Background glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor}`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className={`
                    text-[11px] font-medium px-2 py-0.5 rounded-full
                    ${stat.changeType === 'positive'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-red-700 bg-red-50'
                    }
                  `}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">{stat.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.subtitle}</p>
                </div>
              </div>

              {/* Decorative circle */}
              <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500`} />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
