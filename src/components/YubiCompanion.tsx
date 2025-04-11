'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Flame, Trophy, Target, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { getUserSettings } from '@/utils/supabase/user-settings'
import { getPersonalization } from '@/utils/supabase/database'

interface YubiStats {
  name: string
  streak: number
  lastStudied: string
  totalHours: number
  level: number
  mood: 'happy' | 'proud' | 'encouraging' | 'sleepy'
  goals: {
    daily: number
    weekly: number
  }
  personalization?: {
    learningStyle: string
    interests: string[]
    communicationStyle: string
    motivationType: string
    customPrompts: {
      question: string
      response: string
    }[]
  }
  userSettings?: {
    display_name: string
    age_group: string
    education_level: string
    study_goals: string[]
  }
}

export default function YubiCompanion() {
  const [stats, setStats] = useState<YubiStats>(() => ({
    name: '',
    streak: 0,
    lastStudied: new Date().toISOString(),
    totalHours: 0,
    level: 1,
    mood: 'happy',
    goals: {
      daily: 2,
      weekly: 10
    }
  }))

  const [isFirstTime, setIsFirstTime] = useState(true)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem('yubiInitialized')
    if (!hasVisited) {
      setShowSetup(true)
      localStorage.setItem('yubiInitialized', 'true')
    }
  }, [])

  useEffect(() => {
    // Animate Yubi's presence
    gsap.to('.yubi-companion', {
      y: 10,
      rotation: 3,
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    })

    // Animate fire streak
    gsap.to('.streak-fire', {
      scale: 1.1,
      duration: 0.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    })
  }, [])

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await getUserSettings()
        if (settings) {
          setStats(prev => ({
            ...prev,
            name: settings.display_name,
            userSettings: settings
          }))
        }
      } catch (error) {
        console.error('Error loading user settings:', error)
      }
    }
    
    loadUserSettings()
  }, [])

  useEffect(() => {
    const loadPersonalization = async () => {
      try {
        const personalizationData = await getPersonalization()
        if (personalizationData) {
          setStats(prev => ({
            ...prev,
            personalization: {
              learningStyle: personalizationData.learning_style,
              interests: personalizationData.interests,
              communicationStyle: personalizationData.communication_style,
              motivationType: personalizationData.motivation_type,
              customPrompts: personalizationData.custom_prompts
            }
          }))
        }
      } catch (error) {
        console.error('Error loading personalization:', error)
      }
    }

    loadPersonalization()
  }, [])

  const completeSetup = (name: string) => {
    setStats(prev => ({
      ...prev,
      name
    }))
    setShowSetup(false)
    localStorage.setItem('yubiStats', JSON.stringify({
      ...stats,
      name
    }))
  }

  const getYubiMood = () => {
    const hour = new Date().getHours()
    if (hour < 6) return 'sleepy'
    if (stats.streak > 5) return 'proud'
    if (stats.streak > 0) return 'happy'
    return 'encouraging'
  }

  const getYubiResponse = (message: string) => {
    const personalization = stats?.personalization
    const userSettings = stats?.userSettings
    
    // Include user's name and education level in the response context
    const userName = userSettings?.display_name || stats.name
    const educationLevel = userSettings?.education_level
    const studyGoals = userSettings?.study_goals || []
    
    console.log('Generating response with user context:', {
      name: userName,
      educationLevel,
      studyGoals
    })

    // Check for custom prompts first
    const customPrompt = personalization?.customPrompts.find(
      p => message.toLowerCase().includes(p.question.toLowerCase())
    )
    if (customPrompt) {
      console.log('Found matching custom prompt:', customPrompt);
      return customPrompt.response;
    }

    // Otherwise generate contextual response based on personalization
    const style = personalization?.communicationStyle || 'Encouraging & Supportive'
    const interests = personalization?.interests || []
    
    console.log('Using communication style:', style);
    console.log('Available interests:', interests);
    
    // Add personality to responses based on communication style
    switch (style) {
      case 'Encouraging & Supportive':
        return `You're doing great! Let's keep learning about ${interests[0] || 'this topic'}! 💪`
      case 'Direct & Concise':
        return `Focus on the key concepts. Ready to continue?`
      case 'Humorous & Playful':
        return `Hey there! Did you hear about the math book that was sad? It had too many problems! 😄`
      case 'Socratic & Questioning':
        return `What aspects of ${interests[0] || 'this topic'} interest you the most? Let's explore deeper!`
      default:
        return `Let's keep learning together!`
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showSetup ? (
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 w-80">
          <h3 className="text-xl font-bold mb-4 gradient-text">Welcome to StudyBuddy!</h3>
          <p className="text-gray-600 mb-4">Let's personalize your experience with Yubi!</p>
          <input
            type="text"
            placeholder="What should Yubi call you?"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-4"
            onChange={(e) => completeSetup(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-end space-y-4">
          {/* Stats Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 w-64">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 streak-fire" />
                <span className="font-bold text-lg">{stats.streak} day streak!</span>
              </div>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Level {stats.level}</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${(stats.totalHours % 10) * 10}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Daily Goal</span>
                <span>{stats.totalHours}/{stats.goals.daily}hrs</span>
              </div>
            </div>
          </div>

          {/* Yubi Character */}
          <div className="relative group">
            <div className="absolute -top-16 right-0 bg-white/90 backdrop-blur-lg rounded-xl p-3 shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48">
              <p className="text-sm text-gray-600">
                {stats.name && `Hey ${stats.name}! `}
                {getYubiMood() === 'proud' && "You're doing amazing! Keep it up! 🌟"}
                {getYubiMood() === 'happy' && "Ready to learn something new? 📚"}
                {getYubiMood() === 'encouraging' && "Let's start studying! 💪"}
                {getYubiMood() === 'sleepy' && "Studying late? Don't forget to rest! 😴"}
              </p>
            </div>
            <div className="yubi-companion relative">
              <Image
                src={`/Yubi-${getYubiMood()}.svg`}
                alt="Yubi"
                width={80}
                height={80}
                className="cursor-pointer hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
