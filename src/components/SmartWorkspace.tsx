'use client'

import { Canvas } from './Canvas'

interface SmartWorkspaceProps {
  chapterId: string
  classId: string
}

export function SmartWorkspace({ 
  chapterId,
  classId 
}: SmartWorkspaceProps) {
  return (
    <div className="p-6 md:p-8 bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-lg transition-all">
      <div className="mb-6">
        <h2
          className="text-3xl font-bold"
          style={{
            background: 'linear-gradient(to right, #4285F4, #34A853, #FBBC05, #EA4335)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Smart Workspace
        </h2>
      </div>
      <Canvas 
        chapterId={chapterId}
        classId={classId}
      />
    </div>
  )
}
