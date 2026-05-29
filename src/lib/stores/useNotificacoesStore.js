import { create } from 'zustand'
import {
  listarNotificacoes,
  salvarNotificacao,
  atualizarNotificacao,
  marcarTodasNotificacoesLidas
} from '../firebase/firestore'
import { db } from '../firebase/config'
import { doc, deleteDoc } from 'firebase/firestore'

/**
 * Store global para gerenciar as notificações do usuário no Dev.Journey.
 * Sincronizado com o Firebase Firestore e com suporte a atualizações otimistas no frontend.
 */
export const useNotificacoesStore = create((set, get) => ({
  notificacoes: [],
  estaCarregando: false,
  erro: null,

  /**
   * Carrega todas as notificações de um usuário específico do Firestore.
   */
  carregarNotificacoes: async (usuarioId) => {
    if (!usuarioId) return
    set({ estaCarregando: true, erro: null })
    try {
      const lista = await listarNotificacoes(usuarioId)
      set({ notificacoes: lista, estaCarregando: false })
    } catch (err) {
      set({ erro: err.message, estaCarregando: false })
    }
  },

  /**
   * Adiciona uma nova notificação ao banco e atualiza o estado local.
   */
  adicionarNotificacao: async (usuarioId, dados) => {
    if (!usuarioId) return false
    set({ estaCarregando: true, erro: null })
    try {
      await salvarNotificacao(usuarioId, { ...dados, naoLida: true })
      const lista = await listarNotificacoes(usuarioId)
      set({ notificacoes: lista, estaCarregando: false })
      return true
    } catch (err) {
      set({ erro: err.message, estaCarregando: false })
      return false
    }
  },

  /**
   * Alterna o status de leitura de uma notificação (Lida/Não Lida).
   */
  alternarLida: async (usuarioId, id) => {
    if (!usuarioId) return
    const notificacaoAtual = get().notificacoes.find(n => n.id === id)
    if (!notificacaoAtual) return
    
    const novoStatus = !notificacaoAtual.naoLida
    
    // Atualização otimista no estado local do Zustand
    set(state => ({
      notificacoes: state.notificacoes.map(n => 
        n.id === id ? { ...n, naoLida: novoStatus } : n
      )
    }))

    try {
      await atualizarNotificacao(usuarioId, id, { naoLida: novoStatus })
    } catch (err) {
      // Caso dê erro no Firebase, reverte para o estado anterior
      set(state => ({
        erro: err.message,
        notificacoes: state.notificacoes.map(n => 
          n.id === id ? { ...n, naoLida: !novoStatus } : n
        )
      }))
    }
  },

  /**
   * Marca todas as notificações do usuário logado como lidas.
   */
  marcarTodasComoLidas: async (usuarioId) => {
    if (!usuarioId) return
    
    // Atualização otimista rápida
    set(state => ({
      notificacoes: state.notificacoes.map(n => ({ ...n, naoLida: false }))
    }))

    try {
      await marcarTodasNotificacoesLidas(usuarioId)
    } catch (err) {
      set({ erro: err.message })
      // Sincroniza novamente com o banco de dados em caso de falha
      const lista = await listarNotificacoes(usuarioId)
      set({ notificacoes: lista })
    }
  },

  /**
   * Exclui permanentemente uma notificação.
   */
  deletarNotificacao: async (usuarioId, id) => {
    if (!usuarioId) return
    
    // Remoção otimista local
    set(state => ({
      notificacoes: state.notificacoes.filter(n => n.id !== id)
    }))

    try {
      const docRef = doc(db, 'usuarios', usuarioId, 'notificacoes', id)
      await deleteDoc(docRef)
    } catch (err) {
      set({ erro: err.message })
      const lista = await listarNotificacoes(usuarioId)
      set({ notificacoes: lista })
    }
  },

  /**
   * Responde a solicitações de compartilhamento (aceitar ou recusar).
   */
  responderCompartilhamento: async (usuarioId, id, aceito) => {
    if (!usuarioId) return
    
    // Modifica o estado local para dar feedback imediato
    set(state => ({
      notificacoes: state.notificacoes.map(n => 
        n.id === id 
          ? { 
              ...n, 
              respondido: true, 
              aceito, 
              mensagem: aceito 
                ? 'Compartilhamento aceito com sucesso.' 
                : 'Compartilhamento recusado.'
            } 
          : n
      )
    }))

    try {
      await atualizarNotificacao(usuarioId, id, {
        respondido: true,
        aceito,
        naoLida: false
      })
    } catch (err) {
      set({ erro: err.message })
      const lista = await listarNotificacoes(usuarioId)
      set({ notificacoes: lista })
    }
  }
}))
