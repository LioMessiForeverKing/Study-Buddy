'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saveUserSettings, getUserSettings, UserSettings } from '@/utils/supabase/user-settings'
import Image from 'next/image'
import { X } from 'lucide-react'

const AGE_GROUPS = ['13-17', '18-24', '25-34', '35-44', '45+']
const EDUCATION_LEVELS = ['High School', 'College', 'Graduate', 'Self-Taught', 'Professional']

export default function OnboardingPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Omit<UserSettings, 'id'>>({
    display_name: '',
    age_group: '',
    education_level: '',
    study_goals: []
  })
  const [newGoal, setNewGoal] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await getUserSettings()
        if (userSettings) {
          setSettings({
            display_name: userSettings.display_name,
            age_group: userSettings.age_group,
            education_level: userSettings.education_level,
            study_goals: userSettings.study_goals
          })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (newGoal.trim()) {
      setSettings(prev => ({
        ...prev,
        study_goals: [...prev.study_goals, newGoal.trim()]
      }))
      setNewGoal('')
    }
  }

  const handleRemoveGoal = (goalToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      study_goals: prev.study_goals.filter(goal => goal !== goalToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await saveUserSettings(settings)
      router.push('/classes')
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
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
          <h1 className="text-3xl font-bold mb-2">Your Learning Profile</h1>
          <p className="text-gray-600">Update your preferences to personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What should we call you?
            </label>
            <input
              type="text"
              value={settings.display_name}
              onChange={(e) => setSettings(prev => ({ ...prev, display_name: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Group
            </label>
            <select
              value={settings.age_group}
              onChange={(e) => setSettings(prev => ({ ...prev, age_group: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select age group</option>
              {AGE_GROUPS.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education Level
            </label>
            <select
              value={settings.education_level}
              onChange={(e) => setSettings(prev => ({ ...prev, education_level: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select education level</option>
              {EDUCATION_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Goals
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Enter a study goal"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {settings.study_goals.map((goal, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span>{goal}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(goal)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/classes')}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
