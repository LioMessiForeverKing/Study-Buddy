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
    <div className="min-h-screen p-4 md:p-8 bg-white">
      <button
        onClick={() => router.push('/classes')}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Classes
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-8">
              <Image
                src="/Yubi-happy.svg"
                alt="Yubi"
                width={120}
                height={120}
                className="mx-auto mb-6"
              />
              <h1 className="text-3xl font-bold mb-2">Your Profile Settings</h1>
              <p className="text-gray-600">View and manage your learning preferences</p>
            </div>

            <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  {settings.display_name}
                </div>
              </div>

              {/* Age Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  {settings.age_group}
                </div>
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
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
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => window.location.href = '/settings/onboarding'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
