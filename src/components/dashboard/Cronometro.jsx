import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../lib/stores/useAuthStore'
import { useDisciplinaStore } from '../../lib/stores/useDisciplinaStore'
import Button from '../ui/Button'

const createTimerWorker = () => {
  const workerCode = `
    let interval = null
    let seconds = 0
    
    self.onmessage = (e) => {
      if (e.data.type === 'START') {
        if (interval) clearInterval(interval)
        interval = setInterval(() => {
          seconds++
          self.postMessage({ seconds })
        }, 1000)
      } else if (e.data.type === 'PAUSE') {
        if (interval) {
          clearInterval(interval)
          interval = null
        }
      } else if (e.data.type === 'RESET') {
        seconds = 0
        if (interval) {
          clearInterval(interval)
          interval = null
        }
        self.postMessage({ seconds })
      }
    }
  `
  
  const blob = new Blob([workerCode], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}

export function Cronometro({ onRegistroSalvo }) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState('')
  const [ultimoRegistro, setUltimoRegistro] = useState(null)
  const workerRef = useRef(null)
  
  const { user } = useAuthStore()
  const { disciplinas, editarMateria, adicionarRegistroEstudo } = useDisciplinaStore()
  
  useEffect(() => {
    workerRef.current = createTimerWorker()
    workerRef.current.onmessage = (e) => {
      setSeconds(e.data.seconds)
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])
  
  const handleStart = useCallback(() => {
    if (!disciplinaSelecionada) {
      toast.error('Selecione uma matéria antes de iniciar')
      return
    }
    workerRef.current.postMessage({ type: 'START' })
    setIsRunning(true)
    toast.success(`🎓 Iniciado: Estudando ${disciplinaSelecionada}`)
  }, [disciplinaSelecionada])
  
  const handlePause = useCallback(() => {
    workerRef.current.postMessage({ type: 'PAUSE' })
    setIsRunning(false)
    toast('Estudo pausado')
  }, [])
  
  const handleReset = useCallback(async () => {
    workerRef.current.postMessage({ type: 'PAUSE' })
    const horasEstudadas = seconds / 3600
    
    if (horasEstudadas > 0 && disciplinaSelecionada) {
      try {
        await adicionarRegistroEstudo({
          disciplina_titulo: disciplinaSelecionada,
          horas: horasEstudadas,
          data: new Date().toISOString().split('T')[0],
          usuario_id: user?.uid
        })
        
        const disciplina = disciplinas.find(d => d.titulo_materia === disciplinaSelecionada)
        if (disciplina) {
          await editarMateria(user?.uid, disciplinaSelecionada, {
            horas_registradas: (disciplina.horas_registradas || 0) + horasEstudadas
          })
        }
        
        setUltimoRegistro({ horas: horasEstudadas, disciplina: disciplinaSelecionada })
        
        if (onRegistroSalvo) {
          onRegistroSalvo(disciplinaSelecionada, horasEstudadas)
        }
        
        toast.success(`Estudo registrado: +${horasEstudadas.toFixed(2)}h em ${disciplinaSelecionada}`)
      } catch (err) {
        toast.error('Erro ao salvar no banco.')
      }
    }
    
    workerRef.current.postMessage({ type: 'RESET' })
    setSeconds(0)
    setIsRunning(false)
  }, [seconds, disciplinaSelecionada, user, disciplinas, onRegistroSalvo, adicionarRegistroEstudo, editarMateria])
  
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const getProgressoDisciplina = () => {
    const disciplina = disciplinas.find(d => d.titulo_materia === disciplinaSelecionada)
    if (!disciplina) return 0
    const meta = 100
    return Math.min((disciplina.horas_registradas / meta) * 100, 100)
  }
  
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {isRunning && (
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />
      )}
      <div className="text-center">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Cronômetro de Estudo Focado</h3>
        <div className={`text-6xl font-mono font-bold font-display mb-6 tracking-widest ${isRunning ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'text-slate-350'}`}>
          {formatTime(seconds)}
        </div>
        
        <div className="mb-5 text-left">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            📚 Matéria de Estudo
          </label>
          <select
            value={disciplinaSelecionada}
            onChange={(e) => setDisciplinaSelecionada(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isRunning}
          >
            <option value="">Selecione uma matéria</option>
            {disciplinas.map((disciplina) => (
              <option key={disciplina.id} value={disciplina.titulo_materia}>
                {disciplina.titulo_materia} ({Number(disciplina.horas_registradas || 0).toFixed(1)}h acumuladas)
              </option>
            ))}
          </select>
        </div>
        
        {disciplinaSelecionada && (
          <div className="mb-6 text-left animate-slide-up">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>Progresso na Matéria</span>
              <span className="font-semibold text-blue-450">{Math.round(getProgressoDisciplina())}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/80">
              <div 
                className="bg-blue-500 rounded-full h-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                style={{ width: `${getProgressoDisciplina()}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex gap-3 justify-center">
          {!isRunning ? (
            <Button 
              onClick={handleStart}
              variant="primary"
              className="flex-1"
              icon={Play}
            >
              Iniciar
            </Button>
          ) : (
            <Button 
              onClick={handlePause}
              variant="secondary"
              className="flex-1 text-yellow-400 border-yellow-500/20 hover:bg-yellow-950/20 hover:text-yellow-300"
              icon={Pause}
            >
              Pausar
            </Button>
          )}
          
          <Button 
            onClick={handleReset}
            variant="danger"
            disabled={seconds === 0}
            className="flex-1"
            icon={RotateCcw}
          >
            Concluir & Registrar
          </Button>
        </div>

        {ultimoRegistro && (
          <p className="mt-4 text-xs text-slate-400 border-t border-slate-800/40 pt-3 animate-fade-in">
            ⏱️ Última sessão: <strong className="text-slate-350">{ultimoRegistro.horas.toFixed(2)}h</strong> em <span className="text-blue-400">{ultimoRegistro.disciplina}</span>
          </p>
        )}
      </div>
    </div>
  )
}
