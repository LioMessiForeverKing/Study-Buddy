'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChapterManager } from '@/components/ChapterManager'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import type { Class } from '@/types/supabase'
import Image from 'next/image'

export default function NotePad() {
  const [classData, setClassData] = useState<Class | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const classId = searchParams.get('classId')

  useEffect(() => {
    loadClassData()
  }, [classId])

  const loadClassData = async () => {
    if (!classId) {
      router.push('/classes')
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Class not found')

      setClassData(data)
    } catch (err) {
      console.error('Error loading class:', err)
      router.push('/classes')
    } finally {
      setIsLoading(false)
    }
  }

  const goBackToClasses = () => {
    router.push('/classes')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={goBackToClasses}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Classes
            </button>

            {classData && (
              <div className="flex items-center gap-4">
                <Image
                  src={classData.yubi_variant}
                  alt="Class Icon"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {classData.title}
                  </h1>
                  <p className="text-gray-600">{classData.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {classId && <ChapterManager classId={classId} />}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
