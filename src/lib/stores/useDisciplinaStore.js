import { create } from 'zustand'
import { 
  listarDisciplinas, salvarDisciplina, atualizarDisciplina, deletarDisciplina,
  listarTutores, salvarTutor, atualizarTutor, deletarTutor,
  listarTarefas, salvarTarefa, atualizarTarefa, deletarTarefa,
  listarRegistrosEstudo, salvarRegistroEstudo,
  salvarMapaMental, obterMapaMental
} from '../firebase/firestore'

export const useDisciplinaStore = create((set, get) => ({
  disciplinas: [],
  tutores: [],
  tarefas: [],
  registrosEstudo: [],
  mapaMental: { nodes: [], connections: [] },
  isLoading: false,
  error: null,

  carregarTodosDados: async (usuarioId) => {
    if (!usuarioId) return
    set({ isLoading: true, error: null })
    try {
      const [dataDisciplinas, dataTutores, dataTarefas, dataRegistros] = await Promise.all([
        listarDisciplinas(usuarioId),
        listarTutores(usuarioId),
        listarTarefas(usuarioId),
        listarRegistrosEstudo(usuarioId)
      ])
      
      set({
        disciplinas: dataDisciplinas,
        tutores: dataTutores,
        tarefas: dataTarefas,
        registrosEstudo: dataRegistros,
        isLoading: false
      })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  limparDados: () => {
    set({
      disciplinas: [],
      tutores: [],
      tarefas: [],
      registrosEstudo: [],
      mapaMental: { nodes: [], connections: [] },
      isLoading: false,
      error: null
    })
  },

  // ============ DISCIPLINAS ============
  adicionarMateria: async (usuarioId, dados) => {
    set({ isLoading: true, error: null })
    try {
      await salvarDisciplina(usuarioId, dados)
      const atualizadas = await listarDisciplinas(usuarioId)
      set({ disciplinas: atualizadas, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  editarMateria: async (usuarioId, titulo, dados) => {
    set({ isLoading: true, error: null })
    try {
      await atualizarDisciplina(usuarioId, titulo, dados)
      const atualizadas = await listarDisciplinas(usuarioId)
      set({ disciplinas: atualizadas, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  removerMateria: async (usuarioId, titulo) => {
    set({ isLoading: true, error: null })
    try {
      await deletarDisciplina(usuarioId, titulo)
      const atualizadas = await listarDisciplinas(usuarioId)
      set({ disciplinas: atualizadas, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  // ============ TUTORES ============
  adicionarTutor: async (dados) => {
    set({ isLoading: true, error: null })
    try {
      await salvarTutor(dados)
      const atualizados = await listarTutores(dados.usuario_id)
      set({ tutores: atualizados, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  editarTutor: async (usuarioId, id, dados) => {
    set({ isLoading: true, error: null })
    try {
      await atualizarTutor(id, dados)
      const atualizados = await listarTutores(usuarioId)
      set({ tutores: atualizados, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  removerTutor: async (usuarioId, id) => {
    set({ isLoading: true, error: null })
    try {
      await deletarTutor(id)
      const atualizados = await listarTutores(usuarioId)
      set({ tutores: atualizados, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  // ============ TAREFAS ============
  adicionarTarefa: async (dados) => {
    set({ isLoading: true, error: null })
    try {
      await salvarTarefa(dados)
      const atualizadas = await listarTarefas(dados.usuario_id)
      set({ tarefas: atualizadas, isLoading: false })
      return true
    } catch (err) {
      console.error("Erro ao adicionar tarefa:", err)
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  editarTarefa: async (usuarioId, id, dados) => {
    set({ isLoading: true, error: null })
    try {
      await atualizarTarefa(id, dados)
      const atualizadas = await listarTarefas(usuarioId)
      set({ tarefas: atualizadas, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  removerTarefa: async (usuarioId, id) => {
    set({ isLoading: true, error: null })
    try {
      await deletarTarefa(id)
      const atualizadas = await listarTarefas(usuarioId)
      set({ tarefas: atualizadas, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  // ============ REGISTROS DE ESTUDO ============
  adicionarRegistroEstudo: async (dados) => {
    set({ isLoading: true, error: null })
    try {
      await salvarRegistroEstudo(dados)
      const atualizados = await listarRegistrosEstudo(dados.usuario_id)
      set({ registrosEstudo: atualizados, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  // ============ MAPA MENTAL ============
  carregarMapaMental: async (usuarioId) => {
    if (!usuarioId) return
    set({ isLoading: true, error: null })
    try {
      const data = await obterMapaMental(usuarioId)
      if (data) {
        set({ mapaMental: data, isLoading: false })
      } else {
        // Mapa padrão se não houver no banco
        set({ 
          mapaMental: {
            nodes: [
              { id: 1, label: 'Dev.Journey', x: 250, y: 180, color: '#3b82f6', desc: 'Conceito central de estudo focado' },
              { id: 2, label: 'Frontend', x: 100, y: 80, color: '#a855f7', desc: 'Vite, React 18, Zustand e CSS premium' },
              { id: 3, label: 'Backend', x: 400, y: 80, color: '#10b981', desc: 'Firebase Firestore local-first e Auth' },
              { id: 4, label: 'PWA', x: 100, y: 280, color: '#f59e0b', desc: 'Offline support, Service Workers, manifest' },
              { id: 5, label: 'Foco total', x: 400, y: 280, color: '#ef4444', desc: 'Método Pomodoro e cronômetro de estudo' }
            ],
            connections: [
              { from: 1, to: 2 },
              { from: 1, to: 3 },
              { from: 1, to: 4 },
              { from: 1, to: 5 }
            ]
          }, 
          isLoading: false 
        })
      }
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  salvarMapaMentalStore: async (usuarioId, nodes, connections) => {
    if (!usuarioId) return false
    set({ isLoading: true, error: null })
    try {
      const mapaData = { nodes, connections }
      await salvarMapaMental(usuarioId, mapaData)
      set({ mapaMental: mapaData, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.message, isLoading: false })
      return false
    }
  }
}))
