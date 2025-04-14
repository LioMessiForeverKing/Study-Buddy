'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Home, 
  Archive, 
  Settings, 
  LogOut, 
  Sliders,
  BookOpen 
} from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Image from 'next/image'
import YubiCompanion from '@/components/YubiCompanion'
import YubiPersonalization from '@/components/YubiPersonalization'
import { createClient } from '@/utils/supabase/client'
import { classesService } from '@/utils/supabase/classes'
import type { Class } from '@/types/supabase'

const yubiVariants = [
  '/Yubi1.svg',
  '/Yubi2.svg',
  '/Yubi3.svg',
  '/Yubi-happy.svg',
  '/Yubi-proud.svg'
]

const getRandomYubiVariant = () => {
  return yubiVariants[Math.floor(Math.random() * yubiVariants.length)]
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [newClassTitle, setNewClassTitle] = useState('')
  const [newClassDescription, setNewClassDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingClass, setIsAddingClass] = useState(false)
  const [showYubiPersonalization, setShowYubiPersonalization] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadClasses()

    // Set up real-time subscription
    const channel = supabase
      .channel('classes_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'classes' 
        }, 
        () => {
          loadClasses()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadClasses = async () => {
    try {
      setIsLoading(true)
      const data = await classesService.getClasses()
      setClasses(data)
      setError(null)
    } catch (err) {
      setError('Failed to load classes')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const generateId = () => Date.now().toString()

  const addClass = async () => {
    if (newClassTitle.trim() === '') {
      return
    }
    
    try {
      const newClass = await classesService.addClass({
        title: newClassTitle.trim(),
        description: newClassDescription.trim(),
        yubi_variant: getRandomYubiVariant()  // Changed from yubiVariant
      })
      
      setClasses(prev => [newClass, ...prev])
      setNewClassTitle('')
      setNewClassDescription('')
      setIsAddingClass(false)
    } catch (err) {
      console.error('Error adding class:', err)
      alert(err instanceof Error ? err.message : 'Failed to add class')
    }
  }

  const startEditingClass = (classItem: Class) => {
    setEditingClassId(classItem.id)
    setNewClassTitle(classItem.title)
    setNewClassDescription(classItem.description)
  }

  const saveClassEdit = (id: string) => {
    setClasses(classes.map(classItem => 
      classItem.id === id 
        ? { ...classItem, title: newClassTitle, description: newClassDescription } 
        : classItem
    ))
    setEditingClassId(null)
    setNewClassTitle('')
    setNewClassDescription('')
  }

  const cancelEditing = () => {
    setEditingClassId(null)
    setNewClassTitle('')
    setNewClassDescription('')
  }

  const deleteClass = async (id: string) => {
    try {
      await classesService.deleteClass(id)
      setClasses(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error deleting class:', err)
      // Handle error appropriately
    }
  }

  const goToNotepad = (classId: string) => {
    router.push(`/notepad?classId=${classId}`)
  }

  const archiveClass = async (classToArchive: Class) => {
    try {
      await classesService.archiveClass(classToArchive.id)
      setClasses(prev => prev.filter(c => c.id !== classToArchive.id))
    } catch (err) {
      console.error('Error archiving class:', err)
      // Handle error appropriately
    }
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
              <a href="/classes" className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                <Home className="w-5 h-5" />
                Classes
              </a>
              <a href="/archive" className="flex items-center gap-2 p-3 text-gray-700 hover:bg-white/80 hover:shadow-md rounded-lg transition-all duration-300">
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
            {/* Header with Yubi Personalization */}
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-4xl font-bold gradient-text">My Classes</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowYubiPersonalization(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300"
                >
                  <Sliders className="w-5 h-5" />
                  Customize Yubi
                </button>
              </div>
            </div>

            {needsOnboarding && (
              <div className="mb-8 p-6 glass-effect rounded-xl shadow-lg border border-purple-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image src="/Yubi-happy.svg" alt="Yubi" width={40} height={40} />
                    <p className="text-purple-700">Hey there! Let's make your learning experience more personal!</p>
                  </div>
                  <button
                    onClick={() => router.push('/settings/onboarding')}
                    className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
                  >
                    Complete Setup
                  </button>
                </div>
              </div>
            )}

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
              {/* Add Class Card */}
              <div 
                onClick={() => setIsAddingClass(true)}
                className="glass-effect rounded-2xl shadow-lg border-2 border-dashed border-white/40 p-8 hover:border-blue-400/70 hover:shadow-blue-200/50 hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col items-center justify-center min-h-[220px] transform hover:scale-[1.02] hover:rotate-1"
              >
                <PlusCircle className="w-16 h-16 text-blue-500/70 mb-6 animate-pulse-slow" />
                <p className="text-blue-600/80 font-medium text-lg">Add New Class</p>
              </div>

              {/* Existing Classes */}
              {classes.map((classItem) => (
                <div key={classItem.id} className="glass-effect rounded-2xl shadow-lg p-8 border border-white/30 transform transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:-rotate-1 group">
                  {editingClassId === classItem.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newClassTitle}
                        onChange={(e) => setNewClassTitle(e.target.value)}
                        className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                      />
                      <textarea
                        value={newClassDescription}
                        onChange={(e) => setNewClassDescription(e.target.value)}
                        className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 h-32"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveClassEdit(classItem.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <Image 
                            src={classItem.yubi_variant || '/Yubi2.svg'} 
                            alt="Yubi Logo" 
                            width={40} 
                            height={40} 
                            className="animate-bounce-slow"
                          />
                          <h2 className="text-xl font-semibold text-gray-900">{classItem.title}</h2>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingClass(classItem)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteClass(classItem.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{classItem.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => goToNotepad(classItem.id)}
                          className="flex-1 py-2 px-4 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Open Notes
                        </button>
                        <button
                          onClick={() => archiveClass(classItem)}
                          className="py-2 px-4 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Class Modal */}
        {isAddingClass && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Add New Class</h2>
              <input
                type="text"
                placeholder="Class Title"
                value={newClassTitle}
                onChange={(e) => setNewClassTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4"
              />
              <textarea
                placeholder="Class Description"
                value={newClassDescription}
                onChange={(e) => setNewClassDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4 h-32"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingClass(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addClass}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Class
                </button>
              </div>
            </div>
          </div>
        )}

        <YubiCompanion />
        <YubiPersonalization 
          isOpen={showYubiPersonalization} 
          onClose={() => setShowYubiPersonalization(false)} 
        />
      </div>
    </ProtectedRoute>
  )
}
