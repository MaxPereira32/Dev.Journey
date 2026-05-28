import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../lib/stores/useAuthStore'
import { listarTutores, salvarTutor, atualizarTutor, deletarTutor } from '../lib/firebase/firestore'
import { Plus, Edit, Trash2, Mail, Phone, X, Check, Search, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

export default function Tutoria() {
  const { user } = useAuthStore()
  const [tutores, setTutores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [busca, setBusca] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    instituicao: '',
    experiencia: '',
    cor: ''
  })

  const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

  useEffect(() => {
    carregarTutores()
  }, [user])

  const carregarTutores = async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      const data = await listarTutores(user.uid)
      setTutores(data)
    } catch (error) {
      toast.error('Erro ao carregar tutores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.uid) return

    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    const dados = {
      ...formData,
      usuario_id: user.uid,
      cor: formData.cor || cores[Math.floor(Math.random() * cores.length)]
    }

    try {
      if (editandoId) {
        await atualizarTutor(editandoId, dados)
        toast.success('Tutor atualizado com sucesso!')
      } else {
        await salvarTutor(dados)
        toast.success('Tutor cadastrado com sucesso!')
      }
      
      setModalAberto(false)
      setEditandoId(null)
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cargo: '',
        instituicao: '',
        experiencia: '',
        cor: ''
      })
      carregarTutores()
    } catch (error) {
      toast.error('Erro ao salvar tutor')
    }
  }

  const handleEdit = (tutor) => {
    setEditandoId(tutor.id)
    setFormData({
      nome: tutor.nome || '',
      email: tutor.email || '',
      telefone: tutor.telefone || '',
      cargo: tutor.cargo || '',
      instituicao: tutor.instituicao || '',
      experiencia: tutor.experiencia || '',
      cor: tutor.cor || cores[0]
    })
    setModalAberto(true)
  }

  const handleDelete = async (id, nome) => {
    if (confirm(`Tem certeza que deseja excluir o tutor ${nome}?`)) {
      try {
        await deletarTutor(id)
        toast.success('Tutor excluído com sucesso!')
        carregarTutores()
      } catch (error) {
        toast.error('Erro ao excluir tutor')
      }
    }
  }

  const getInitials = (nome) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const tutoresFiltrados = tutores.filter(tutor =>
    tutor.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (tutor.email && tutor.email.toLowerCase().includes(busca.toLowerCase())) ||
    (tutor.cargo && tutor.cargo.toLowerCase().includes(busca.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-100">Tutores & Mentores</h2>
          <p className="text-sm text-slate-450 mt-1">Gerencie seus professores particulares e canais de ajuda</p>
        </div>
        <Button
          onClick={() => {
            setEditandoId(null)
            setFormData({
              nome: '',
              email: '',
              telefone: '',
              cargo: '',
              instituicao: '',
              experiencia: '',
              cor: cores[Math.floor(Math.random() * cores.length)]
            })
            setModalAberto(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          icon={Plus}
        >
          Novo Tutor
        </Button>
      </div>

      {tutores.length > 0 && (
        <div className="relative max-w-md animate-fade-in">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" size={17} />
          <input
            type="text"
            placeholder="Buscar tutor por nome, email ou cargo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 text-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      )}

      {tutoresFiltrados.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto">
          {tutores.length === 0 ? (
            <>
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h4 className="text-lg font-bold text-slate-200">Nenhum tutor cadastrado</h4>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                Adicione mentores acadêmicos ou professores auxiliares para facilitar seus canais de comunicação rápida!
              </p>
              <Button
                onClick={() => setModalAberto(true)}
                className="mt-6 bg-blue-600 hover:bg-blue-700"
                icon={Plus}
              >
                Adicionar Primeiro Tutor
              </Button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">🔍</div>
              <h4 className="text-lg font-bold text-slate-200">Nenhum tutor encontrado</h4>
              <p className="text-sm text-slate-400 mt-2">Verifique o termo de busca e tente novamente.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {tutoresFiltrados.map((tutor) => (
            <Card key={tutor.id} hoverEffect className="border-slate-800/80 p-6 flex flex-col justify-between items-center text-center relative pt-8 mt-6">
              
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button onClick={() => handleEdit(tutor)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800/60 rounded-lg transition" title="Editar"><Edit size={16} /></button>
                <button onClick={() => handleDelete(tutor.id, tutor.nome)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition" title="Excluir"><Trash2 size={16} /></button>
              </div>

              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-[0_0_15px_rgba(0,0,0,0.5)] border-4 border-slate-950"
                  style={{ backgroundColor: tutor.cor || '#3B82F6' }}
                >
                  {getInitials(tutor.nome)}
                </div>
              </div>

              <div className="mt-4 w-full">
                <h4 className="font-bold text-slate-100 text-lg leading-snug">{tutor.nome}</h4>
                <p className="text-xs text-slate-450 mt-1">{tutor.cargo || 'Tutor / Mentor'}</p>
              </div>

              <div className="mt-4 space-y-2 w-full flex flex-col items-center">
                {tutor.email && (
                  <a href={`mailto:${tutor.email}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors">
                    <Mail size={14} className="text-blue-500" />
                    <span className="truncate">{tutor.email}</span>
                  </a>
                )}
                {tutor.telefone && (
                  <a href={`tel:${tutor.telefone}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-400 transition-colors">
                    <Phone size={14} className="text-emerald-500" />
                    <span>{tutor.telefone}</span>
                  </a>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/40 w-full">
                <div className="flex flex-wrap gap-2 justify-center">
                  {tutor.instituicao && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {tutor.instituicao}
                    </span>
                  )}
                  {tutor.experiencia && tutor.experiencia.split(',').map((badge, idx) => (
                     <span key={idx} className="text-[10px] font-bold px-2 py-1 rounded bg-blue-900/20 text-blue-400 border border-blue-500/20">
                       {badge.trim()}
                     </span>
                  ))}
                  {!tutor.instituicao && !tutor.experiencia && (
                    <span className="text-[10px] text-slate-500">Nenhuma tag cadastrada</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tutor */}
      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title={editandoId ? '✏️ Editar Tutor' : '👨‍🏫 Novo Tutor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ex: Prof. Carlos Silva"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                E-mail de Contato
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="carlos@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Cargo / Especialidade
              </label>
              <input
                type="text"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ex: Professor de Redação"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Instituição de Ensino
              </label>
              <input
                type="text"
                value={formData.instituicao}
                onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ex: Universidade de São Paulo"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Aulas Ministradas / Info
              </label>
              <input
                type="text"
                value={formData.experiencia}
                onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ex: Física, Cálculo I"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Cor do Avatar
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {cores.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setFormData({ ...formData, cor })}
                  className={`w-7 h-7 rounded-lg transition-all ${
                    formData.cor === cor ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalAberto(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              icon={Check}
            >
              {editandoId ? 'Atualizar' : 'Criar Tutor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
