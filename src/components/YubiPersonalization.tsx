'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface YubiPersonalization {
  learningStyle: string
  interests: string[]
  communicationStyle: string
  motivationType: string
  customPrompts: {
    question: string
    response: string
  }[]
}

const LEARNING_STYLES = [
  'Visual',
  'Auditory',
  'Reading/Writing',
  'Kinesthetic'
]

const COMMUNICATION_STYLES = [
  'Encouraging & Supportive',
  'Direct & Concise',
  'Humorous & Playful',
  'Socratic & Questioning'
]

const MOTIVATION_TYPES = [
  'Goal-oriented',
  'Competition-driven',
  'Curiosity-led',
  'Recognition-seeking'
]

export default function YubiPersonalization({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const [settings, setSettings] = useState<YubiPersonalization>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yubiPersonalization')
      return saved ? JSON.parse(saved) : {
        learningStyle: 'Visual',
        interests: [],
        communicationStyle: 'Encouraging & Supportive',
        motivationType: 'Curiosity-led',
        customPrompts: []
      }
    }
    return null
  })

  const [newInterest, setNewInterest] = useState('')
  const [newPrompt, setNewPrompt] = useState({ question: '', response: '' })

  useEffect(() => {
    if (settings) {
      localStorage.setItem('yubiPersonalization', JSON.stringify(settings))
    }
  }, [settings])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold gradient-text">Personalize Your Yubi</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Learning Style */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How do you learn best?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LEARNING_STYLES.map(style => (
              <button
                key={style}
                onClick={() => setSettings(prev => ({ ...prev, learningStyle: style }))}
                className={`p-3 rounded-lg border transition-all ${
                  settings.learningStyle === style 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are your interests? (This helps Yubi provide relevant examples)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add an interest"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={() => {
                if (newInterest.trim()) {
                  setSettings(prev => ({
                    ...prev,
                    interests: [...prev.interests, newInterest.trim()]
                  }))
                  setNewInterest('')
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2"
              >
                {interest}
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    interests: prev.interests.filter((_, i) => i !== index)
                  }))}
                  className="text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Communication Style */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How should Yubi communicate with you?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {COMMUNICATION_STYLES.map(style => (
              <button
                key={style}
                onClick={() => setSettings(prev => ({ ...prev, communicationStyle: style }))}
                className={`p-3 rounded-lg border transition-all ${
                  settings.communicationStyle === style 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Motivation Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What motivates you to learn?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MOTIVATION_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSettings(prev => ({ ...prev, motivationType: type }))}
                className={`p-3 rounded-lg border transition-all ${
                  settings.motivationType === type 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompts */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Interactions (Optional)
          </label>
          <div className="space-y-4">
            {settings.customPrompts.map((prompt, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Q: {prompt.question}</p>
                    <p className="text-gray-600">A: {prompt.response}</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      customPrompts: prev.customPrompts.filter((_, i) => i !== index)
                    }))}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <input
                type="text"
                value={newPrompt.question}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, question: e.target.value }))}
                placeholder="When Yubi hears this..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={newPrompt.response}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, response: e.target.value }))}
                placeholder="Yubi should respond with..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={() => {
                  if (newPrompt.question.trim() && newPrompt.response.trim()) {
                    setSettings(prev => ({
                      ...prev,
                      customPrompts: [...prev.customPrompts, newPrompt]
                    }))
                    setNewPrompt({ question: '', response: '' })
                  }
                }}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Custom Interaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}