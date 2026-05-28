import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../lib/stores/useAuthStore'
import { useDisciplinaStore } from '../lib/stores/useDisciplinaStore'
import { Plus, Search, ChevronDown, ChevronUp, ChevronRight, Edit, Trash2, CheckSquare, Code, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import PremiumCodeBlock from '../components/PremiumCodeBlock'

export default function Disciplinas() {
  const { user } = useAuthStore()
  const { disciplinas, isLoading, carregarTodosDados, adicionarMateria, editarMateria, removerMateria } = useDisciplinaStore()

  const [busca, setBusca] = useState('')
  const [modalMateria, setModalMateria] = useState(false)
  const [modalExercicio, setModalExercicio] = useState(false)
  const [editandoTitulo, setEditandoTitulo] = useState(null)
  const [editandoExercicioId, setEditandoExercicioId] = useState(null)
  
  const [expandedId, setExpandedId] = useState(null)
  const [disciplinaAlvoExercicio, setDisciplinaAlvoExercicio] = useState(null)

  const [formData, setFormData] = useState({
    titulo_materia: '',
    descricao: '',
    etapas: '',
    meta_horas: 100
  })

  const [exercicioData, setExercicioData] = useState({
    linguagem: 'javascript',
    enunciado: '',
    codigo: '// Escreva sua solução aqui...\n'
  })

  useEffect(() => {
    if (user?.uid) {
      carregarTodosDados(user.uid)
    }
  }, [user, carregarTodosDados])

  const disciplinasFiltradas = disciplinas.filter(d => 
    d.titulo_materia.toLowerCase().includes(busca.toLowerCase())
  )

  const handleSalvarMateria = async (e) => {
    e.preventDefault()
    if (!user?.uid) return
    if (!formData.titulo_materia.trim()) {
      toast.error('Título obrigatório')
      return
    }

    // Convertendo etapas de string para array de objetos se for nova inserção
    const arrayEtapas = formData.etapas.split(',').map(e => e.trim()).filter(e => e !== '')
    const etapasObj = arrayEtapas.map(texto => ({ id: Date.now() + Math.random(), texto, concluida: false }))

    const dados = {
      titulo_materia: formData.titulo_materia,
      descricao: formData.descricao,
      meta_horas: Number(formData.meta_horas) || 100,
      ...(editandoTitulo ? {} : { etapas: etapasObj }) // Só sobrescreve etapas se for nova
    }

    let success = false
    if (editandoTitulo) {
      success = await editarMateria(user.uid, editandoTitulo, dados)
      if (success) toast.success('Matéria atualizada!')
    } else {
      success = await adicionarMateria(user.uid, dados)
      if (success) toast.success('Matéria cadastrada!')
    }

    if (success) {
      setModalMateria(false)
      setEditandoTitulo(null)
      setFormData({ titulo_materia: '', descricao: '', etapas: '', meta_horas: 100 })
    }
  }

  const handleSalvarExercicio = async (e) => {
    e.preventDefault()
    if (!user?.uid || !disciplinaAlvoExercicio) return

    const materia = disciplinas.find(d => d.titulo_materia === disciplinaAlvoExercicio)
    if (!materia) return

    let novosExercicios
    if (editandoExercicioId) {
      novosExercicios = (materia.exercicios || []).map(ex => 
        ex.id === editandoExercicioId ? { ...ex, ...exercicioData } : ex
      )
    } else {
      const novoExercicio = {
        id: Date.now() + Math.random(),
        linguagem: exercicioData.linguagem,
        enunciado: exercicioData.enunciado,
        codigo: exercicioData.codigo,
        data_criacao: new Date().toISOString()
      }
      novosExercicios = [...(materia.exercicios || []), novoExercicio]
    }

    const success = await editarMateria(user.uid, materia.titulo_materia, { exercicios: novosExercicios })
    
    if (success) {
      toast.success(editandoExercicioId ? 'Exercício atualizado com sucesso!' : 'Exercício salvo com sucesso!')
      setModalExercicio(false)
      setExercicioData({ linguagem: 'javascript', enunciado: '', codigo: '// Escreva sua solução aqui...\n' })
    } else {
      toast.error('Erro ao salvar exercício.')
    }
  }

  const handleExcluirExercicio = async () => {
    if (!user?.uid || !disciplinaAlvoExercicio || !editandoExercicioId) return
    if (!window.confirm("Deseja realmente excluir este exercício?")) return

    const materia = disciplinas.find(d => d.titulo_materia === disciplinaAlvoExercicio)
    if (!materia) return

    const novosExercicios = (materia.exercicios || []).filter(ex => ex.id !== editandoExercicioId)
    const success = await editarMateria(user.uid, materia.titulo_materia, { exercicios: novosExercicios })
    
    if (success) {
      toast.success('Exercício excluído com sucesso!')
      setModalExercicio(false)
    } else {
      toast.error('Erro ao excluir exercício.')
    }
  }

  const handleAbrirEdicaoExercicio = (e, disciplinaTitulo, ex) => {
    e.stopPropagation()
    setDisciplinaAlvoExercicio(disciplinaTitulo)
    setEditandoExercicioId(ex.id)
    setExercicioData({
      linguagem: ex.linguagem,
      enunciado: ex.enunciado,
      codigo: ex.codigo
    })
    setModalExercicio(true)
  }

  const toggleAccordion = (id) => {
    if (expandedId === id) setExpandedId(null)
    else setExpandedId(id)
  }

  const handleToggleEtapa = async (materia, etapaId) => {
    if (!user?.uid) return
    const novasEtapas = materia.etapas.map(e => e.id === etapaId ? { ...e, concluida: !e.concluida } : e)
    await editarMateria(user.uid, materia.titulo_materia, { etapas: novasEtapas })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Barra de Ações (Topo) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800/80 p-4 rounded-2xl">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar matérias..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <Button
          onClick={() => {
            setEditandoTitulo(null)
            setFormData({ titulo_materia: '', descricao: '', etapas: '', meta_horas: 100 })
            setModalMateria(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          icon={Plus}
        >
          Nova Matéria
        </Button>
      </div>

      {/* Lista de Cursos (Accordion) */}
      <div className="space-y-4">
        {disciplinasFiltradas.length === 0 ? (
          <div className="text-center p-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-4xl mb-4 block">📚</span>
            <p className="text-slate-400">Nenhuma matéria encontrada.</p>
          </div>
        ) : (
          disciplinasFiltradas.map(materia => {
            const isExpanded = expandedId === materia.id
            const horas = Number(materia.horas_registradas || 0)
            
            return (
              <div key={materia.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-200">
                
                {/* Accordion Header */}
                <div 
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/30 transition-colors gap-4"
                  onClick={() => toggleAccordion(materia.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold font-display text-slate-100">{materia.titulo_materia}</h3>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditandoTitulo(materia.titulo_materia)
                            setFormData({
                              titulo_materia: materia.titulo_materia,
                              descricao: materia.descricao || '',
                              etapas: '',
                              meta_horas: materia.meta_horas || 100
                            })
                            setModalMateria(true)
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                          title="Editar matéria"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (!user?.uid) return
                            if (window.confirm(`Tem certeza que deseja excluir a matéria "${materia.titulo_materia}"?`)) {
                              await removerMateria(user.uid, materia.titulo_materia)
                              toast.success('Matéria excluída com sucesso!')
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Excluir matéria"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {materia.descricao && <p className="text-sm text-slate-400 mt-1 line-clamp-1">{materia.descricao}</p>}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Carga Horária</span>
                      <span className="text-base font-bold text-blue-400">{horas.toFixed(1)}h / {materia.meta_horas}h</span>
                    </div>
                    {isExpanded ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800/80 bg-slate-950/30 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Área de Etapas */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <CheckSquare size={16} className="text-emerald-500" />
                        Roteiro de Estudos (Etapas)
                      </h4>
                      <div className="space-y-2">
                        {(!materia.etapas || materia.etapas.length === 0) ? (
                          <p className="text-xs text-slate-500">Nenhuma etapa definida.</p>
                        ) : (
                          materia.etapas.map(etapa => (
                            <label key={etapa.id} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={etapa.concluida}
                                onChange={() => handleToggleEtapa(materia, etapa.id)}
                                className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800"
                              />
                              <span className={`text-sm flex-1 ${etapa.concluida ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                                {etapa.texto}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Área de Exercícios */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <Code size={16} className="text-purple-500" />
                          Exercícios Práticos
                        </h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setDisciplinaAlvoExercicio(materia.titulo_materia)
                            setEditandoExercicioId(null)
                            setExercicioData({ linguagem: 'javascript', enunciado: '', codigo: '// Escreva sua solução aqui...\n' })
                            setModalExercicio(true)
                          }}
                          className="text-xs font-semibold bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus size={14} /> Adicionar Exercício
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(!materia.exercicios || materia.exercicios.length === 0) ? (
                          <div className="p-6 border border-dashed border-slate-800 rounded-xl text-center">
                            <p className="text-sm text-slate-500">Você ainda não resolveu exercícios nesta matéria.</p>
                          </div>
                        ) : (
                          materia.exercicios.map(ex => (
                            <div 
                              key={ex.id} 
                              onClick={(e) => handleAbrirEdicaoExercicio(e, materia.titulo_materia, ex)} 
                              className="p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors group"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{ex.linguagem}</span>
                                <span className="text-xs font-semibold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  Visualizar/Editar <ChevronRight size={14} />
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 font-semibold line-clamp-2">{ex.enunciado}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal Adicionar/Editar Matéria */}
      <Modal isOpen={modalMateria} onClose={() => setModalMateria(false)} title={editandoTitulo ? "Editar Matéria" : "Nova Matéria"}>
        <form onSubmit={handleSalvarMateria} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Título</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl w-full focus:outline-none focus:border-blue-500"
              value={formData.titulo_materia}
              onChange={e => setFormData({...formData, titulo_materia: e.target.value})}
              disabled={!!editandoTitulo}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Descrição</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl w-full focus:outline-none focus:border-blue-500 resize-none"
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
            />
          </div>
          {!editandoTitulo && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Etapas (Separe por vírgula)</label>
              <input
                type="text"
                placeholder="Ex: Introdução, Variaveis, Funções"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl w-full focus:outline-none focus:border-blue-500"
                value={formData.etapas}
                onChange={e => setFormData({...formData, etapas: e.target.value})}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Meta de Horas</label>
            <input
              type="number"
              min="1"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl w-full focus:outline-none focus:border-blue-500"
              value={formData.meta_horas}
              onChange={e => setFormData({...formData, meta_horas: e.target.value})}
            />
          </div>
          <div className="pt-4 flex gap-3">
             <Button variant="secondary" onClick={() => setModalMateria(false)} className="flex-1">Cancelar</Button>
             <Button type="submit" variant="primary" className="flex-1">Salvar Matéria</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Formulário de Exercício */}
      <Modal isOpen={modalExercicio} onClose={() => setModalExercicio(false)} title={`Novo Exercício (${disciplinaAlvoExercicio})`} maxWidth="max-w-3xl">
         <form onSubmit={handleSalvarExercicio} className="space-y-4">
           <div className="flex gap-4">
             <div className="w-1/3">
               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Linguagem</label>
               <select 
                 className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                 value={exercicioData.linguagem}
                 onChange={e => setExercicioData({...exercicioData, linguagem: e.target.value})}
               >
                 <option value="javascript">JavaScript</option>
                 <option value="typescript">TypeScript</option>
                 <option value="python">Python</option>
                 <option value="html">HTML</option>
                 <option value="css">CSS</option>
                 <option value="java">Java</option>
                 <option value="csharp">C#</option>
                 <option value="sql">SQL</option>
               </select>
             </div>
             <div className="w-2/3">
               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Enunciado / Problema</label>
               <textarea
                 rows={2}
                 required
                 placeholder="Descreva o que deve ser resolvido..."
                 className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                 value={exercicioData.enunciado}
                 onChange={e => setExercicioData({...exercicioData, enunciado: e.target.value})}
               />
             </div>
           </div>

           <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Bloco de Código (Resposta)</span>
                <span className="text-[10px] text-blue-400 bg-blue-900/30 px-2 rounded-md">Powered by Monaco Editor</span>
              </label>
              <PremiumCodeBlock 
                language={exercicioData.linguagem}
                value={exercicioData.codigo}
                onChange={value => setExercicioData({...exercicioData, codigo: value})}
              />
           </div>

           <div className="pt-4 flex gap-3 justify-end">
             {editandoExercicioId && (
               <Button type="button" onClick={handleExcluirExercicio} className="bg-red-600 hover:bg-red-700 flex-1" icon={Trash2}>
                 Excluir
               </Button>
             )}
             {!editandoExercicioId && (
               <Button type="button" variant="secondary" onClick={() => setModalExercicio(false)} className="flex-1">Cancelar</Button>
             )}
             <Button type="submit" variant="primary" icon={Check} className="bg-purple-600 hover:bg-purple-700 flex-[2]">
               {editandoExercicioId ? 'Salvar Alterações' : 'Salvar Exercício'}
             </Button>
           </div>
         </form>
      </Modal>

    </div>
  )
}
