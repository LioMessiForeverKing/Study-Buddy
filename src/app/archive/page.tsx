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
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-blue-400 mix-blend-multiply filter blur-3xl animate-float"></div>
            <div className="absolute top-[40%] left-[25%] w-96 h-96 rounded-full bg-purple-400 mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-[20%] right-[15%] w-72 h-72 rounded-full bg-green-400 mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] right-[20%] w-80 h-80 rounded-full bg-yellow-400 mix-blend-multiply filter blur-3xl animate-float"></div>
          </div>
        </div>
        {/* Sidebar */}
        <div className="w-64 bg-white/90 backdrop-blur-md shadow-xl z-10 border-r border-white/20">
          <div className="p-4">
            <Image src="/Yubi2.svg" alt="Yubi Mascot" width={150} height={150} className="mb-8" />
            <nav className="space-y-2">
              <a href="/classes" className="flex items-center gap-2 p-3 text-gray-700 hover:bg-white/80 hover:shadow-md rounded-lg transition-all duration-300">
                <Home className="w-5 h-5" />
                Classes
              </a>
              <a href="/archive" className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                <Archive className="w-5 h-5" />
                Archive
              </a>
              <a href="/settings" className="flex items-center gap-2 p-3 text-gray-700 hover:bg-white/80 hover:shadow-md rounded-lg transition-all duration-300">
                <Settings className="w-5 h-5" />
                Settings
              </a>
            </nav>
          </div>
          <div className="absolute bottom-0 left-0 w-64 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full p-3 text-red-600 hover:bg-red-50/80 rounded-lg transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <h1 className="text-4xl font-bold gradient-text mb-12">Archived Classes</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
              {archivedClasses.map((classItem) => (
                <div key={classItem.id} className="glass-effect rounded-2xl shadow-lg p-8 border border-white/30 transform transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:-rotate-1 group">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{classItem.title}</h2>
                  </div>
                  <p className="text-gray-600 mb-2">{classItem.description}</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Archived on: {new Date(classItem.archivedDate).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => restoreClass(classItem)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restore Class
                  </button>
                </div>
              ))}
              
              {archivedClasses.length === 0 && (
                <div className="col-span-3 glass-effect rounded-2xl shadow-lg p-12 border border-white/30 text-center text-gray-500">
                  <Image src="/Yubi-sleepy.svg" alt="Empty Archive" width={80} height={80} className="mx-auto mb-4" />
                  <p className="text-xl">No archived classes found</p>
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