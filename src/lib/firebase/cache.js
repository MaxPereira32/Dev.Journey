import toast from 'react-hot-toast'

export const initFirebaseCache = () => {
  // Monitorar se a rede ficou offline ou online
  window.addEventListener('online', () => {
    toast.success('Você está online! Sincronizando dados com a nuvem...', {
      icon: '🌐',
      style: {
        background: '#065f46',
        color: '#fff'
      }
    })
  })

  window.addEventListener('offline', () => {
    toast.error('Você está offline! Seus dados serão salvos localmente.', {
      icon: '📴',
      style: {
        background: '#7f1d1d',
        color: '#fff'
      }
    })
  })

  if (!navigator.onLine) {
    console.log('Iniciou em modo offline. O cache de 50MB do Firestore está ativo.')
  }
}
