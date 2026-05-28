import React from 'react'

export default function Card({ children, className = '', hoverEffect = true, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        glass rounded-2xl p-6 shadow-xl border border-slate-800/60
        ${hoverEffect ? 'glass-hover cursor-pointer' : ''}
        ${onClick ? 'active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
