'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Edit2, Trash2, Check, X, BookOpen, Home, Archive, Settings, LogOut } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Image from 'next/image'
import YubiCompanion from '@/components/YubiCompanion'
import YubiPersonalization from '@/components/YubiPersonalization'
import { createClient } from '@/utils/supabase/client'

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

interface Class {
  id: string
  title: string
  description: string
  yubiVariant?: string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [newClassTitle, setNewClassTitle] = useState('')
  const [newClassDescription, setNewClassDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingClass, setIsAddingClass] = useState(false)
  const [showYubiPersonalization, setShowYubiPersonalization] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Load classes from local storage on component mount
  useEffect(() => {
    const savedClasses = localStorage.getItem('userClasses')
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses))
    }
    setIsLoading(false)
  }, [])

  // Save classes to local storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('userClasses', JSON.stringify(classes))
    }
  }, [classes, isLoading])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const generateId = () => Date.now().toString()

  const addClass = () => {
    if (newClassTitle.trim() === '') return
    
    const newClass: Class = {
      id: generateId(),
      title: newClassTitle,
      description: newClassDescription,
      yubiVariant: getRandomYubiVariant()
    }
    
    setClasses([...classes, newClass])
    setNewClassTitle('')
    setNewClassDescription('')
    setIsAddingClass(false)
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

  const deleteClass = (id: string) => {
    setClasses(classes.filter(classItem => classItem.id !== id))
  }

  const goToNotepad = (classId: string) => {
    router.push(`/classes/${classId}`)
  }

  const archiveClass = (classToArchive: Class) => {
    // Remove from current classes
    setClasses(classes.filter(c => c.id !== classToArchive.id))
    
    // Add to archived classes
    const archivedClass = {
      ...classToArchive,
      archivedDate: new Date().toISOString()
    }
    
    const currentArchived = JSON.parse(localStorage.getItem('archivedClasses') || '[]')
    localStorage.setItem('archivedClasses', JSON.stringify([...currentArchived, archivedClass]))
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-4">
            <Image src="/Yubi2.svg" alt="Yubi Mascot" width={150} height={150} className="mb-8" />
            <nav className="space-y-2">
              <a href="/classes" className="flex items-center gap-2 p-2 bg-blue-50 text-blue-600 rounded">
                <Home className="w-5 h-5" />
                Classes
              </a>
              <a href="/archive" className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded">
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
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
              <button
                onClick={() => setIsAddingClass(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Add Class
              </button>
            </div>

            {isAddingClass && (
              <div className="mb-8 p-6 bg-white rounded-lg shadow">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Class Title"
                    value={newClassTitle}
                    onChange={(e) => setNewClassTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    placeholder="Class Description"
                    value={newClassDescription}
                    onChange={(e) => setNewClassDescription(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addClass}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsAddingClass(false)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <div key={classItem.id} className="bg-white rounded-lg shadow p-6">
                  {editingClassId === classItem.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newClassTitle}
                        onChange={(e) => setNewClassTitle(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      <textarea
                        value={newClassDescription}
                        onChange={(e) => setNewClassDescription(e.target.value)}
                        className="w-full p-2 border rounded"
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
                            src={classItem.yubiVariant || '/Yubi2.svg'} 
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

        {/* Keep YubiCompanion */}
        <YubiCompanion />
        <YubiPersonalization 
          isOpen={showYubiPersonalization} 
          onClose={() => setShowYubiPersonalization(false)} 
        />
      </div>
    </ProtectedRoute>
  )
}
