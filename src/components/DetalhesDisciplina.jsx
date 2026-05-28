import React, { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2, Clock, BookOpen, Save, Target, Check } from 'lucide-react'
import { useAuthStore } from '../lib/stores/useAuthStore'
import { useDisciplinaStore } from '../lib/stores/useDisciplinaStore'
import Button from './ui/Button'
import Card from './ui/Card'
import Modal from './ui/Modal'
import toast from 'react-hot-toast'

export default function DetalhesDisciplina({ tituloMateria, onBack }) {
  const { user } = useAuthStore()
  const { disciplinas, editarMateria, adicionarRegistroEstudo } = useDisciplinaStore()
  
  // Encontrar a matéria atualizada da store
  const materia = disciplinas.find(d => d.titulo_materia === tituloMateria)

  const [etapas, setEtapas] = useState([])
  const [novaEtapa, setNovaEtapa] = useState('')
  const [notas, setNotas] = useState('')
  const [exercicios, setExercicios] = useState(0)

  const [modalHorasAberto, setModalHorasAberto] = useState(false)
  const [horasLog, setHorasLog] = useState('')
  const [minutosLog, setMinutosLog] = useState('')

  // Sincronizar estado local quando a matéria carregar ou mudar
  useEffect(() => {
    if (materia) {
      setEtapas(materia.etapas || [])
      setNotas(materia.notas || '')
      setExercicios(materia.exercicios_resolvidos || 0)
    }
  }, [materia])

  if (!materia) return null

  const progressoTotal = Math.min(((materia.horas_registradas || 0) / (materia.meta_horas || 100)) * 100, 100)

  const salvarAlteracoes = async (novosDados) => {
    if (!user) return
    await editarMateria(user.uid, materia.titulo_materia, novosDados)
  }

  const handleAddEtapa = async (e) => {
    e.preventDefault()
    if (!novaEtapa.trim()) return
    const novaLista = [...etapas, { id: Date.now().toString(), texto: novaEtapa, concluida: false }]
    setEtapas(novaLista)
    setNovaEtapa('')
    await salvarAlteracoes({ etapas: novaLista })
  }

  const toggleEtapa = async (id) => {
    const novaLista = etapas.map(e => e.id === id ? { ...e, concluida: !e.concluida } : e)
    setEtapas(novaLista)
    await salvarAlteracoes({ etapas: novaLista })
  }

  const removerEtapa = async (id) => {
    const novaLista = etapas.filter(e => e.id !== id)
    setEtapas(novaLista)
    await salvarAlteracoes({ etapas: novaLista })
  }

  const handleSalvarNotas = async () => {
    await salvarAlteracoes({ notas })
    toast.success('Notas salvas com sucesso!')
  }

  const handleUpdateExercicios = async (valor) => {
    const novoValor = Math.max(0, exercicios + valor)
    setExercicios(novoValor)
    await salvarAlteracoes({ exercicios_resolvidos: novoValor })
  }

  const handleLogarHoras = async (e) => {
    e.preventDefault()
    const h = parseInt(horasLog) || 0
    const m = parseInt(minutosLog) || 0
    const totalHoras = h + (m / 60)
    
    if (totalHoras <= 0) {
      toast.error('Insira um tempo válido')
      return
    }

    const novasHoras = (materia.horas_registradas || 0) + totalHoras

    // Atualiza materia
    await salvarAlteracoes({ horas_registradas: novasHoras })
    
    // Adiciona registro
    await adicionarRegistroEstudo({
      usuario_id: user.uid,
      disciplina: materia.titulo_materia,
      duracao: totalHoras, // em horas
      tipo: 'manual',
      data: new Date().toISOString().split('T')[0]
    })

    toast.success('Horas registradas com sucesso!')
    setModalHorasAberto(false)
    setHorasLog('')
    setMinutosLog('')
  }

  const progressoEtapas = etapas.length > 0 
    ? Math.round((etapas.filter(e => e.concluida).length / etapas.length) * 100) 
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]" 
              style={{ backgroundColor: materia.cor || '#3b82f6', boxShadow: `0 0 15px ${materia.cor || '#3b82f6'}80` }}
            />
            <h2 className="text-3xl font-bold font-display text-slate-100">{materia.titulo_materia}</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            {materia.professor ? `Prof. ${materia.professor}` : 'Sem professor registrado'}
            {materia.sala_aula && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span>Sala: {materia.sala_aula}</span>
              </>
            )}
          </p>
        </div>
        <Button 
          onClick={() => setModalHorasAberto(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          icon={Clock}
        >
          Logar Horas
        </Button>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Checklist e Infos */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de Progresso */}
          <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target size={16} className="text-blue-500" />
              Progresso Geral
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Horas ({Number(materia.horas_registradas || 0).toFixed(1)}h / {materia.meta_horas}h)</span>
                  <span className="font-bold text-slate-200">{Math.round(progressoTotal)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000"
                    style={{ width: `${progressoTotal}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Etapas Concluídas</span>
                  <span className="font-bold text-slate-200">{progressoEtapas}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000"
                    style={{ width: `${progressoEtapas}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800/60">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 flex items-center gap-2">
                  <BookOpen size={16} />
                  Exercícios Resolvidos
                </span>
                <div className="flex items-center gap-3 bg-slate-950 rounded-lg p-1 border border-slate-800">
                  <button onClick={() => handleUpdateExercicios(-1)} className="w-8 h-8 rounded-md bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors">-</button>
                  <span className="w-8 text-center font-bold text-slate-200">{exercicios}</span>
                  <button onClick={() => handleUpdateExercicios(1)} className="w-8 h-8 rounded-md bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors">+</button>
                </div>
              </div>
            </div>
          </Card>

          {/* Checklist de Etapas */}
          <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Checklist de Estudo
            </h3>
            
            <form onSubmit={handleAddEtapa} className="flex gap-2 mb-4">
              <input
                type="text"
                value={novaEtapa}
                onChange={(e) => setNovaEtapa(e.target.value)}
                placeholder="Adicionar nova etapa..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!novaEtapa.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-4 flex items-center justify-center transition-colors"
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {etapas.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhuma etapa cadastrada. Quebre seu estudo em pequenos passos!</p>
              ) : (
                etapas.map(etapa => (
                  <div 
                    key={etapa.id} 
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                      etapa.concluida 
                        ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-200/70' 
                        : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => toggleEtapa(etapa.id)}
                    >
                      {etapa.concluida ? (
                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      )}
                      <span className={`text-sm ${etapa.concluida ? 'line-through decoration-emerald-900/50' : ''}`}>
                        {etapa.texto}
                      </span>
                    </div>
                    <button 
                      onClick={() => removerEtapa(etapa.id)}
                      className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Coluna Direita: Bloco de Notas */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-800/80 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-purple-500" />
                Bloco de Notas da Disciplina
              </h3>
              <Button 
                onClick={handleSalvarNotas}
                variant="secondary"
                size="sm"
                icon={Save}
                className="text-xs"
              >
                Salvar Notas
              </Button>
            </div>
            
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Anotações importantes, links úteis, resumos rápidos..."
              className="flex-1 w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-purple-500 transition-colors resize-none font-mono"
              style={{ minHeight: '400px' }}
            />
          </Card>
        </div>
      </div>

      {/* Modal de Log Manual de Horas */}
      <Modal 
        isOpen={modalHorasAberto} 
        onClose={() => setModalHorasAberto(false)} 
        title="⏱️ Log Manual de Horas"
      >
        <form onSubmit={handleLogarHoras} className="space-y-4">
          <p className="text-sm text-slate-400 mb-4">
            Esqueceu de ligar o cronômetro? Adicione manualmente o tempo que você estudou para manter suas metas atualizadas.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Horas</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={horasLog}
                onChange={(e) => setHorasLog(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Minutos</label>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={minutosLog}
                onChange={(e) => setMinutosLog(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalHorasAberto(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              icon={Check}
            >
              Registrar Tempo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
