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
import { getUserSettings } from '@/utils/supabase/user-settings'
import { getClasses, addClass, updateClass, deleteClass, archiveClass, Class } from '@/utils/supabase/classes'

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
  const router = useRouter()
  const supabase = createClient()

  // Load classes from Supabase on component mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadClasses();
  }, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const settings = await getUserSettings()
        setNeedsOnboarding(!settings)
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      }
    }
    checkOnboarding()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAddClass = async () => {
    if (newClassTitle.trim() === '') return;
    
    try {
      const newClass = await addClass({
        title: newClassTitle,
        description: newClassDescription,
        yubi_variant: getRandomYubiVariant() // Note the underscore here
      });
      
      setClasses([newClass, ...classes]);
      setNewClassTitle('');
      setNewClassDescription('');
      setIsAddingClass(false);
    } catch (error) {
      console.error('Error adding class:', error);
    }
  };

  const startEditingClass = (classItem: Class) => {
    setEditingClassId(classItem.id)
    setNewClassTitle(classItem.title)
    setNewClassDescription(classItem.description)
  }

  const handleSaveClassEdit = async (id: string) => {
    try {
      const updatedClass = await updateClass(id, {
        title: newClassTitle,
        description: newClassDescription
      });
      
      setClasses(classes.map(c => c.id === id ? updatedClass : c));
      setEditingClassId(null);
      setNewClassTitle('');
      setNewClassDescription('');
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  const cancelEditing = () => {
    setEditingClassId(null)
    setNewClassTitle('')
    setNewClassDescription('')
  }

  const handleDeleteClass = async (id: string) => {
    try {
      await deleteClass(id);
      setClasses(classes.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const goToNotepad = (classId: string) => {
    router.push(`/classes/${classId}`)
  }

  const handleArchiveClass = async (classToArchive: Class) => {
    try {
      await archiveClass(classToArchive.id);
      setClasses(classes.filter(c => c.id !== classToArchive.id));
    } catch (error) {
      console.error('Error archiving class:', error);
    }
  };

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
            {/* Header with Yubi Personalization */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowYubiPersonalization(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Sliders className="w-5 h-5" />
                  Customize Yubi
                </button>
              </div>
            </div>

            {needsOnboarding && (
              <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image src="/Yubi-happy.svg" alt="Yubi" width={40} height={40} />
                    <p className="text-purple-700">Hey there! Let's make your learning experience more personal!</p>
                  </div>
                  <button
                    onClick={() => router.push('/settings/onboarding')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Complete Setup
                  </button>
                </div>
              </div>
            )}

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add Class Card */}
              <div 
                onClick={() => setIsAddingClass(true)}
                className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 p-6 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
              >
                <PlusCircle className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Add New Class</p>
              </div>

              {/* Existing Classes */}
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
                          onClick={() => handleSaveClassEdit(classItem.id)}
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
                            onClick={() => handleDeleteClass(classItem.id)}
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
                          onClick={() => handleArchiveClass(classItem)}
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
                  onClick={handleAddClass}
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
