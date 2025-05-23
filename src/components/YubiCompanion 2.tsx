'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Flame, Trophy, Target, Sparkles } from 'lucide-react'
import gsap from 'gsap'

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
}

export default function YubiCompanion() {
  const [stats, setStats] = useState<YubiStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yubiStats')
      return saved ? JSON.parse(saved) : {
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
      }
    }
    return null
  })

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