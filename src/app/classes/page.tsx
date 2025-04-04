'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Edit2, Trash2, Check, X, BookOpen } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

interface Class {
  id: string
  title: string
  description: string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [isAddingClass, setIsAddingClass] = useState(false)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [newClassTitle, setNewClassTitle] = useState('')
  const [newClassDescription, setNewClassDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
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

  // Generate a unique ID for new classes
  const generateId = () => {
    return Date.now().toString()
  }

  // Add a new class
  const addClass = () => {
    if (newClassTitle.trim() === '') return
    
    const newClass: Class = {
      id: generateId(),
      title: newClassTitle,
      description: newClassDescription
    }
    
    setClasses([...classes, newClass])
    setNewClassTitle('')
    setNewClassDescription('')
    setIsAddingClass(false)
  }

  // Start editing a class
  const startEditingClass = (classItem: Class) => {
    setEditingClassId(classItem.id)
    setNewClassTitle(classItem.title)
    setNewClassDescription(classItem.description)
  }

  // Save class edits
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

  // Cancel editing
  const cancelEditing = () => {
    setEditingClassId(null)
    setNewClassTitle('')
    setNewClassDescription('')
  }

  // Delete a class
  const deleteClass = (id: string) => {
    setClasses(classes.filter(classItem => classItem.id !== id))
  }

  // Navigate to the notepad page for a specific class
  const goToNotepad = (classId: string) => {
    router.push(`/classes/${classId}`)
  }

  return (
    <ProtectedRoute>
      <main className="relative min-h-screen bg-white text-gray-800 overflow-hidden">
        {/* Logo */}
        <div className="absolute top-4 left-4 z-50">
          <Image src="/Yubi2.svg" alt="Yubi Logo" width={100} height={100} className="animate-float" />
        </div>

        {/* Animated Google Gradient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-200px] left-[-150px] w-[600px] h-[600px] bg-[radial-gradient(closest-side,_#4285F4,_transparent)] animate-pulse-slow blur-3xl opacity-30" />
          <div className="absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] bg-[radial-gradient(closest-side,_#34A853,_transparent)] animate-pulse-slow blur-3xl opacity-30" />
          <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-[radial-gradient(closest-side,_#FBBC05,_transparent)] animate-pulse-slow blur-2xl opacity-20" />
          
          {/* Educational Elements */}
          <div className="absolute top-[20%] left-[10%] w-[100px] h-[100px] border-4 border-[#4285F4] rounded-full animate-float opacity-20" />
          <div className="absolute bottom-[30%] right-[40%] w-[80px] h-[80px] border-4 border-[#34A853] rotate-45 animate-float opacity-20" />
          <div className="absolute top-[40%] left-[30%] w-[60px] h-[60px] border-4 border-[#FBBC05] rounded-lg animate-float opacity-20" />
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
              Class Management
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Create and manage your classes. Each class has its own notepad for taking notes.
            </p>
          </div>

          {/* Glassmorphic Class Manager Wrapper */}
          <div className="relative bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl rounded-3xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 
                className="text-3xl font-bold" 
                style={{
                  background: 'linear-gradient(to right, #4285F4, #34A853, #FBBC05, #EA4335)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                My Classes
              </h2>
              
              {!isAddingClass ? (
                <button
                  onClick={() => setIsAddingClass(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white rounded-lg hover:from-[#FBBC05] hover:to-[#EA4335] transition-all"
                >
                  <PlusCircle size={18} />
                  Add Class
                </button>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="space-y-1">
                    <label htmlFor="classTitle" className="block text-sm font-medium text-gray-700">
                      Class Title
                    </label>
                    <input
                      type="text"
                      id="classTitle"
                      value={newClassTitle}
                      onChange={(e) => setNewClassTitle(e.target.value)}
                      placeholder="Enter class title"
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="classDescription" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      id="classDescription"
                      value={newClassDescription}
                      onChange={(e) => setNewClassDescription(e.target.value)}
                      placeholder="Enter description"
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={addClass}
                    disabled={!newClassTitle.trim()}
                    className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => setIsAddingClass(false)}
                    className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Class Cards Grid */}
            {classes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven't created any classes yet.</p>
                <button
                  onClick={() => setIsAddingClass(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white rounded-lg hover:from-[#FBBC05] hover:to-[#EA4335] transition-all"
                >
                  <PlusCircle size={18} />
                  Create Your First Class
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
                  <div key={classItem.id} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                    {editingClassId === classItem.id ? (
                      <div className="p-4 space-y-3">
                        <div className="space-y-1">
                          <label htmlFor={`editTitle-${classItem.id}`} className="block text-sm font-medium text-gray-700">
                            Class Title
                          </label>
                          <input
                            type="text"
                            id={`editTitle-${classItem.id}`}
                            value={newClassTitle}
                            onChange={(e) => setNewClassTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`editDescription-${classItem.id}`} className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            type="text"
                            id={`editDescription-${classItem.id}`}
                            value={newClassDescription}
                            onChange={(e) => setNewClassDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => saveClassEdit(classItem.id)}
                            disabled={!newClassTitle.trim()}
                            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-4">
                          <h3 className="text-xl font-bold mb-2">{classItem.title}</h3>
                          <p className="text-gray-600 mb-4">{classItem.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditingClass(classItem)}
                                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => deleteClass(classItem.id)}
                                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <button
                              onClick={() => goToNotepad(classItem.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white rounded-lg hover:from-[#FBBC05] hover:to-[#EA4335] transition-all"
                            >
                              <BookOpen size={16} />
                              Open Notepad
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}