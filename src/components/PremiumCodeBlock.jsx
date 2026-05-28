import React from 'react'
import Editor from '@monaco-editor/react'

export default function PremiumCodeBlock({ language = 'javascript', value, onChange }) {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-800/80 shadow-inner bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          fontFamily: 'JetBrains Mono, monospace'
        }}
        loading={
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Carregando Editor...
          </div>
        }
      />
    </div>
  )
}
