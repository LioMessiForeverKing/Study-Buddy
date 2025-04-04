'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChapterManager } from '@/components/ChapterManager'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ArrowLeft } from 'lucide-react'

interface Class {
  id: string
  title: string
  description: string
}

interface ClassPageProps {
  params: {
    id: string
  }
}

export default function ClassPage({ params }: ClassPageProps) {
  const [classData, setClassData] = useState<Class | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const classId = params.id

  // Load class data from local storage
  useEffect(() => {
    if (classId) {
      const savedClasses = localStorage.getItem('userClasses')
      if (savedClasses) {
        const classes = JSON.parse(savedClasses)
        const foundClass = classes.find((c: Class) => c.id === classId)
        if (foundClass) {
          setClassData(foundClass)
        } else {
          // Class not found, redirect to classes page
          router.push('/classes')
        }
      } else {
        // No classes saved, redirect to classes page
        router.push('/classes')
      }
    }
    setIsLoading(false)
  }, [classId, router])

  const goBackToClasses = () => {
    router.push('/classes')
  }

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
        <button
          onClick={goBackToClasses}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
        >
          <ArrowLeft size={18} />
          Back to Classes
        </button>

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
            {classData ? classData.title : 'Loading...'}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            {classData ? classData.description : ''}
          </p>
        </div>

        {/* Glassmorphic ChapterManager Wrapper */}
        <div className="relative bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl rounded-3xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl">
          {!isLoading && classId && <ChapterManager classId={classId} />}
        </div>
      </section>
    </main>
    </ProtectedRoute>
  )
}