'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  BookOpen, 
  Home, 
  Archive, 
  Settings, 
  BookText, 
  Sparkles,
  LogOut
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Image from 'next/image'

interface Class {
  id: string
  title: string
  description: string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [newClassTitle, setNewClassTitle] = useState('')
  const [newClassDescription, setNewClassDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('home')
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

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

  // Get subject icon based on class title
  const getSubjectIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('english')) return '/monkey-english.svg'
    if (lowerTitle.includes('history')) return '/monkey-history.svg'
    if (lowerTitle.includes('algebra') || lowerTitle.includes('math')) return '/monkey-algebra.svg'
    if (lowerTitle.includes('science')) return '/monkey-science.svg'
    if (lowerTitle.includes('art')) return '/monkey-art.svg'
    
    // Default icons based on first letter
    const firstChar = lowerTitle.charAt(0)
    if ('abc'.includes(firstChar)) return '/monkey-english.svg'
    if ('def'.includes(firstChar)) return '/monkey-history.svg'
    if ('ghij'.includes(firstChar)) return '/monkey-algebra.svg'
    if ('klmn'.includes(firstChar)) return '/monkey-science.svg'
    if ('opqr'.includes(firstChar)) return '/monkey-art.svg'
    
    return '/monkey-english.svg' // Default
  }

  // Get gradient background based on class title
  const getGradientBackground = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('english')) return 'bg-gradient-to-br from-cyan-100 to-cyan-300'
    if (lowerTitle.includes('history')) return 'bg-gradient-to-br from-pink-100 to-purple-300'
    if (lowerTitle.includes('algebra') || lowerTitle.includes('math')) return 'bg-gradient-to-br from-yellow-100 to-yellow-300'
    if (lowerTitle.includes('science')) return 'bg-gradient-to-br from-green-100 to-blue-300'
    if (lowerTitle.includes('art')) return 'bg-gradient-to-br from-orange-100 to-red-300'
    
    // Default gradients based on first letter
    const firstChar = lowerTitle.charAt(0)
    if ('abc'.includes(firstChar)) return 'bg-gradient-to-br from-cyan-100 to-cyan-300'
    if ('def'.includes(firstChar)) return 'bg-gradient-to-br from-pink-100 to-purple-300'
    if ('ghij'.includes(firstChar)) return 'bg-gradient-to-br from-yellow-100 to-yellow-300'
    if ('klmn'.includes(firstChar)) return 'bg-gradient-to-br from-green-100 to-blue-300'
    if ('opqr'.includes(firstChar)) return 'bg-gradient-to-br from-orange-100 to-red-300'
    
    return 'bg-gradient-to-br from-blue-100 to-blue-300' // Default
  }

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md z-10">
          <div className="p-4 flex items-center gap-2">
            <Image src="/Yubi2.svg" alt="StudyBuddy Logo" width={40} height={40} />
            <h1 className="text-xl font-bold">StudyBuddy</h1>
          </div>
          
          <nav className="mt-6">
            <ul className="space-y-2">
              <li>
                <button 
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                  onClick={() => setActiveTab('home')}
                >
                  <Home className="mr-3" size={20} />
                  <span>Home</span>
                </button>
              </li>
              
              {/* Dynamic class navigation items */}
              {classes.map((classItem) => (
                <li key={classItem.id}>
                  <button 
                    className={`flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors ${activeTab === classItem.id ? 'bg-gray-100 text-blue-500' : ''}`}
                    onClick={() => setActiveTab(classItem.id)}
                  >
                    <BookText className="mr-3" size={20} />
                    <span>{classItem.title}</span>
                  </button>
                </li>
              ))}
              <li className="border-t border-gray-200 mt-4 pt-4">
                <button 
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                  onClick={() => setActiveTab('new')}
                >
                  <PlusCircle className="mr-3" size={20} />
                  <span>New Course</span>
                </button>
              </li>
              <li>
                <button 
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                  onClick={() => setActiveTab('archived')}
                >
                  <Archive className="mr-3" size={20} />
                  <span>Archived Courses</span>
                </button>
              </li>
              <li>
                <button 
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                >
                  <Settings className="mr-3" size={20} />
                  <span>Settings</span>
                </button>
              </li>
              <li className="border-t border-gray-200 mt-4 pt-4">
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <LogOut className="mr-3" size={20} />
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Your Courses</h1>
              <p className="text-gray-600 mt-2">Jump back in — brush up on your skills or learn something new!</p>
              
              {/* Tabs */}
              <div className="flex mt-6 border-b border-gray-200 overflow-x-auto pb-1">
                {/* Fixed tabs */}
                <button 
                  className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'home' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('home')}
                >
                  Home
                </button>
                
                {/* Dynamic class tabs */}
                {classes.length > 0 && classes.map((classItem) => (
                  <button 
                    key={classItem.id}
                    className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === classItem.id ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab(classItem.id)}
                  >
                    {classItem.title}
                  </button>
                ))}
                
                {/* Additional fixed tabs */}
                <button 
                  className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'new' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('new')}
                >
                  New Course
                </button>
                <button 
                  className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'archived' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('archived')}
                >
                  Archived Courses
                </button>
              </div>
            </div>

            {/* New Class Form */}
            {activeTab === 'new' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="classTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title
                    </label>
                    <input
                      type="text"
                      id="classTitle"
                      value={newClassTitle}
                      onChange={(e) => setNewClassTitle(e.target.value)}
                      placeholder="Enter course title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="classDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      id="classDescription"
                      value={newClassDescription}
                      onChange={(e) => setNewClassDescription(e.target.value)}
                      placeholder="Enter description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={addClass}
                    disabled={!newClassTitle.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Course
                  </button>
                </div>
              </div>
            )}

            {/* Course Grid */}
            {(activeTab === 'home' || activeTab.match(/english|history|algebra|science|art/) || classes.some(c => c.id === activeTab)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Filter classes based on active tab */}
                {classes
                  .filter(classItem => {
                    if (activeTab === 'home') return true;
                    if (activeTab === classItem.id) return true;
                    return classItem.title.toLowerCase().includes(activeTab);
                  })
                  .map((classItem) => (
                    <div 
                      key={classItem.id} 
                      className={`rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${getGradientBackground(classItem.title)}`}
                    >
                      {editingClassId === classItem.id ? (
                        <div className="p-4 bg-white space-y-3">
                          <div className="space-y-1">
                            <label htmlFor={`editTitle-${classItem.id}`} className="block text-sm font-medium text-gray-700">
                              Course Title
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
                          <div className="p-6 flex justify-center">
                            <Image 
                              src={getSubjectIcon(classItem.title)} 
                              alt={classItem.title} 
                              width={120} 
                              height={120} 
                              className="object-contain"
                            />
                          </div>
                          <div className="p-4 bg-white">
                            <h3 className="text-xl font-bold mb-1">{classItem.title}</h3>
                            <p className="text-gray-600 mb-4 text-sm">{classItem.description}</p>
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
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                              >
                                <BookOpen size={16} />
                                Open
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                {/* New Course Card */}
                {activeTab === 'home' && (
                  <div 
                    className="rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer"
                    onClick={() => setActiveTab('new')}
                  >
                    <div className="p-6 flex justify-center">
                      <Image 
                        src="/new-course.svg" 
                        alt="New Course" 
                        width={120} 
                        height={120} 
                        className="object-contain"
                      />
                    </div>
                    <div className="p-4 bg-white text-center">
                      <h3 className="text-xl font-bold mb-1">New Course</h3>
                      <p className="text-gray-600 mb-4 text-sm">Create a new course to get started</p>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {classes.length === 0 && activeTab === 'home' && (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-gray-500">You haven&apos;t created any courses yet.</p>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                      <PlusCircle size={18} />
                      Create Your First Course
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Archived Courses */}
            {activeTab === 'archived' && (
              <div className="text-center py-12">
                <p className="text-gray-500">No archived courses found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
