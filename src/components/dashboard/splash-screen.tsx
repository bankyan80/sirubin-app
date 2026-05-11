'use client'

import { motion } from 'framer-motion'
import { School } from 'lucide-react'

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#0c1527] via-[#111d35] to-[#0a1225]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center"
      >
        {/* Logo */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/30 mb-6">
          <img src="/logo.png" alt="SIRUBIN" className="w-full h-full object-cover" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white tracking-tight">SIRUBIN</h1>
        <p className="text-sm text-blue-300/60 mt-1 tracking-widest uppercase">Sistem Rutin Bulanan</p>

        {/* Loading bar */}
        <div className="mt-8 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '400%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="w-1/4 h-full bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 rounded-full"
          />
        </div>

        <p className="text-xs text-slate-500 mt-4">Memuat aplikasi...</p>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
    </motion.div>
  )
}