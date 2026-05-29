import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../lib/stores/useAuthStore'
import { useDisciplinaStore } from '../lib/stores/useDisciplinaStore'
import { Calendar, Play, CheckCircle, BookOpen, ChevronRight, Check } from 'lucide-react'
import Card from '../components/ui/Card'
import { Cronometro } from '../components/dashboard/Cronometro'

const formatarData = (dataStr) => {
  if (!dataStr) return 'Sem data'
  try {
    const [ano, mes, dia] = dataStr.split('-').map(Number)
    const dataObj = new Date(ano, mes - 1, dia)
    
    const hoje = new Date()
    const amanha = new Date()
    amanha.setDate(hoje.getDate() + 1)
    
    hoje.setHours(0, 0, 0, 0)
    amanha.setHours(0, 0, 0, 0)
    dataObj.setHours(0, 0, 0, 0)
    
    if (hoje.getTime() === dataObj.getTime()) {
      return 'Hoje'
    }
    
    if (amanha.getTime() === dataObj.getTime()) {
      return 'Amanhã'
    }
    
    return dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  } catch (e) {
    return dataStr
  }
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { 
    disciplinas, 
    tarefas, 
    carregarTodosDados,
  } = useDisciplinaStore()

  const [showCronometro, setShowCronometro] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      carregarTodosDados(user.uid)
    }
  }, [user, carregarTodosDados])

  // Dados Calculados
  const totalHoras = disciplinas.reduce((acc, curr) => acc + (Number(curr.horas_registradas) || 0), 0)
  const tarefasPendentes = tarefas.filter(t => t.status === 'pendente' && t.mostrar_dashboard !== false)
  
  // Calcula exercícios a partir das disciplinas
  const totalExercicios = disciplinas.reduce((acc, disc) => acc + (disc.exercicios?.length || 0), 0)
  const exerciciosConcluidos = disciplinas.reduce((acc, disc) => acc + (disc.exercicios_resolvidos || 0), 0)
  const progressoExercicios = totalExercicios > 0 ? Math.round((exerciciosConcluidos / totalExercicios) * 100) : 0

  return (
    <div className="space-y-8 pb-10">
      {/* Cabeçalho */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-100">
            Olá, {user?.nome || 'Estudante'}
          </h2>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <Calendar size={16} />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex flex-col items-end">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Desempenho Geral</span>
          <span className="text-xl font-bold text-emerald-300">Excelente</span>
        </div>
      </div>

      {/* Bloco 1: Linha de Métricas (Top Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Horas */}
        <Card hoverEffect={false} className="relative overflow-hidden border-slate-800/60 p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Horas Estudadas</span>
            <button 
              onClick={() => setShowCronometro(true)}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all group-hover:scale-110"
            >
              <Play size={18} className="ml-1" />
            </button>
          </div>
          <div className="text-5xl font-display font-bold text-slate-100">
            {totalHoras.toFixed(1)}<span className="text-2xl text-slate-500 ml-1">h</span>
          </div>
        </Card>

        {/* Card 2: Pendências */}
        <Card hoverEffect={false} className="border-slate-800/60 p-6 flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pendências</span>
          </div>
          <div className="text-5xl font-display font-bold text-orange-400">
            {tarefasPendentes.length}
          </div>
        </Card>

        {/* Card 3: Exercícios */}
        <Card hoverEffect={false} className="border-slate-800/60 p-6 flex flex-col justify-between">
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Exercícios</span>
            <span className="text-sm font-bold text-purple-400">{exerciciosConcluidos} / {totalExercicios}</span>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-slate-100 mb-3">
              {progressoExercicios}%
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all" 
                style={{ width: `${progressoExercicios}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Bloco 2: Divisão de Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Coluna Esquerda: Matérias */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold font-display text-slate-100">Matérias em Andamento</h3>
            <button className="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center">Ver todas <ChevronRight size={16}/></button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {disciplinas.length > 0 ? disciplinas.slice(0, 4).map(disc => {
              const perc = Math.min((disc.horas_registradas / 100) * 100, 100) || 0
              const strokeDasharray = 2 * Math.PI * 28 // r=28
              const strokeDashoffset = strokeDasharray - (perc / 100) * strokeDasharray

              return (
                <div key={disc.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-200 truncate max-w-[120px]" title={disc.titulo_materia}>{disc.titulo_materia}</h4>
                    <p className="text-xs text-slate-500 mt-1">{Number(disc.horas_registradas || 0).toFixed(1)}h estudadas</p>
                  </div>
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="6" />
                      <circle 
                        cx="32" cy="32" r="28" fill="none" 
                        stroke="#3b82f6" strokeWidth="6" 
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-slate-300">{Math.round(perc)}%</span>
                  </div>
                </div>
              )
            }) : (
              <div className="col-span-2 text-center p-8 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-sm">
                Nenhuma matéria cadastrada.
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Agenda Rápida */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold font-display text-slate-100">Agenda Rápida</h3>
            <button className="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center">Abrir Calendário <ChevronRight size={16}/></button>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4">
            <ul className="space-y-3">
              {tarefasPendentes.length > 0 ? tarefasPendentes.slice(0, 5).map(tarefa => (
                <li key={tarefa.id} className="flex items-start gap-3.5 p-3.5 hover:bg-slate-800/40 rounded-xl transition-all group cursor-pointer border border-transparent hover:border-slate-800">
                  <div className="w-5 h-5 rounded-md border border-slate-700 flex items-center justify-center group-hover:border-blue-500/80 bg-slate-950 mt-0.5 shrink-0 transition-colors">
                    <Check size={12} className="text-blue-500 opacity-0 group-hover:opacity-75 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">
                        {tarefa.titulo}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                        tarefa.prioridade === 'alta' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        tarefa.prioridade === 'media' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {tarefa.prioridade?.toUpperCase() || 'NORMAL'}
                      </span>
                    </div>
                    {tarefa.descricao && (
                      <p className="text-xs text-slate-400/80 line-clamp-1 leading-relaxed">
                        {tarefa.descricao}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium pt-0.5">
                      <span className="flex items-center gap-1 bg-slate-850 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400 shrink-0">
                        <Calendar size={10} />
                        {formatarData(tarefa.data_limite)}
                      </span>
                      {tarefa.horario && (
                        <span className="text-slate-500/80 font-normal">
                          🕒 {tarefa.horario}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              )) : (
                 <li className="text-center p-6 text-slate-500 text-sm">Tudo limpo por hoje! 🎉</li>
              )}
            </ul>
          </div>
        </div>

      </div>

      {/* Modal do Cronômetro */}
      {showCronometro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md">
             <button 
               onClick={() => setShowCronometro(false)}
               className="absolute -top-12 right-0 text-slate-400 hover:text-white"
             >
               Fechar ✕
             </button>
             <Cronometro disciplinas={disciplinas} onRegistroSalvo={() => {}} />
          </div>
        </div>
      )}

    </div>
  )
}
