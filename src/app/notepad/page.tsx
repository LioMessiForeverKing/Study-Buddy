'use client'

import { ChapterManager } from '@/components/ChapterManager'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function NotePad() {
  return (
    <ProtectedRoute>
    <main className="relative min-h-screen bg-white text-gray-800 overflow-hidden">
      {/* Animated Google Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-200px] left-[-150px] w-[600px] h-[600px] bg-[radial-gradient(closest-side,_#4285F4,_transparent)] animate-pulse-slow blur-3xl opacity-30" />
        <div className="absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] bg-[radial-gradient(closest-side,_#34A853,_transparent)] animate-pulse-slow blur-3xl opacity-30" />
        <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-[radial-gradient(closest-side,_#FBBC05,_transparent)] animate-pulse-slow blur-2xl opacity-20" />
      </div>

      {/* Content */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2"
            style={{
              background:
                'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your Smart Workspace
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Your AI Tutor Yubi. Our goal is to make you Yubi.
          </p>
        </div>

        {/* Glassmorphic ChapterManager Wrapper */}
        <div className="relative bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl rounded-3xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl">
          <ChapterManager />
        </div>
      </section>
    </main>
    </ProtectedRoute>
  )
}
