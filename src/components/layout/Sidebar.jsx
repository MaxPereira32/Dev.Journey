import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  Calendar, 
  Users,
  FileText,
  Settings,
  LogOut,
  X
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../lib/stores/useAuthStore'
import toast from 'react-hot-toast'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/disciplinas', icon: BookOpen, label: 'Disciplinas' },
  { path: '/mapa-mental', icon: Brain, label: 'Mapa Mental' },
  { path: '/cronograma', icon: Calendar, label: 'Cronograma' },
  { path: '/boletim', icon: FileText, label: 'Boletim' },
  { path: '/tutoria', icon: Users, label: 'Tutoria' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    toast.success('Logout realizado com sucesso!')
    navigate('/login')
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-slate-900 border-r border-slate-800/80
        transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold font-display text-lg">D</span>
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-slate-100 leading-tight">Dev.Journey</h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Dashboard Acadêmico</p>
            </div>
          </div>
          <button onClick={onToggle} className="lg:hidden text-slate-400 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => {
                if (window.innerWidth < 1024) onToggle()
              }}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-blue-600/10 text-blue-400 font-semibold border-l-4 border-blue-500 pl-3' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }
              `}
            >
              <item.icon size={19} className="group-hover:scale-105 transition-transform" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all duration-200"
          >
            <LogOut size={19} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
