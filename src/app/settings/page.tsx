'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSettings, UserSettings } from '@/utils/supabase/user-settings'
import Image from 'next/image'
import { X, ChevronLeft } from 'lucide-react'

const AGE_GROUPS = ['13-17', '18-24', '25-34', '35-44', '45+']
const EDUCATION_LEVELS = ['High School', 'College', 'Graduate', 'Self-Taught', 'Professional']

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await getUserSettings()
        setSettings(userSettings)
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No settings found. Please complete the onboarding process.</p>
          <button
            onClick={() => window.location.href = '/settings/onboarding'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-blue-400 mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute top-[40%] left-[25%] w-96 h-96 rounded-full bg-purple-400 mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-[20%] right-[15%] w-72 h-72 rounded-full bg-green-400 mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-[10%] right-[20%] w-80 h-80 rounded-full bg-yellow-400 mix-blend-multiply filter blur-3xl animate-float"></div>
        </div>
      </div>
      
      <div className="p-4 md:p-8 relative z-10">
        <button
          onClick={() => router.push('/classes')}
          className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-lg text-gray-700 font-medium transition-all duration-300 shadow-sm hover:shadow-md mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Classes
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold gradient-text mb-8">Settings</h1>
          <div className="backdrop-blur-sm py-12">
            <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-8">
              <Image
                src="/Yubi-happy.svg"
                alt="Yubi"
                width={120}
                height={120}
                className="mx-auto mb-6 animate-bounce-slow"
              />
              <h1 className="text-3xl font-bold mb-2 gradient-text">Your Profile Settings</h1>
              <p className="text-gray-600">View and manage your learning preferences</p>
            </div>

            <div className="space-y-6 glass-effect p-8 rounded-2xl shadow-lg border border-white/30">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm">
                  {settings.display_name}
                </div>
              </div>

              {/* Age Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group
                </label>
                <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm">
                  {settings.age_group}
                </div>
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level
                </label>
                <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm">
                  {settings.education_level}
                </div>
              </div>

              {/* Study Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Goals
                </label>
                <div className="space-y-2">
                  {settings.study_goals.map((goal, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/70"
                    >
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => window.location.href = '/settings/onboarding'}
                  className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300"
                >
                  Edit Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
