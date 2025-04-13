'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Archive, Trash2, RefreshCw } from 'lucide-react'
import { classesService } from '@/utils/supabase/classes'
import type { Class } from '@/types/supabase'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function ArchivedClassesPage() {
  const [archivedClasses, setArchivedClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadArchivedClasses()
  }, [])

  const loadArchivedClasses = async () => {
    try {
      setIsLoading(true)
      const data = await classesService.getArchivedClasses()
      setArchivedClasses(data)
      setError(null)
    } catch (err) {
      setError('Failed to load archived classes')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const restoreClass = async (classItem: Class) => {
    try {
      await classesService.restoreClass(classItem.id)
      setArchivedClasses(prev => prev.filter(c => c.id !== classItem.id))
    } catch (err) {
      console.error('Error restoring class:', err)
    }
  }

  const deleteClass = async (id: string) => {
    try {
      await classesService.deleteClass(id)
      setArchivedClasses(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error deleting class:', err)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Archived Classes</h1>
            <button
              onClick={() => router.push('/classes')}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Classes
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : archivedClasses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No archived classes found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedClasses.map((classItem) => (
                <div key={classItem.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <Image 
                        src={classItem.yubi_variant} 
                        alt="Yubi Logo" 
                        width={40} 
                        height={40} 
                      />
                      <h2 className="text-xl font-semibold text-gray-900">{classItem.title}</h2>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{classItem.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => restoreClass(classItem)}
                      className="flex-1 py-2 px-4 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Restore
                    </button>
                    <button
                      onClick={() => deleteClass(classItem.id)}
                      className="py-2 px-4 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
