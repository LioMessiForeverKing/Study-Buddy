'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface YubiStats {
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
}

export default function YubiCompanion() {
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState<YubiStats>()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Load personalization settings from localStorage
    const savedSettings = localStorage.getItem('yubiPersonalization')
    if (savedSettings) {
      setStats({ personalization: JSON.parse(savedSettings) })
    }
  }, [])

  const getYubiResponse = (message: string) => {
    const personalization = stats?.personalization

    // Check for custom prompts first
    const customPrompt = personalization?.customPrompts.find(
      p => message.toLowerCase().includes(p.question.toLowerCase())
    )
    if (customPrompt) return customPrompt.response

    // Otherwise generate contextual response based on personalization
    const style = personalization?.communicationStyle || 'Encouraging & Supportive'
    const interests = personalization?.interests || []
    
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    
    // Add user message to chat
    const response = getYubiResponse(message)
    setMessage('')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isVisible ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 w-[300px]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Image
                src="/Yubi3.svg"
                alt="Yubi"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-semibold">Yubi</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Yubi something..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white rounded-lg hover:from-[#FBBC05] hover:to-[#EA4335]"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white p-3 rounded-full shadow-lg hover:from-[#FBBC05] hover:to-[#EA4335]"
        >
          <Image
            src="/Yubi3.svg"
            alt="Yubi"
            width={40}
            height={40}
            className="rounded-full"
          />
        </button>
      )}
    </div>
  )
}
