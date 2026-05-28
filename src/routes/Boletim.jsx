import React from 'react'

export default function Boletim() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-display text-slate-100">Grades & Relatórios</h2>
        <p className="text-slate-400">Gere e exporte seus boletins de desempenho.</p>
      </header>
      
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-8 max-w-2xl mx-auto mt-10">
        <h3 className="text-xl font-bold font-display text-slate-100 mb-6 text-center">Selecione o Período</h3>
        
        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-400 mb-2">Data Inicial</label>
            <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-400 mb-2">Data Final</label>
            <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            Gerar Relatório
          </button>
          <button className="flex-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-6 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-emerald-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Sincronizar Sheets
          </button>
        </div>
      </div>
    </div>
  )
}
