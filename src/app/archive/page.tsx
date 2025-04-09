'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Archive, Settings, LogOut, RefreshCw } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Image from 'next/image'
import YubiCompanion from '@/components/YubiCompanion'
import { createClient } from '@/utils/supabase/client'

interface ArchivedClass {
  id: string
  title: string
  description: string
  archivedDate: string
}

export default function ArchivePage() {
  const [archivedClasses, setArchivedClasses] = useState<ArchivedClass[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const savedArchived = localStorage.getItem('archivedClasses')
    if (savedArchived) {
      setArchivedClasses(JSON.parse(savedArchived))
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const restoreClass = (classToRestore: ArchivedClass) => {
    // Get current classes
    const currentClasses = JSON.parse(localStorage.getItem('userClasses') || '[]')
    // Add the restored class to active classes
    const restoredClass = {
      id: classToRestore.id,
      title: classToRestore.title,
      description: classToRestore.description
    }
    localStorage.setItem('userClasses', JSON.stringify([...currentClasses, restoredClass]))
    
    // Remove from archived classes
    const updatedArchived = archivedClasses.filter(c => c.id !== classToRestore.id)
    setArchivedClasses(updatedArchived)
    localStorage.setItem('archivedClasses', JSON.stringify(updatedArchived))
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-4">
            <Image src="/Yubi2.svg" alt="Yubi Mascot" width={150} height={150} className="mb-8" />
            <nav className="space-y-2">
              <a href="/classes" className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded">
                <Home className="w-5 h-5" />
                Classes
              </a>
              <a href="/archive" className="flex items-center gap-2 p-2 bg-blue-50 text-blue-600 rounded">
                <Archive className="w-5 h-5" />
                Archive
              </a>
              <a href="/settings" className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded">
                <Settings className="w-5 h-5" />
                Settings
              </a>
            </nav>
          </div>
          <div className="absolute bottom-0 left-0 w-64 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Archived Classes</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedClasses.map((classItem) => (
                <div key={classItem.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{classItem.title}</h2>
                  </div>
                  <p className="text-gray-600 mb-2">{classItem.description}</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Archived on: {new Date(classItem.archivedDate).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => restoreClass(classItem)}
                    className="w-full py-2 px-4 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restore Class
                  </button>
                </div>
              ))}
              
              {archivedClasses.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  No archived classes found
                </div>
              )}
            </div>
          </div>
        </div>

        <YubiCompanion />
      </div>
    </ProtectedRoute>
  )
}