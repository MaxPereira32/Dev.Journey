import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './lib/stores/useAuthStore'
import { initFirebaseCache } from './lib/firebase/cache'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'

const Login = lazy(() => import('./routes/Login'))
const Dashboard = lazy(() => import('./routes/Dashboard'))
const Disciplinas = lazy(() => import('./routes/Disciplinas'))
const MapaMental = lazy(() => import('./routes/MapaMental'))
const Cronograma = lazy(() => import('./routes/Cronograma'))
const Boletim = lazy(() => import('./routes/Boletim'))
const Tutoria = lazy(() => import('./routes/Tutoria'))
const Configuracoes = lazy(() => import('./routes/Configuracoes'))

const LoadingFallback = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 z-50">
    <div className="relative flex flex-col items-center">
      <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-5 text-sm text-slate-400 animate-pulse font-medium font-display tracking-wider">Carregando o Dev.Journey...</p>
    </div>
  </div>
)

function PrivateRoute({ children }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <LoadingFallback />
  return user ? children : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const links = ['/disciplinas', '/cronograma', '/boletim', '/tutoria', '/mapa-mental', '/configuracoes']
      links.forEach(route => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.as = 'script'
        link.href = `/src/routes${route}.jsx`
        document.head.appendChild(link)
      })
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 transition-all duration-300">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => {
    initFirebaseCache()
    
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.log('Falha ao registrar ServiceWorker:', err)
        })
      })
    }
  }, [])
  
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { 
            background: '#0f172a', 
            color: '#f8fafc',
            borderRadius: '16px',
            padding: '12px 18px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '14px'
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#0f172a' }
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0f172a' }
          }
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/disciplinas" element={
            <PrivateRoute>
              <AppLayout>
                <Disciplinas />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/mapa-mental" element={
            <PrivateRoute>
              <AppLayout>
                <MapaMental />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/cronograma" element={
            <PrivateRoute>
              <AppLayout>
                <Cronograma />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/boletim" element={
            <PrivateRoute>
              <AppLayout>
                <Boletim />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/tutoria" element={
            <PrivateRoute>
              <AppLayout>
                <Tutoria />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/configuracoes" element={
            <PrivateRoute>
              <AppLayout>
                <Configuracoes />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
