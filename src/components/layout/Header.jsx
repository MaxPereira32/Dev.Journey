import React, { useEffect, useState } from 'react'
import { Menu, Wifi, WifiOff, Bell, User } from 'lucide-react'
import { useAuthStore } from '../../lib/stores/useAuthStore'
import { useLocation } from 'react-router-dom'

export default function Header({ onMenuClick }) {
  const { user } = useAuthStore()
  const location = useLocation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Painel Geral'
      case '/disciplinas': return 'Minhas Disciplinas'
      case '/mapa-mental': return 'Mapa Mental'
      case '/cronograma': return 'Cronograma de Estudos'
      case '/tutoria': return 'Tutores & Mentoria'
      case '/configuracoes': return 'Configurações'
      default: return 'Área do Aluno'
    }
  }

  return (
    <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/60 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-slate-200 p-2 hover:bg-slate-800 rounded-xl transition"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold font-display text-slate-100 hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Status de Conexão */}
        <div className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold select-none transition-all duration-300
          ${isOnline 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
          }
        `}>
          {isOnline ? (
            <>
              <Wifi size={13} />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff size={13} />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Notificações de Demonstração */}
        <button className="text-slate-400 hover:text-slate-200 p-2 hover:bg-slate-800 rounded-xl transition relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        {/* Informações do Usuário */}
        <div className="flex items-center gap-3 border-l border-slate-800/80 pl-4">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.nome || 'Estudante'}
            </p>
            <p className="text-[10px] text-slate-400">
              Dev.Journey Aluno
            </p>
          </div>
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: user?.cor_avatar || '#3B82F6' }}
          >
            {user?.nome ? user.nome.slice(0, 1).toUpperCase() : <User size={16} />}
          </div>
        </div>
      </div>
    </header>
  )
}
