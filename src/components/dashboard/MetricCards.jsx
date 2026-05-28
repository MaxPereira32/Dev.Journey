import React from 'react'
import { Clock, BookOpen, CheckSquare, Users } from 'lucide-react'
import Card from '../ui/Card'

export default function MetricCards({ disciplinas = [], tarefas = [], tutores = [] }) {
  const totalHoras = disciplinas.reduce((acc, curr) => acc + (Number(curr.horas_registradas) || 0), 0)
  
  const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida').length
  const totalTarefas = tarefas.length

  const stats = [
    {
      title: 'Tempo de Estudo',
      value: `${totalHoras.toFixed(1)}h`,
      label: 'Tempo total acumulado',
      icon: Clock,
      color: 'text-blue-400 bg-blue-500/10'
    },
    {
      title: 'Disciplinas',
      value: disciplinas.length,
      label: 'Matérias cadastradas',
      icon: BookOpen,
      color: 'text-purple-400 bg-purple-500/10'
    },
    {
      title: 'Tarefas Diárias',
      value: `${tarefasConcluidas}/${totalTarefas}`,
      label: 'Cronograma concluído',
      icon: CheckSquare,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      title: 'Tutores',
      value: tutores.length,
      label: 'Mentores acadêmicos',
      icon: Users,
      color: 'text-orange-400 bg-orange-500/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <Card key={i} className="flex items-center gap-4.5 p-6 border-slate-800/60" hoverEffect={false}>
            <div className={`p-3.5 rounded-xl ${stat.color} shadow-inner`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-450 uppercase tracking-wider">{stat.title}</p>
              <h4 className="text-2xl font-bold font-display text-slate-100 mt-1 leading-none">{stat.value}</h4>
              <p className="text-[10px] text-slate-550 mt-1.5 font-medium">{stat.label}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
