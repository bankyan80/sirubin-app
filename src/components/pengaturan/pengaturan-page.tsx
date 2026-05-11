'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  User,
  Users,
  Database,
  BarChart3,
  Info,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Search,
  Edit3,
  Trash2,
  Key,
  Download,
  Upload,
  Clock,
  GraduationCap,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Save,
  Calendar,
  Bell,
  Percent,
  ChevronRight,
  Activity,
  FileText,
  School,
  Copy,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { apiFetch } from '@/lib/api-fetch'

// ==================== TYPE DEFINITIONS ====================
interface UserInfo {
  id: string
  username: string
  role: string
  name: string
  jenjang: string | null
  npsn: string | null
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
}

interface SystemSettings {
  tahunAjaran: string
  semester: string
  batasTanggal: number
  persentaseMinimum: number
  autoReminder: boolean
  reminderDaysBefore: number
}

interface StatsData {
  totalSekolah: number
  totalLaporan: number
  totalUsers: number
  laporanThisMonth: number
  sekolahPerJenjang: { jenjang: string; _count: { id: number } }[]
}

// ==================== TAB DEFINITIONS ====================
const tabs = [
  { id: 'profil', label: 'Profil Saya', icon: User, roles: ['ADMIN', 'SEKOLAH'] },
  { id: 'users', label: 'Manajemen User', icon: Users, roles: ['ADMIN'] },
  { id: 'sistem', label: 'Pengaturan Sistem', icon: Settings, roles: ['ADMIN'] },
  { id: 'backup', label: 'Backup & Data', icon: Database, roles: ['ADMIN'] },
  { id: 'tentang', label: 'Tentang Aplikasi', icon: Info, roles: ['ADMIN', 'SEKOLAH'] },
]

// ==================== MAIN COMPONENT ====================
export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState('profil')
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isAdmin = isAuthenticated && user?.role === 'ADMIN'

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24"
      >
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Shield size={32} className="text-slate-300" />
        </div>
        <h2 className="text-lg font-bold text-slate-600">Akses Ditolak</h2>
        <p className="text-sm text-slate-400 mt-1">Silakan login terlebih dahulu untuk mengakses Pengaturan</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Pengaturan
            </h1>
            <p className="text-sm text-slate-500">Kelola akun, user, dan konfigurasi sistem</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-1.5"
      >
        <div className="flex flex-wrap gap-1">
          {tabs.filter(t => t.roles.includes(user?.role || '')).map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profil' && <ProfilTab />}
          {activeTab === 'users' && isAdmin && <ManajemenUserTab />}
          {activeTab === 'users' && !isAdmin && (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center">
              <Shield size={40} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-600">Akses Terbatas</h3>
              <p className="text-sm text-slate-400 mt-1">Hanya admin yang dapat mengelola user</p>
            </div>
          )}
          {activeTab === 'sistem' && isAdmin && <PengaturanSistemTab />}
          {activeTab === 'sistem' && !isAdmin && (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center">
              <Shield size={40} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-600">Akses Terbatas</h3>
              <p className="text-sm text-slate-400 mt-1">Hanya admin yang dapat mengatur sistem</p>
            </div>
          )}
          {activeTab === 'backup' && <BackupTab />}
          {activeTab === 'tentang' && <TentangTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ==================== PROFIL TAB ====================
function ProfilTab() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ name: '', email: '' })
  const [showChangePw, setShowChangePw] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: '' })
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!form.name.trim()) return
    setLoading(true)
    try {
      const res = await apiFetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser({ name: form.name })
        setSuccess('Profil berhasil disimpan')
        setTimeout(() => setSuccess(''), 2500)
        setEditing(false)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg(null)
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg({ type: 'error', text: 'Semua field wajib diisi' })
      return
    }
    if (newPw.length < 6) {
      setPwMsg({ type: 'error', text: 'Password baru minimal 6 karakter' })
      return
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' })
      return
    }
    setPwLoading(true)
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser({ mustChangePassword: false })
        setPwMsg({ type: 'success', text: 'Password berhasil diubah!' })
        setCurrentPw('')
        setNewPw('')
        setConfirmPw('')
        setTimeout(() => {
          setShowChangePw(false)
          setPwMsg(null)
        }, 2000)
      } else {
        setPwMsg({ type: 'error', text: data.message || 'Gagal mengubah password' })
      }
    } catch {
      setPwMsg({ type: 'error', text: 'Terjadi kesalahan koneksi' })
    }
    setPwLoading(false)
  }

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
        </div>
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center border-4 border-white shadow-xl">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  user?.role === 'ADMIN'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {user?.role}
                </span>
              </div>
              <p className="text-sm text-slate-500">@{user?.username}</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <Edit3 size={14} />
              {editing ? 'Batal' : 'Edit Profil'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detail Info */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={16} className="text-blue-500" />
            Informasi Akun
          </h3>
          <div className="space-y-4">
            <InfoRow label="Nama Lengkap" value={user?.name || '-'} />
            <InfoRow label="Username" value={user?.username || '-'} />
            <InfoRow label="Role" value={user?.role || '-'} />
            <InfoRow label="Jenjang" value={user?.jenjang || '-'} />
            <InfoRow label="NPSN" value={user?.npsn || '-'} />
            <InfoRow label="Bergabung" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Edit3 size={16} className="text-violet-500" />
            {editing ? 'Edit Profil' : 'Ubah Profil'}
          </h3>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4"
            >
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-sm text-emerald-700">{success}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!editing}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all disabled:opacity-60"
              />
            </div>

            {editing && (
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan Perubahan
              </button>
            )}
          </div>

          {/* Change Password Button */}
          {!showChangePw && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowChangePw(true)}
                className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                <Key size={14} />
                Ubah Password
              </button>
            </div>
          )}

          {/* Change Password Form */}
          <AnimatePresence>
            {showChangePw && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleChangePassword}
                className="mt-4 space-y-3 overflow-hidden"
              >
                {pwMsg && (
                  <div className={`flex items-start gap-2 p-3 rounded-xl border ${
                    pwMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    {pwMsg.type === 'success'
                      ? <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      : <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                    }
                    <span className={`text-xs ${pwMsg.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {pwMsg.text}
                    </span>
                  </div>
                )}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password Saat Ini</label>
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">
                    {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password Baru</label>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">
                    {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Konfirmasi</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowChangePw(false); setPwMsg(null) }} className="flex-1 px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={pwLoading} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl disabled:opacity-60">
                    {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                    Ubah Password
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ==================== MANAJEMEN USER TAB ====================
function ManajemenUserTab() {
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Add form
  const [addForm, setAddForm] = useState({ username: '', password: '', name: '', role: 'SEKOLAH', jenjang: '', npsn: '' })
  // Edit form
  const [editForm, setEditForm] = useState({ name: '', role: '', jenjang: '', npsn: '' })
  // Reset form
  const [resetPw, setResetPw] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterRole) params.set('role', filterRole)
      const res = await apiFetch(`/api/users?${params}`)
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch { /* ignore */ }
    setLoading(false)
  }, [search, filterRole])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalLoading(true)
    try {
      const res = await apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (data.success) {
        setShowAddModal(false)
        setAddForm({ username: '', password: '', name: '', role: 'SEKOLAH', jenjang: '', npsn: '' })
        fetchUsers()
      } else {
        alert(data.message || 'Gagal menambah user')
      }
    } catch { alert('Terjadi kesalahan') }
    setModalLoading(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setModalLoading(true)
    try {
      const res = await apiFetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (data.success) {
        setShowEditModal(false)
        fetchUsers()
      } else {
        alert(data.message || 'Gagal mengubah user')
      }
    } catch { alert('Terjadi kesalahan') }
    setModalLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !resetPw) return
    setModalLoading(true)
    try {
      const res = await apiFetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPw }),
      })
      const data = await res.json()
      if (data.success) {
        setShowResetModal(false)
        setResetPw('')
        fetchUsers()
      } else {
        alert(data.message || 'Gagal reset password')
      }
    } catch { alert('Terjadi kesalahan') }
    setModalLoading(false)
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    setModalLoading(true)
    try {
      const res = await apiFetch(`/api/users/${selectedUser.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setShowDeleteModal(false)
        fetchUsers()
      } else {
        alert(data.message || 'Gagal menghapus user')
      }
    } catch { alert('Terjadi kesalahan') }
    setModalLoading(false)
  }

  const openEdit = (u: UserInfo) => {
    setSelectedUser(u)
    setEditForm({ name: u.name, role: u.role, jenjang: u.jenjang || '', npsn: u.npsn || '' })
    setShowEditModal(true)
  }

  const openReset = (u: UserInfo) => {
    setSelectedUser(u)
    setResetPw('')
    setShowResetModal(true)
  }

  const openDelete = (u: UserInfo) => {
    setSelectedUser(u)
    setShowDeleteModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total User" value={users.length.toString()} gradient="from-blue-500 to-cyan-500" />
        <StatCard icon={Shield} label="Admin" value={users.filter(u => u.role === 'ADMIN').length.toString()} gradient="from-violet-500 to-purple-500" />
        <StatCard icon={GraduationCap} label="User Sekolah" value={users.filter(u => u.role === 'SEKOLAH').length.toString()} gradient="from-emerald-500 to-teal-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, username, NPSN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Semua Role</option>
              <option value="ADMIN">Admin</option>
              <option value="SEKOLAH">Sekolah</option>
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
            >
              <Plus size={16} />
              Tambah User
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-blue-500 animate-spin" />
              <span className="ml-2 text-sm text-slate-500">Memuat data...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users size={40} className="text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Tidak ada user ditemukan</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Username</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Jenjang</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                          u.role === 'ADMIN' ? 'from-blue-500 to-violet-500' : 'from-emerald-500 to-teal-500'
                        } flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-bold">
                            {u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                          <p className="text-xs text-slate-400 md:hidden">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">{u.username}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'ADMIN'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{u.jenjang || '-'}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`flex items-center gap-1 text-xs font-medium ${
                        u.mustChangePassword ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {u.mustChangePassword ? (
                          <><AlertTriangle size={12} /> Perlu Ubah PW</>
                        ) : (
                          <><CheckCircle2 size={12} /> Aktif</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => openReset(u)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Reset Password">
                          <Key size={14} />
                        </button>
                        <button onClick={() => openDelete(u)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">Menampilkan {users.length} user</p>
        </div>
      </div>

      {/* ========= ADD USER MODAL ========= */}
      <AnimatePresence>
        {showAddModal && (
          <ModalWrapper onClose={() => setShowAddModal(false)} title="Tambah User Baru" icon={Plus}>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Username *" value={addForm.username} onChange={v => setAddForm({ ...addForm, username: v })} placeholder="contoh: admin2" />
                <InputField label="Password *" value={addForm.password} onChange={v => setAddForm({ ...addForm, password: v })} placeholder="Minimal 6 karakter" type="password" />
              </div>
              <InputField label="Nama Lengkap *" value={addForm.name} onChange={v => setAddForm({ ...addForm, name: v })} placeholder="Nama user" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role *</label>
                  <select
                    value={addForm.role}
                    onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="SEKOLAH">Sekolah</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenjang</label>
                  <select
                    value={addForm.jenjang}
                    onChange={e => setAddForm({ ...addForm, jenjang: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">-- Pilih --</option>
                    <option value="TK">TK</option>
                    <option value="PAUD">PAUD</option>
                    <option value="SD">SD</option>
                  </select>
                </div>
              </div>
              <InputField label="NPSN" value={addForm.npsn} onChange={v => setAddForm({ ...addForm, npsn: v })} placeholder="NPSN sekolah" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={modalLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md disabled:opacity-60">
                  {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Tambah User
                </button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ========= EDIT USER MODAL ========= */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <ModalWrapper onClose={() => setShowEditModal(false)} title="Edit User" icon={Edit3}>
            <form onSubmit={handleEdit} className="space-y-4">
              <InputField label="Nama Lengkap" value={editForm.name} onChange={v => setEditForm({ ...editForm, name: v })} />
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="SEKOLAH">Sekolah</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenjang</label>
                  <select
                    value={editForm.jenjang}
                    onChange={e => setEditForm({ ...editForm, jenjang: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">-- Pilih --</option>
                    <option value="TK">TK</option>
                    <option value="PAUD">PAUD</option>
                    <option value="SD">SD</option>
                  </select>
                </div>
                <InputField label="NPSN" value={editForm.npsn} onChange={v => setEditForm({ ...editForm, npsn: v })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={modalLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md disabled:opacity-60">
                  {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Simpan
                </button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ========= RESET PASSWORD MODAL ========= */}
      <AnimatePresence>
        {showResetModal && selectedUser && (
          <ModalWrapper onClose={() => setShowResetModal(false)} title="Reset Password" icon={Key}>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700">
                  Reset password untuk user <strong>{selectedUser.name}</strong> (@{selectedUser.username}).
                  User akan diminta mengubah password saat login berikutnya.
                </p>
              </div>
              <InputField label="Password Baru *" value={resetPw} onChange={setResetPw} placeholder="Minimal 6 karakter" type="password" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={modalLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md disabled:opacity-60">
                  {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                  Reset Password
                </button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ========= DELETE CONFIRM MODAL ========= */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <ModalWrapper onClose={() => setShowDeleteModal(false)} title="Hapus User" icon={Trash2}>
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <AlertTriangle size={28} className="text-red-500" />
                </div>
                <p className="text-sm text-slate-600 text-center">
                  Apakah Anda yakin ingin menghapus user <strong>{selectedUser.name}</strong>?
                </p>
                <p className="text-xs text-red-500 mt-1">Tindakan ini tidak dapat dibatalkan</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button onClick={handleDelete} disabled={modalLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl shadow-md disabled:opacity-60">
                  {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Hapus User
                </button>
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== PENGATURAN SISTEM TAB ====================
function PengaturanSistemTab() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch('/api/settings')
        const data = await res.json()
        if (data.success) {
          setSettings(data.data.settings)
          setStats(data.data.statistics)
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch { /* ignore */ }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={School} label="Total Sekolah" value={stats.totalSekolah.toString()} gradient="from-blue-500 to-cyan-500" />
          <StatCard icon={FileText} label="Total Laporan" value={stats.totalLaporan.toString()} gradient="from-violet-500 to-purple-500" />
          <StatCard icon={Users} label="Total User" value={stats.totalUsers.toString()} gradient="from-emerald-500 to-teal-500" />
          <StatCard icon={Activity} label="Laporan Bulan Ini" value={stats.laporanThisMonth.toString()} gradient="from-amber-500 to-orange-500" />
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Settings size={16} className="text-blue-500" />
          Konfigurasi Sistem
        </h3>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4"
          >
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-sm text-emerald-700">Pengaturan berhasil disimpan!</span>
          </motion.div>
        )}

        {settings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tahun Ajaran */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                <Calendar size={13} className="text-blue-500" />
                Tahun Ajaran
              </label>
              <select
                value={settings.tahunAjaran}
                onChange={(e) => setSettings({ ...settings, tahunAjaran: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="2024/2025">2024/2025</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                <GraduationCap size={13} className="text-violet-500" />
                Semester
              </label>
              <select
                value={settings.semester}
                onChange={(e) => setSettings({ ...settings, semester: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            {/* Batas Tanggal */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                <Clock size={13} className="text-emerald-500" />
                Batas Tanggal Laporan
              </label>
              <select
                value={settings.batasTanggal}
                onChange={(e) => setSettings({ ...settings, batasTanggal: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>Tanggal {d}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Tanggal maksimal pengumpulan laporan setiap bulan</p>
            </div>

            {/* Persentase Minimum */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                <Percent size={13} className="text-amber-500" />
                Persentase Kelulusan Minimum
              </label>
              <select
                value={settings.persentaseMinimum}
                onChange={(e) => setSettings({ ...settings, persentaseMinimum: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {[50, 60, 70, 75, 80, 85, 90, 100].map(p => (
                  <option key={p} value={p}>{p}%</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Batasi minimal persentase kelulusan laporan</p>
            </div>

            {/* Auto Reminder */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                <Bell size={13} className="text-blue-500" />
                Auto Reminder
              </label>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.autoReminder}
                      onChange={(e) => setSettings({ ...settings, autoReminder: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-blue-500 transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Aktifkan pengingat otomatis</span>
                </label>
                {settings.autoReminder && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Hari sebelum batas:</span>
                    <select
                      value={settings.reminderDaysBefore}
                      onChange={(e) => setSettings({ ...settings, reminderDaysBefore: parseInt(e.target.value) })}
                      className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {[1, 2, 3, 5, 7].map(d => (
                        <option key={d} value={d}>{d} hari</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== BACKUP & DATA TAB ====================
function BackupTab() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/api/settings')
        const data = await res.json()
        if (data.success) setStats(data.data.statistics)
      } catch { /* ignore */ }
    }
    fetchStats()
  }, [])

  const handleExportSekolah = async () => {
    setExporting('sekolah')
    try {
      const res = await apiFetch('/api/sekolah')
      const data = await res.json()
      if (data.success) {
        downloadXlsx(data.data, 'data-sekolah-sirubin')
      }
    } catch { alert('Gagal export data sekolah') }
    setExporting(null)
  }

  const handleExportLaporan = async () => {
    setExporting('laporan')
    try {
      const res = await apiFetch('/api/laporan')
      const data = await res.json()
      if (data.success) {
        downloadXlsx(data.data, 'data-laporan-sirubin')
      }
    } catch { alert('Gagal export data laporan') }
    setExporting(null)
  }

  const handleExportUsers = async () => {
    setExporting('users')
    try {
      const res = await apiFetch('/api/users?limit=1000')
      const data = await res.json()
      if (data.success) {
        downloadXlsx(data.data, 'data-users-sirubin')
      }
    } catch { alert('Gagal export data users') }
    setExporting(null)
  }

  const downloadXlsx = async (data: unknown[], filename: string) => {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-6">
      {/* Data Overview */}
      {stats && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database size={16} className="text-blue-500" />
            Ringkasan Data
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={School} label="Sekolah" value={stats.totalSekolah.toString()} gradient="from-blue-500 to-cyan-500" />
            <StatCard icon={FileText} label="Laporan" value={stats.totalLaporan.toString()} gradient="from-violet-500 to-purple-500" />
            <StatCard icon={Users} label="Users" value={stats.totalUsers.toString()} gradient="from-emerald-500 to-teal-500" />
            <StatCard icon={GraduationCap} label="Jenjang" value={stats.sekolahPerJenjang?.length.toString() || '0'} gradient="from-amber-500 to-orange-500" />
          </div>
          {stats.sekolahPerJenjang && stats.sekolahPerJenjang.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {stats.sekolahPerJenjang.map((j) => (
                <span key={j.jenjang} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                  {j.jenjang}: {j.count} sekolah
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Download size={16} className="text-emerald-500" />
          Export Data ke Excel
        </h3>
        <p className="text-xs text-slate-500 mb-6">Download seluruh data dalam format Excel (.xlsx)</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Export Sekolah */}
          <div className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <School size={20} className="text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">Data Sekolah</h4>
            <p className="text-xs text-slate-400 mt-1 mb-3">{stats?.totalSekolah || 0} data sekolah</p>
            <button
              onClick={handleExportSekolah}
              disabled={exporting === 'sekolah'}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-60"
            >
              {exporting === 'sekolah' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exporting === 'sekolah' ? 'Mengunduh...' : 'Download .xlsx'}
            </button>
          </div>

          {/* Export Laporan */}
          <div className="p-4 border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3 group-hover:bg-violet-200 transition-colors">
              <FileText size={20} className="text-violet-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">Data Laporan</h4>
            <p className="text-xs text-slate-400 mt-1 mb-3">{stats?.totalLaporan || 0} data laporan</p>
            <button
              onClick={handleExportLaporan}
              disabled={exporting === 'laporan'}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors disabled:opacity-60"
            >
              {exporting === 'laporan' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exporting === 'laporan' ? 'Mengunduh...' : 'Download .xlsx'}
            </button>
          </div>

          {/* Export Users */}
          <div className="p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
              <Users size={20} className="text-emerald-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">Data Users</h4>
            <p className="text-xs text-slate-400 mt-1 mb-3">{stats?.totalUsers || 0} data user</p>
            <button
              onClick={handleExportUsers}
              disabled={exporting === 'users'}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-60"
            >
              {exporting === 'users' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exporting === 'users' ? 'Mengunduh...' : 'Download .xlsx'}
            </button>
          </div>
        </div>
      </div>

      {/* Database Info */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Database size={16} className="text-violet-500" />
          Informasi Database
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-slate-400" />
              <span className="text-sm text-slate-600">Database Engine</span>
            </div>
            <span className="text-sm font-semibold text-slate-800">SQLite (Prisma ORM)</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Copy size={14} className="text-slate-400" />
              <span className="text-sm text-slate-600">Lokasi File</span>
            </div>
            <code className="text-xs bg-slate-200 px-2 py-0.5 rounded-md text-slate-600">db/custom.db</code>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span className="text-sm text-slate-600">Terakhir Diperbarui</span>
            </div>
            <span className="text-sm font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== TENTANG TAB ====================
function TentangTab() {
  return (
    <div className="space-y-6">
      {/* App Identity */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-white/5 rounded-full" />
          <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-white/5 rounded-full" />
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-xl"
            >
              <span className="text-white font-bold text-2xl">SR</span>
            </motion.div>
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl font-bold text-white"
            >
              SIRUBIN
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm text-white/70 mt-0.5"
            >
              Sistem Rutin Bulanan
            </motion.p>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-0.5">Versi Aplikasi</p>
                <p className="text-sm font-bold text-slate-800">v1.0.0</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-0.5">Build</p>
                <p className="text-sm font-bold text-slate-800">2026.05.07</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-0.5">Framework</p>
                <p className="text-sm font-bold text-slate-800">Next.js 16</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-0.5">Database</p>
                <p className="text-sm font-bold text-slate-800">SQLite + Prisma</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Tentang SIRUBIN</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                SIRUBIN (Sistem Rutin Bulanan) adalah aplikasi web monitoring dan pelaporan bulanan sekolah
                yang dirancang untuk memudahkan pengelolaan data sekolah TK, PAUD, dan SD. Sistem ini
                mencakup pengelolaan data sekolah, pelaporan rutin bulanan berbasis checklist, rekapitulasi
                otomatis, serta manajemen user dan pengaturan sistem yang fleksibel.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Fitur Utama</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: School, text: 'Manajemen Data Sekolah', color: 'text-blue-500' },
                  { icon: FileText, text: 'Laporan Bulanan Checklist', color: 'text-violet-500' },
                  { icon: BarChart3, text: 'Rekapitulasi & Analisis', color: 'text-emerald-500' },
                  { icon: Users, text: 'Multi-User (Admin/Sekolah)', color: 'text-amber-500' },
                  { icon: Database, text: 'Export Excel & Backup', color: 'text-rose-500' },
                  { icon: Shield, text: 'Keamanan & Autentikasi', color: 'text-cyan-500' },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-2 p-2">
                    <f.icon size={14} className={f.color} />
                    <span className="text-xs font-medium text-slate-600">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Teknologi</h4>
              <div className="flex flex-wrap gap-2">
                {['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Prisma ORM', 'SQLite', 'Framer Motion', 'Chart.js', 'Zustand', 'shadcn/ui', 'bcryptjs'].map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact / Support */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Info size={16} className="text-blue-500" />
          Dukungan & Informasi
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <ChevronRight size={16} className="text-blue-500" />
            <div>
              <p className="text-xs font-semibold text-blue-800">Panduan Penggunaan</p>
              <p className="text-xs text-blue-600">Lihat dokumentasi untuk panduan lengkap penggunaan SIRUBIN</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
            <ChevronRight size={16} className="text-violet-500" />
            <div>
              <p className="text-xs font-semibold text-violet-800">Laporkan Masalah</p>
              <p className="text-xs text-violet-600">Hubungi admin untuk melaporkan bug atau masalah teknis</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <ChevronRight size={16} className="text-emerald-500" />
            <div>
              <p className="text-xs font-semibold text-emerald-800">Pembaruan Sistem</p>
              <p className="text-xs text-emerald-600">Sistem akan diperbarui secara berkala untuk meningkatkan fitur</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== SHARED COMPONENTS ====================

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, gradient }: { icon: React.ElementType; label: string; value: string; gradient: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-3"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </motion.div>
  )
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
      />
    </div>
  )
}

function ModalWrapper({ children, onClose, title, icon: Icon }: {
  children: React.ReactNode
  onClose: () => void
  title: string
  icon: React.ElementType
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-slate-300/50 border border-slate-100 overflow-hidden max-h-[85vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Icon size={18} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}
