import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  loginUser, 
  loginWithGoogle,
  registerUser, 
  logoutUser, 
  resetPassword
} from '../firebase/config'
import { carregarUsuarioPorEmail, salvarUsuario } from '../firebase/firestore'
import { useDisciplinaStore } from './useDisciplinaStore'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        const result = await loginUser(email, password)
        
        if (result.success) {
          const userData = await carregarUsuarioPorEmail(email)
          set({ 
            user: { ...result.user, ...userData }, 
            isLoading: false 
          })
          return true
        } else {
          set({ error: result.error, isLoading: false })
          return false
        }
      },
      
      loginGoogle: async () => {
        set({ isLoading: true, error: null })
        const result = await loginWithGoogle()
        
        if (result.success) {
          let userData = await carregarUsuarioPorEmail(result.user.email)
          
          if (!userData) {
            userData = {
              id: result.user.uid,
              nome: result.user.displayName || result.user.email.split('@')[0],
              email: result.user.email,
              telefone: result.user.phoneNumber || '',
              cor_avatar: getRandomColor(),
              tema: 'dark'
            }
            await salvarUsuario(userData)
          }
          
          set({ 
            user: { ...result.user, ...userData }, 
            isLoading: false 
          })
          return true
        } else {
          set({ error: result.error, isLoading: false })
          return false
        }
      },
      
      register: async (email, password, nome, telefone) => {
        set({ isLoading: true, error: null })
        
        const existe = await carregarUsuarioPorEmail(email)
        if (existe) {
          set({ error: 'Email já cadastrado', isLoading: false })
          return false
        }
        
        const result = await registerUser(email, password)
        
        if (result.success) {
          await salvarUsuario({
            id: result.user.uid,
            nome,
            email,
            telefone,
            cor_avatar: getRandomColor(),
            tema: 'dark',
            criado_em: new Date().toISOString()
          })
          
          set({ 
            user: { ...result.user, nome, email, telefone }, 
            isLoading: false 
          })
          return true
        } else {
          set({ error: result.error, isLoading: false })
          return false
        }
      },
      
      logout: async () => {
        await logoutUser()
        useDisciplinaStore.getState().limparDados()
        set({ user: null })
      },
      
      resetPassword: async (email) => {
        set({ isLoading: true, error: null })
        const result = await resetPassword(email)
        if (!result.success) {
          set({ error: result.error })
        }
        set({ isLoading: false })
        return result.success
      },
      
      updateUser: (dados) => {
        set(state => ({
          user: { ...state.user, ...dados }
        }))
      },
      
      clearError: () => set({ error: null }),
      
      setUser: (user) => set({ user })
    }),
    {
      name: 'ag-kit-auth',
      partialize: (state) => ({ user: state.user })
    }
  )
)

const getRandomColor = () => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
  return colors[Math.floor(Math.random() * colors.length)]
}
