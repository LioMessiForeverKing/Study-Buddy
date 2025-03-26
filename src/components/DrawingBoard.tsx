'use client'

import { Canvas } from './Canvas'

export function DrawingBoard() {
  return (
    <div className="p-6 md:p-8 bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-lg transition-all">
      <h2
        className="text-3xl font-bold mb-6"
        style={{
          background: 'linear-gradient(to right, #4285F4, #34A853, #FBBC05, #EA4335)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Drawing Board
      </h2>
      <Canvas />
    </div>
  )
}
