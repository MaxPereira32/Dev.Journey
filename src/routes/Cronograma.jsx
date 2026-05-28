import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../lib/stores/useAuthStore'
import { useDisciplinaStore } from '../lib/stores/useDisciplinaStore'
import { Plus, Search, Sparkles, Upload, Calendar as CalendarIcon, Clock, Bell, FileText, Check, Trash2, LayoutDashboard } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

export default function Cronograma() {
  const { user } = useAuthStore()
  const { tarefas, disciplinas, isLoading, carregarTodosDados, adicionarTarefa, editarTarefa, removerTarefa } = useDisciplinaStore()

  const [modalAberto, setModalAberto] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth())
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas')

  const [formData, setFormData] = useState({
    id: null,
    titulo: '',
    prioridade: 'media',
    descricao: '',
    data_limite: new Date().toISOString().split('T')[0],
    horario: '12:00',
    alarme: 'padrao',
    anexo: null,
    mostrar_dashboard: true,
    status: 'pendente'
  })

  useEffect(() => {
    if (user?.uid) {
      carregarTodosDados(user.uid)
    }
  }, [user, carregarTodosDados])

  const handleAbrirNovaTarefa = (dataPreenchida = null) => {
    setIsEditing(false)
    setFormData({
      id: null,
      titulo: '', prioridade: 'media', descricao: '', 
      data_limite: dataPreenchida || new Date().toISOString().split('T')[0], 
      horario: '12:00', alarme: 'padrao', anexo: null, mostrar_dashboard: true, status: 'pendente'
    })
    setModalAberto(true)
  }

  const handleAbrirEdicao = (tarefa, e) => {
    e.stopPropagation()
    setIsEditing(true)
    setFormData({
      id: tarefa.id,
      titulo: tarefa.titulo || '',
      prioridade: tarefa.prioridade || 'media',
      descricao: tarefa.descricao || '',
      data_limite: tarefa.data_limite || new Date().toISOString().split('T')[0],
      horario: tarefa.horario || '12:00',
      alarme: tarefa.alarme || 'padrao',
      anexo: tarefa.anexo || null,
      mostrar_dashboard: tarefa.mostrar_dashboard !== false, // default true
      status: tarefa.status || 'pendente'
    })
    setModalAberto(true)
  }

  const handleRefinarIA = () => {
    toast.success('IA refinando a descrição da tarefa...', { icon: '✨' })
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        descricao: prev.descricao ? `[Refinado pela IA]: ${prev.descricao} (com mais detalhes acadêmicos).` : 'Por favor, adicione uma descrição inicial para a IA refinar.'
      }))
    }, 1500)
  }

  const handleSimularUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, anexo: file.name })
      toast.success(`Arquivo ${file.name} sincronizado com o Drive virtual.`)
    }
  }

  const handleDelete = async () => {
    if (!formData.id || !user?.uid) return
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      const success = await removerTarefa(user.uid, formData.id)
      if (success) {
        toast.success('Tarefa excluída com sucesso!')
        setModalAberto(false)
      } else {
        toast.error('Erro ao excluir tarefa.')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.uid) return

    if (!formData.titulo.trim()) {
      toast.error('O título da tarefa é obrigatório!')
      return
    }

    const dados = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      prioridade: formData.prioridade,
      data_limite: formData.data_limite,
      horario: formData.horario,
      alarme: formData.alarme,
      anexo: formData.anexo,
      mostrar_dashboard: formData.mostrar_dashboard,
      status: formData.status,
      usuario_id: user.uid,
      cor: formData.prioridade === 'alta' ? '#EF4444' : formData.prioridade === 'media' ? '#F59E0B' : '#3B82F6'
    }

    let success = false
    if (isEditing && formData.id) {
      success = await editarTarefa(user.uid, formData.id, dados)
      if (success) toast.success('Tarefa atualizada com sucesso!')
    } else {
      success = await adicionarTarefa(dados)
      if (success) toast.success('Tarefa adicionada ao cronograma!')
    }

    if (success) {
      setModalAberto(false)
    } else {
      toast.error('Ocorreu um erro ao salvar a tarefa. Verifique sua conexão ou tente novamente.')
    }
  }

  // Lógica do Calendário (Mês atual)
  const mesAtual = filtroMes
  const anoAtual = new Date().getFullYear()
  const primeiroDiaDoMes = new Date(anoAtual, mesAtual, 1).getDay()
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate()
  
  const diasArray = Array.from({ length: 42 }, (_, i) => {
    const dia = i - primeiroDiaDoMes + 1
    if (dia > 0 && dia <= diasNoMes) return dia
    return null
  })

  // Filtrar tarefas
  const tarefasFiltradas = tarefas.filter(t => {
    if (busca && !t.titulo.toLowerCase().includes(busca.toLowerCase())) return false
    if (filtroStatus !== 'todos' && t.status !== filtroStatus) return false
    if (filtroPrioridade !== 'todas' && t.prioridade !== filtroPrioridade) return false
    return true
  })

  const getTarefasDoDia = (dia) => {
    if (!dia) return []
    const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return tarefasFiltradas.filter(t => t.data_limite === dataStr)
  }

  const mesesStr = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="space-y-6 pb-10">
      
      {/* Row Fixa no Topo: Filtros e Controles */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-900 border border-slate-800/80 p-4 rounded-2xl sticky top-0 z-10">
        
        <div className="relative w-full xl:w-64">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar tarefa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1 justify-center">
          <select 
            value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          >
            {mesesStr.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select 
            value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="todos">Status: Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="concluida">Concluídas</option>
          </select>
          <select 
            value={filtroPrioridade} onChange={e => setFiltroPrioridade(e.target.value)}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="todas">Prioridade: Todas</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <Button
          onClick={() => handleAbrirNovaTarefa()}
          className="bg-blue-600 hover:bg-blue-700 w-full xl:w-auto shrink-0"
          icon={Plus}
        >
          Adicionar Tarefa
        </Button>
      </div>

      {/* Área do Calendário */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-7 border-b border-slate-800/80 bg-slate-950/50">
          {diasSemana.map(dia => (
            <div key={dia} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {dia}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {diasArray.map((dia, i) => {
            const isHoje = dia === new Date().getDate() && mesAtual === new Date().getMonth() && anoAtual === new Date().getFullYear()
            const tarefasDia = getTarefasDoDia(dia)
            const dataDiaCell = dia ? `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}` : null
            
            return (
              <div 
                key={i} 
                onClick={() => dataDiaCell && handleAbrirNovaTarefa(dataDiaCell)}
                className={`min-h-[120px] p-2 border-b border-r border-slate-800/50 transition-colors ${!dia ? 'bg-slate-950/20' : 'hover:bg-slate-800/20 cursor-pointer'} ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
              >
                {dia && (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isHoje ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                        {dia}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {tarefasDia.slice(0, 3).map(t => (
                        <div 
                          key={t.id} 
                          onClick={(e) => handleAbrirEdicao(t, e)}
                          className="px-2 py-1 text-[10px] font-semibold rounded truncate hover:brightness-125 transition-all cursor-pointer"
                          style={{ backgroundColor: `${t.cor}20`, color: t.cor, borderLeft: `2px solid ${t.cor}` }}
                          title={t.titulo}
                        >
                          {t.titulo}
                        </div>
                      ))}
                      {tarefasDia.length > 3 && (
                        <div className="text-[10px] text-slate-500 text-center font-bold">
                          +{tarefasDia.length - 3} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Nova/Editar Tarefa com IA */}
      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title={isEditing ? "Visualizar / Editar Tarefa" : "Nova Tarefa"} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Linha 1 */}
          <div className="flex gap-4">
            <div className="flex-[7]">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Título da Tarefa *</label>
              <input
                type="text" required
                value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-[3]">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Prioridade</label>
              <select 
                value={formData.prioridade} onChange={e => setFormData({...formData, prioridade: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="baixa">🟢 Baixa</option>
                <option value="media">🟡 Média</option>
                <option value="alta">🔴 Alta</option>
              </select>
            </div>
          </div>

          {/* Linha 2 */}
          <div className="relative border border-purple-500/30 rounded-xl p-4 bg-purple-950/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Descrição Detalhada</label>
              <button 
                type="button" onClick={handleRefinarIA}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)]"
              >
                <Sparkles size={12} /> Refinador de IA
              </button>
            </div>
            <textarea
              rows={3}
              value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descreva a tarefa. Deixe a IA organizar os tópicos de estudo para você..."
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Linha 3 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2"><CalendarIcon size={14}/> Vencimento</label>
              <input
                type="date"
                value={formData.data_limite} onChange={e => setFormData({...formData, data_limite: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2"><Clock size={14}/> Horário do Alarme</label>
              <input
                type="time"
                value={formData.horario} onChange={e => setFormData({...formData, horario: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Linha 4 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2"><Bell size={14}/> Som do Alarme</label>
              <select 
                value={formData.alarme} onChange={e => setFormData({...formData, alarme: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="padrao">Chime Padrão 🔔</option>
                <option value="digital">Beep Digital 📟</option>
                <option value="lofi">Lofi Beats 🎵</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2"><LayoutDashboard size={14}/> Exibir no Dashboard?</label>
              <label className="flex items-center gap-3 w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.mostrar_dashboard} 
                  onChange={e => setFormData({...formData, mostrar_dashboard: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
                />
                <span className="text-sm font-medium">{formData.mostrar_dashboard ? 'Sim, exibir' : 'Não exibir'}</span>
              </label>
            </div>
          </div>

          {/* Linha 5 */}
          <div className="border border-dashed border-slate-700 bg-slate-900/50 rounded-xl p-4 text-center">
             <input type="file" id="anexo-upload" className="hidden" accept="*/*" onChange={handleSimularUpload} />
             <label htmlFor="anexo-upload" className="cursor-pointer flex flex-col items-center gap-2">
               <Upload size={24} className="text-slate-500" />
               <span className="text-sm font-semibold text-slate-300">Anexar Material de Estudo</span>
               <span className="text-[10px] text-slate-500">PDF, Imagens ou Documentos (Sincroniza via GDrive)</span>
             </label>
             {formData.anexo && (
               <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 py-1.5 px-3 rounded-lg w-fit mx-auto">
                 <FileText size={14} /> {formData.anexo}
               </div>
             )}
          </div>

          <div className="pt-4 flex gap-3">
            {isEditing && (
              <Button type="button" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 flex-1" icon={Trash2}>
                Excluir
              </Button>
            )}
            {!isEditing && (
               <Button type="button" variant="secondary" onClick={() => setModalAberto(false)} className="flex-1">Cancelar</Button>
            )}
            <Button type="submit" variant="primary" className="flex-[2]" icon={Check}>
              {isEditing ? 'Salvar Alterações' : 'Salvar Tarefa'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
