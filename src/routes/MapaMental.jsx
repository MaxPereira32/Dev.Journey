import React, { useState, useEffect, useCallback } from 'react'
import { Brain, Filter } from 'lucide-react'
import { useAuthStore } from '../lib/stores/useAuthStore'
import { useDisciplinaStore } from '../lib/stores/useDisciplinaStore'
import ReactFlow, { 
  Background, 
  Controls, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'

export default function MapaMental() {
  const { user } = useAuthStore()
  const { disciplinas, carregarTodosDados } = useDisciplinaStore()

  const [disciplinaFoco, setDisciplinaFoco] = useState('')
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  useEffect(() => {
    if (user?.uid) {
      carregarTodosDados(user.uid)
    }
  }, [user, carregarTodosDados])

  // Quando a disciplina filtro mudar, reconstruímos o mapa
  useEffect(() => {
    if (!disciplinas.length) return
    
    // Se não tiver selecionado, seleciona a primeira
    if (!disciplinaFoco && disciplinas[0]) {
      setDisciplinaFoco(disciplinas[0].titulo_materia)
      return
    }

    const materiaAtual = disciplinas.find(d => d.titulo_materia === disciplinaFoco)
    if (!materiaAtual) return

    // Nodo Central (A matéria)
    const initialNodes = [
      {
        id: 'central',
        data: { label: materiaAtual.titulo_materia },
        position: { x: 400, y: 250 },
        style: {
          background: materiaAtual.cor || '#3b82f6',
          color: '#fff',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '12px',
          padding: '15px 30px',
          boxShadow: `0 0 20px ${(materiaAtual.cor || '#3b82f6')}80`
        }
      }
    ]

    const initialEdges = []

    // Nodos das etapas
    if (materiaAtual.etapas && materiaAtual.etapas.length > 0) {
      const radius = 200
      const angleStep = (2 * Math.PI) / materiaAtual.etapas.length

      materiaAtual.etapas.forEach((etapa, idx) => {
        const angle = idx * angleStep
        const x = 400 + radius * Math.cos(angle)
        const y = 250 + radius * Math.sin(angle)

        initialNodes.push({
          id: `etapa-${etapa.id}`,
          data: { label: etapa.texto },
          position: { x, y },
          style: {
            background: etapa.concluida ? '#064e3b' : '#1e293b',
            color: etapa.concluida ? '#34d399' : '#cbd5e1',
            border: `1px solid ${etapa.concluida ? '#059669' : '#334155'}`,
            borderRadius: '8px',
            padding: '10px 15px',
            width: 150,
            textAlign: 'center'
          }
        })

        initialEdges.push({
          id: `edge-${etapa.id}`,
          source: 'central',
          target: `etapa-${etapa.id}`,
          animated: true,
          style: { stroke: etapa.concluida ? '#10b981' : '#475569', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: etapa.concluida ? '#10b981' : '#475569',
          },
        })
      })
    }

    setNodes(initialNodes)
    setEdges(initialEdges)

  }, [disciplinaFoco, disciplinas])

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  )

  return (
    <div className="space-y-6 pb-10 flex flex-col h-[calc(100vh-120px)]">
      
      {/* Controle Superior */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
            <Brain className="text-blue-500" size={24} />
            Mapa Mental Dinâmico
          </h2>
          <p className="text-sm text-slate-450 mt-1">Visualize e interaja com os conceitos e etapas das matérias</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-2 px-4">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-400">Matéria Foco:</span>
          <select 
            value={disciplinaFoco}
            onChange={e => setDisciplinaFoco(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-blue-400 font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {disciplinas.length === 0 && <option value="">Nenhuma matéria cadastrada</option>}
            {disciplinas.map(d => (
              <option key={d.id} value={d.titulo_materia}>{d.titulo_materia}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Canvas View (React Flow) */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/50 shadow-2xl relative">
        {disciplinas.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 flex-col gap-3">
             <Brain size={48} className="opacity-20" />
             <p>Cadastre uma matéria para gerar o mapa mental.</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="bg-slate-950/80"
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls className="bg-slate-900 border-slate-800 text-white fill-white" />
          </ReactFlow>
        )}
      </div>

    </div>
  )
}
