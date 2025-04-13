'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import type { Class } from '@/types/supabase'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import YubiCompanion from '@/components/YubiCompanion'

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [classData, setClassData] = useState<Class | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadClassData()
  }, [params.id])

  const loadClassData = async () => {
    if (!params.id) return

    try {
      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Class not found')

      setClassData(data)
      setError(null)
    } catch (err) {
      console.error('Error loading class:', err)
      setError('Failed to load class data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-screen text-red-600">
            {error}
          </div>
        ) : classData ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
              <Image 
                src={classData.yubi_variant} 
                alt="Yubi Logo" 
                width={60} 
                height={60} 
              />
              <h1 className="text-4xl font-bold text-gray-900">{classData.title}</h1>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <p className="text-gray-600">{classData.description}</p>
            </div>

            {/* Add your notepad component or other class-specific features here */}
          </div>
        ) : null}
        <YubiCompanion />
      </div>
    </ProtectedRoute>
  )
}
