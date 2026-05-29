import React, { useEffect, useState } from 'react'
import { Menu, Wifi, WifiOff, Bell, User } from 'lucide-react'
import { useAuthStore } from '../../lib/stores/useAuthStore'
import { useLocation } from 'react-router-dom'
import PainelNotificacoes from './PainelNotificacoes'
import { useNotificacoesStore } from '../../lib/stores/useNotificacoesStore'

export default function Header({ onMenuClick }) {
  const { user } = useAuthStore()
  const location = useLocation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [painelAberto, setPainelAberto] = useState(false)

  const {
    notificacoes,
    carregarNotificacoes,
    alternarLida,
    marcarTodasComoLidas,
    responderCompartilhamento,
    deletarNotificacao
  } = useNotificacoesStore()

  // Sincroniza estado de rede online/offline
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

  // Carrega notificações do Firestore ao inicializar ou mudar de usuário
  useEffect(() => {
    if (user?.id) {
      carregarNotificacoes(user.id)
    }
  }, [user?.id, carregarNotificacoes])

  // Fecha o painel ao detectar clique em qualquer área externa do documento
  useEffect(() => {
    if (!painelAberto) return
    const fecharAoClicarFora = () => setPainelAberto(false)
    const id = setTimeout(() => {
      document.addEventListener('click', fecharAoClicarFora)
    }, 100)
    return () => {
      clearTimeout(id)
      document.removeEventListener('click', fecharAoClicarFora)
    }
  }, [painelAberto])

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

  // Calcula o total de notificações não lidas
  const totalNaoLidas = (notificacoes || []).filter(
    n => n.naoLida && (n.aba || 'geral') !== 'arquivadas'
  ).length

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

        {/* Notificações com Painel Acoplado */}
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setPainelAberto(!painelAberto)
            }}
            className="text-slate-400 hover:text-slate-200 p-2 hover:bg-slate-800 rounded-xl transition relative"
            aria-label="Notificações"
          >
            <Bell size={18} />
            {totalNaoLidas > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          <PainelNotificacoes
            aberto={painelAberto}
            onFechar={() => setPainelAberto(false)}
            notificacoes={notificacoes}
            onMarcarTodasLidas={() => user?.id && marcarTodasComoLidas(user.id)}
            onAlternarLida={(id) => user?.id && alternarLida(user.id, id)}
            onAceitarCompartilhamento={(id) => user?.id && responderCompartilhamento(user.id, id, true)}
            onRecusarCompartilhamento={(id) => user?.id && responderCompartilhamento(user.id, id, false)}
            onDeletarNotificacao={(id) => user?.id && deletarNotificacao(user.id, id)}
          />
        </div>

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

