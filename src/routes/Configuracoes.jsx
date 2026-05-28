import React, { useState } from 'react'
import { useAuthStore } from '../lib/stores/useAuthStore'
import { atualizarUsuario } from '../lib/firebase/firestore'
import { User, Shield, Check, Cloud, Palette, HardDrive } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Configuracoes() {
  const { user, updateUser } = useAuthStore()
  
  const [nome, setNome] = useState(user?.nome || '')
  const [email, setEmail] = useState(user?.email || '')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  // Drive state
  const [driveEnabled, setDriveEnabled] = useState(false)
  const [driveFolder, setDriveFolder] = useState('DevJourney_Tarefas')

  // Theme state
  const [tema, setTema] = useState('dark')

  const temas = [
    { id: 'dark', color: '#0f172a', label: 'Dark Default' },
    { id: 'blue', color: '#1e3a8a', label: 'Deep Blue' },
    { id: 'emerald', color: '#064e3b', label: 'Emerald' },
    { id: 'purple', color: '#4c1d95', label: 'Purple' }
  ]

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!nome.trim()) {
      toast.error('O nome não pode estar em branco!')
      return
    }

    setLoading(true)
    try {
      if (user?.uid) {
        await atualizarUsuario(user.uid, { nome })
        updateUser({ nome })
        toast.success('Perfil atualizado com sucesso!')
        if (senha) {
           toast.success('Simulação: Nova senha atualizada.')
           setSenha('')
        }
      } else {
        toast.error('Usuário não autenticado')
      }
    } catch (err) {
      toast.error('Erro ao salvar perfil: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthGoogle = () => {
    toast.success('Simulação: Fluxo OAuth2 do Google Drive iniciado...', { icon: '☁️' })
  }

  const handleChangeTheme = (novoTema) => {
    setTema(novoTema)
    // Na vida real, aplicaria classes no document.body
    toast.success(`Tema ${novoTema} ativado! (Simulação)`)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold font-display text-slate-100">Configurações da Conta</h2>
        <p className="text-sm text-slate-450 mt-1">Gerencie seu perfil, integrações e personalização visual</p>
      </div>

      <div className="space-y-8 animate-slide-up">
        
        {/* Painel 1: Perfil Pessoal */}
        <Card hoverEffect={false} className="border-slate-800/80 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/50">
            <h3 className="text-base font-bold font-display text-slate-200 flex items-center gap-2">
              <User size={18} className="text-blue-400" />
              Perfil Pessoal
            </h3>
            <p className="text-xs text-slate-450 mt-1">Atualize suas informações básicas e credenciais</p>
          </div>
          
          <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="w-full sm:w-1/3 text-sm font-semibold text-slate-400">Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="w-full sm:w-1/3 text-sm font-semibold text-slate-400">Endereço de E-mail</label>
              <input
                type="email"
                value={email}
                disabled
                className="flex-1 px-4 py-2.5 bg-slate-950/50 border border-slate-800/50 text-slate-500 rounded-xl cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="w-full sm:w-1/3 text-sm font-semibold text-slate-400">Nova Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" isLoading={loading} icon={Check}>
                Salvar Dados
              </Button>
            </div>
          </form>
        </Card>

        {/* Painel 2: Integração Google Drive */}
        <Card hoverEffect={false} className="border-slate-800/80 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold font-display text-slate-200 flex items-center gap-2">
                <Cloud size={18} className="text-emerald-400" />
                Integração Google Drive
              </h3>
              <p className="text-xs text-slate-450 mt-1">Sincronize arquivos e anexos automaticamente para a nuvem</p>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={() => setDriveEnabled(!driveEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center outline-none ${
                driveEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span 
                className={`w-4 h-4 rounded-full bg-white absolute transition-transform duration-300 ease-in-out ${
                  driveEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {driveEnabled && (
            <div className="p-6 space-y-6 bg-slate-950/20 border-t-2 border-emerald-500/20 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="w-full sm:w-1/3 text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <HardDrive size={16} /> Nome da Pasta Base
                </label>
                <input
                  type="text"
                  value={driveFolder}
                  onChange={(e) => setDriveFolder(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  onClick={handleAuthGoogle}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Autenticar Conta Google
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Painel 3: Customização Visual */}
        <Card hoverEffect={false} className="border-slate-800/80 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/50">
            <h3 className="text-base font-bold font-display text-slate-200 flex items-center gap-2">
              <Palette size={18} className="text-purple-400" />
              Customização Visual
            </h3>
            <p className="text-xs text-slate-450 mt-1">Defina as cores principais do seu painel</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              {temas.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleChangeTheme(t.id)}
                  className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                    tema === t.id 
                      ? 'ring-2 ring-offset-2 ring-offset-slate-950 ring-blue-500 scale-105' 
                      : 'hover:scale-105 border border-slate-800'
                  }`}
                  style={{ backgroundColor: t.color }}
                >
                  {tema === t.id && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1 border-2 border-slate-950">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Nota: Na versão atual, o tema define apenas a cor de destaque principal, mantendo a base escura otimizada para desenvolvedores.
            </p>
          </div>
        </Card>

      </div>
    </div>
  )
}
