import { create } from 'zustand'

export interface AuthUser {
  id: string
  email: string
  name: string
  photoURL?: string
  role: string
  jenjang: string | null
  npsn: string | null
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: AuthUser) => void
  logout: () => void
  updateUser: (data: Partial<AuthUser>) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
    logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    updateUser: (data) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),
    setLoading: (loading) => set({ isLoading: loading }),
  })
)
