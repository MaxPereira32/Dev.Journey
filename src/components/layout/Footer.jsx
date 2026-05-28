import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-slate-800/40 text-center text-xs text-slate-500">
      <p>© {new Date().getFullYear()} Dev.Journey - Gerenciador Acadêmico PWA. Todos os direitos reservados.</p>
    </footer>
  )
}
