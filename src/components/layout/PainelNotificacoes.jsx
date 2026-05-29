import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Settings, FileText, Bell, Trash2 } from 'lucide-react'

// Calcula de forma amigável e legível o tempo decorrido desde o envio da notificação
const obterTempoDecorrido = (criadoEm, tempoEstatico) => {
  if (!criadoEm) return tempoEstatico || 'Agora mesmo'
  
  // Trata o objeto Timestamp do Firebase Firestore
  const segundos = criadoEm.seconds || (criadoEm.getTime ? Math.floor(criadoEm.getTime() / 1000) : null)
  if (!segundos) return tempoEstatico || 'Agora mesmo'
  
  const diferenca = Math.floor(Date.now() / 1000) - segundos
  if (diferenca < 60) return 'Agora mesmo'
  
  const minutos = Math.floor(diferenca / 60)
  if (minutos < 60) return `Há ${minutos} min`
  
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Há ${horas} h`
  
  const dias = Math.floor(horas / 24)
  return `Há ${dias} d`
}

export default function PainelNotificacoes({ 
  aberto, 
  onFechar, 
  notificacoes = [], 
  onMarcarTodasLidas, 
  onAlternarLida, 
  onAceitarCompartilhamento, 
  onRecusarCompartilhamento,
  onDeletarNotificacao
}) {
  // Estado para controlar a aba selecionada: 'todas', 'geral', 'arquivadas'
  const [abaAtiva, setAbaAtiva] = useState('todas')

  // Filtra as notificações de acordo com a aba ativa
  const notificacoesFiltradas = (notificacoes || []).filter(item => {
    const aba = item.aba || 'geral'
    if (abaAtiva === 'todas') return aba !== 'arquivadas'
    if (abaAtiva === 'geral') return aba === 'geral'
    if (abaAtiva === 'arquivadas') return aba === 'arquivadas'
    return true
  })

  // Conta quantas notificações não foram lidas (desconsiderando arquivadas)
  const totalNaoLidas = (notificacoes || []).filter(n => n.naoLida && (n.aba || 'geral') !== 'arquivadas').length

  // Obtém quantidade de não lidas por aba
  const obterNaoLidasPorAba = (nomeAba) => {
    const listaValida = notificacoes || []
    if (nomeAba === 'todas') {
      return listaValida.filter(n => n.naoLida && (n.aba || 'geral') !== 'arquivadas').length
    }
    return listaValida.filter(n => n.naoLida && (n.aba || 'geral') === nomeAba).length
  }

  if (!aberto) return null

  // Renderiza a lista interna de notificações (compartilhada entre PC e Mobile)
  const renderizarListaNotificacoes = () => {
    if (notificacoesFiltradas.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800/40 flex items-center justify-center text-slate-500 mb-3 border border-slate-800/50">
            <Bell size={20} />
          </div>
          <p className="text-slate-400 text-sm font-medium">Nenhuma notificação por aqui</p>
          <p className="text-slate-500 text-xs mt-1">Tudo limpo no momento!</p>
        </div>
      )
    }

    return (
      <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[420px] md:max-h-[460px] scrollbar-thin scrollbar-thumb-slate-800">
        {notificacoesFiltradas.map((notif) => {
          const usuario = notif.usuario || { nome: 'Sistema', cor: '#3B82F6', iniciais: 'SYS' }
          const tempoFormatado = obterTempoDecorrido(notif.criado_em, notif.tempo)
          
          return (
            <div 
              key={notif.id} 
              className={`p-4 transition-all duration-200 hover:bg-slate-800/35 relative flex items-start gap-3 group cursor-pointer ${
                notif.naoLida ? 'bg-blue-600/[0.02]' : ''
              }`}
              onClick={() => onAlternarLida && onAlternarLida(notif.id)}
            >
              {/* Avatar do Usuário */}
              <div className="relative flex-shrink-0">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner"
                  style={{ backgroundColor: usuario.cor }}
                >
                  {usuario.iniciais}
                </div>
                {/* Ponto indicador de status ativo online */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>

              {/* Conteúdo da Notificação */}
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  <span className="font-semibold text-slate-100">{usuario.nome}</span>{' '}
                  {notif.mensagem}{' '}
                  {notif.alvo && <span className="font-semibold text-blue-400">{notif.alvo}</span>}
                </p>
                
                {/* Botões de Ação para convites/compartilhamentos pendentes */}
                {notif.temAcoes && notif.naoLida && !notif.respondido && (
                  <div className="flex items-center gap-2 mt-2.5" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => onRecusarCompartilhamento && onRecusarCompartilhamento(notif.id)}
                      className="px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700/60 hover:bg-slate-750 hover:text-slate-100 rounded-lg transition"
                    >
                      Recusar
                    </button>
                    <button 
                      onClick={() => onAceitarCompartilhamento && onAceitarCompartilhamento(notif.id)}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-900/30 rounded-lg transition"
                    >
                      Aceitar
                    </button>
                  </div>
                )}

                {/* Exibição se já respondido */}
                {notif.respondido && (
                  <p className="text-xs italic text-slate-400 mt-1">
                    {notif.aceito ? '✓ Compartilhamento aceito' : '✗ Compartilhamento recusado'}
                  </p>
                )}

                {/* Anexo de Arquivo/Documento */}
                {notif.anexo && (
                  <div 
                    className="flex items-center gap-2 mt-2 p-2 bg-slate-850 border border-slate-800/80 rounded-lg hover:border-slate-700 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText size={14} className="text-slate-400 animate-pulse" />
                    <span className="text-xs text-slate-300 truncate font-mono max-w-[200px]">{notif.anexo}</span>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium">
                  {tempoFormatado}
                </p>
              </div>

              {/* Ponto azul indicador de mensagem não lida */}
              {notif.naoLida && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full pointer-events-none" />
              )}

              {/* Botão de Excluir Notificação */}
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onDeletarNotificacao && onDeletarNotificacao(notif.id)
                }}
                className="absolute right-2 top-2 p-1.5 text-slate-500 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all rounded-lg hover:bg-slate-800/80 z-10"
                aria-label="Excluir notificação"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  return (

    <>
      {/* --- VISÃO DESKTOP (POP-UP BALÃO) --- */}
      <div 
        className="hidden md:block absolute right-0 top-[calc(100%+12px)] w-[420px] bg-slate-900/95 border border-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden z-50 animate-slide-down origin-top-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-850">
          <h2 className="text-sm font-bold text-slate-100 font-display flex items-center gap-2">
            Notificações
            {totalNaoLidas > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                {totalNaoLidas}
              </span>
            )}
          </h2>
          <button 
            onClick={onMarcarTodasLidas}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            Marcar todas como lidas
          </button>
        </div>

        {/* Abas e Configurações */}
        <div className="flex items-center justify-between px-5 py-1.5 border-b border-slate-850 bg-slate-900/40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setAbaAtiva('todas')}
              className={`py-2 text-xs font-semibold border-b-2 transition relative ${
                abaAtiva === 'todas' 
                  ? 'border-blue-500 text-slate-100' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Entrada
              {obterNaoLidasPorAba('todas') > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-blue-600/20 text-blue-400 text-[9px] font-bold rounded-full">
                  {obterNaoLidasPorAba('todas')}
                </span>
              )}
            </button>
            <button 
              onClick={() => setAbaAtiva('geral')}
              className={`py-2 text-xs font-semibold border-b-2 transition relative ${
                abaAtiva === 'geral' 
                  ? 'border-blue-500 text-slate-100' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Geral
              {obterNaoLidasPorAba('geral') > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-blue-600/20 text-blue-400 text-[9px] font-bold rounded-full">
                  {obterNaoLidasPorAba('geral')}
                </span>
              )}
            </button>
            <button 
              onClick={() => setAbaAtiva('arquivadas')}
              className={`py-2 text-xs font-semibold border-b-2 transition ${
                abaAtiva === 'arquivadas' 
                  ? 'border-blue-500 text-slate-100' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Arquivadas
            </button>
          </div>
          <button className="text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-800 rounded-lg transition">
            <Settings size={14} />
          </button>
        </div>

        {/* Lista de Notificações */}
        {renderizarListaNotificacoes()}
      </div>

      {/* --- VISÃO MOBILE (FULLSCREEN SLIDE-IN VIA PORTAL) --- */}
      {createPortal(
        <div 
          className="fixed inset-0 w-full h-full z-[100] bg-slate-950 flex flex-col animate-slide-left-full md:hidden"
          style={{ backgroundColor: '#020617' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho Mobile */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-900 bg-slate-900/60 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={onFechar}
                className="text-slate-400 hover:text-slate-100 p-1.5 hover:bg-slate-800/80 rounded-xl transition"
                aria-label="Voltar"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                Notificações
                {totalNaoLidas > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-600 text-white rounded-full">
                    {totalNaoLidas}
                  </span>
                )}
              </h2>
            </div>
            <button 
              onClick={onMarcarTodasLidas}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              Lidas
            </button>
          </div>

          {/* Abas Mobile */}
          <div className="flex items-center justify-between px-4 border-b border-slate-900/80 bg-slate-900/30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setAbaAtiva('todas')}
                className={`py-3 text-xs font-semibold border-b-2 transition ${
                  abaAtiva === 'todas' 
                    ? 'border-blue-500 text-slate-100' 
                    : 'border-transparent text-slate-400'
                }`}
              >
                Entrada
              </button>
              <button 
                onClick={() => setAbaAtiva('geral')}
                className={`py-3 text-xs font-semibold border-b-2 transition ${
                  abaAtiva === 'geral' 
                    ? 'border-blue-500 text-slate-100' 
                    : 'border-transparent text-slate-400'
                }`}
              >
                Geral
              </button>
              <button 
                onClick={() => setAbaAtiva('arquivadas')}
                className={`py-3 text-xs font-semibold border-b-2 transition ${
                  abaAtiva === 'arquivadas' 
                    ? 'border-blue-500 text-slate-100' 
                    : 'border-transparent text-slate-400'
                }`}
              >
                Arquivadas
              </button>
            </div>
            <button className="text-slate-400 p-1.5">
              <Settings size={15} />
            </button>
          </div>

          {/* Conteúdo Mobile */}
          <div className="flex-1 overflow-y-auto">
            {renderizarListaNotificacoes()}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
