import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import Card from '../ui/Card'

export default function GraficoProgresso({ disciplinas = [], registrosEstudo = [] }) {
  // 1. Histórico semanal de estudos
  const processarDadosSemanais = () => {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const hoje = new Date()
    
    // Inicializar os últimos 7 dias
    const dados = Array.from({ length: 7 }).map((_, i) => {
      const data = new Date()
      data.setDate(hoje.getDate() - i)
      const dataStr = data.toISOString().split('T')[0]
      return {
        key: dataStr,
        label: diasSemana[data.getDay()],
        horas: 0
      }
    }).reverse()

    // Somar registros por dia
    registrosEstudo.forEach(registro => {
      const registroData = registro.data
      const diaEncontrado = dados.find(d => d.key === registroData)
      if (diaEncontrado) {
        diaEncontrado.horas += Number(registro.horas) || 0
      }
    })

    return dados
  }

  // 2. Distribuição por disciplina
  const processarDadosDisciplinas = () => {
    return disciplinas
      .filter(d => (Number(d.horas_registradas) || 0) > 0)
      .map(d => ({
        name: d.titulo_materia,
        value: Number(d.horas_registradas) || 0,
        color: d.cor || '#3b82f6'
      }))
  }

  const dadosSemanais = processarDadosSemanais()
  const dadosDisciplinas = processarDadosDisciplinas()

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl">
          <p className="text-xs font-semibold text-slate-400">{payload[0].payload.key || 'Data'}</p>
          <p className="text-sm font-bold text-blue-450 mt-1">{`${payload[0].value.toFixed(2)}h estudadas`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
      {/* Gráfico de Histórico Semanal */}
      <Card hoverEffect={false} className="lg:col-span-2 border-slate-800/60 p-6 flex flex-col">
        <div className="mb-4">
          <h4 className="text-base font-bold font-display text-slate-200">Histórico de Estudos Semanal</h4>
          <p className="text-xs text-slate-450">Horas de estudo produtivas nos últimos 7 dias</p>
        </div>
        <div className="h-64 w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dadosSemanais} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="horas" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorHoras)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Distribuição por Disciplina */}
      <Card hoverEffect={false} className="border-slate-800/60 p-6 flex flex-col">
        <div className="mb-4">
          <h4 className="text-base font-bold font-display text-slate-200">Distribuição de Matérias</h4>
          <p className="text-xs text-slate-450">Foco de estudo por tema</p>
        </div>
        
        {dadosDisciplinas.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
            <span className="text-3xl mb-2">📊</span>
            <p className="text-xs text-slate-400">Nenhum tempo de estudo registrado ainda.</p>
          </div>
        ) : (
          <div className="h-64 w-full flex-1 flex flex-col justify-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosDisciplinas}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dadosDisciplinas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(1)}h`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 overflow-y-auto max-h-24 space-y-1.5 scrollbar">
              {dadosDisciplinas.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-350 truncate max-w-[130px]">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-slate-200">{entry.value.toFixed(1)}h</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
