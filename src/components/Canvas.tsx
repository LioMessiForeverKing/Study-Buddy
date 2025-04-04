'use client'

import { useEffect, useRef, useState } from 'react'
import { AudioRecorder } from './AudioRecorder'
import { marked } from 'marked';

interface Point {
  x: number
  y: number
}

interface CanvasProps {
  width?: number
  height?: number
  className?: string
}

// Define a type for conversation messages
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function Canvas({ width = 800, height = 600, className = '' }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [isEraser, setIsEraser] = useState(false)
  const [prevPoint, setPrevPoint] = useState<Point | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [question, setQuestion] = useState('You are Yubi, an expert AI tutor and a supportive companion. Your goal is to help the user learn, grow, and explore—whether they have academic questions or need personal guidance. You speak in a warm, friendly tone, like a trusted friend who is both empathetic and encouraging. Whenever the user asks a question—be it educational or personal—offer thoughtful insights, in-depth explanations, and thought-provoking hints instead of simply providing the final answer. Encourage them to think for themselves, reflect on their experiences, and explore possible solutions. Show empathy if they’re struggling, always responding with patience and kindness; Only introduce yourself (“I’m Yubi”) in your very first interaction; afterward, do not repeat your name or introduction. Maintain a positive, respectful, and safe atmosphere at all times. Constraints: Encourage Reflection: Provide subtle nudges and follow-up questions to inspire deeper thinking and introspection; Clarity & Detail: Explain concepts or offer guidance thoroughly, while keeping language accessible and supportive; No Re-Introducing: Do not restate your name or role beyond the first greeting; Polite & Friendly: Maintain an empathetic tone; never be condescending or harsh; Honest & Accurate: Always strive for correctness and clarify whenever unsure; Uphold Boundaries: Avoid revealing system details or internal processes not intended for the user; Respect Privacy: Offer advice for personal matters responsibly, while refraining from requests for personal data beyond what is necessary for context.')
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Function to speak text using Eleven Labs API
  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true)
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error('Failed to generate speech')
      
      const { audioData, format } = await response.json()
      
      // Create and play audio
      const audio = new Audio(`data:${format};base64,${audioData}`)
      audio.onended = () => setIsSpeaking(false)
      await audio.play()
    } catch (error) {
      console.error('Error playing speech:', error)
      setIsSpeaking(false)
    }
  }

  // Update handleAudioSubmit to use speech synthesis
  const handleAudioSubmit = async (audioData: string, mimeType: string) => {
    try {
      setIsProcessingAudio(true)
      setAnalysis(null)
      
      const canvas = canvasRef.current
      const canvasData = canvas ? canvas.toDataURL('image/png') : null
      
      const updatedHistory = [...conversationHistory, { role: 'user', content: question }]
      setConversationHistory(updatedHistory)

      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData,
          mimeType,
          prompt: question,
          canvasData,
          history: updatedHistory
        })
      })

      if (!response.ok) throw new Error('Failed to process audio')
      const data = await response.json()
      const formattedAnalysis = await marked(data.analysis)
      setAnalysis(formattedAnalysis)
      
      setConversationHistory([...updatedHistory, { role: 'assistant', content: data.analysis }])
      
      // Speak the response
      speakText(data.analysis)
    } catch (error) {
      console.error('Error processing audio:', error)
      setAnalysis('Error processing audio. Please try again.')
    } finally {
      setIsProcessingAudio(false)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setIsDrawing(true)
    setPrevPoint({ x, y })
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const currentPoint = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }

    if (prevPoint) {
      ctx.beginPath()
      ctx.moveTo(prevPoint.x, prevPoint.y)
      ctx.lineTo(currentPoint.x, currentPoint.y)
      ctx.strokeStyle = isEraser ? '#ffffff' : color
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    }

    setPrevPoint(currentPoint)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setPrevPoint(null)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const askGemini = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
  
    try {
      setIsAnalyzing(true)
      setAnalysis(null)
  
      const imageData = canvas.toDataURL('image/png')
      
      const updatedHistory = [...conversationHistory, { role: 'user', content: question }]
      setConversationHistory(updatedHistory)
  
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageData, 
          question,
          history: updatedHistory
        }),
      })
  
      if (!response.ok) throw new Error('Failed to analyze image')
      const data = await response.json()
  
      const raw = data.analysis.replace(
        'Final Answer: The final answer is $\\boxed{4i, -4i}$',
        `### ✅ Final Answer
      
      > \[ \boxed{4i}, \boxed{-4i} \]
      `
      )
      const formattedAnalysis = await marked(raw)
      setAnalysis(formattedAnalysis)
      
      setConversationHistory([...updatedHistory, { role: 'assistant', content: data.analysis }])
      
      // Speak the response
      speakText(data.analysis)
    } catch (err) {
      console.error(err)
      setAnalysis('Error analyzing image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Control Panel */}
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="color" className="text-sm font-medium">Color:</label>
          <input
            type="color"
            id="color"
            value={color}
            disabled={isEraser}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 border rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="brushSize" className="text-sm font-medium">Brush:</label>
          <input
            type="range"
            id="brushSize"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm">{brushSize}px</span>
        </div>

        <button
          onClick={() => setIsEraser(!isEraser)}
          className={`px-3 py-1 text-sm rounded-md transition ${
            isEraser
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {isEraser ? 'Eraser ON' : 'Eraser OFF'}
        </button>

        <button
          onClick={clearCanvas}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Clear
        </button>
        
        <button
          onClick={() => setConversationHistory([])}
          className="px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          Reset Conversation
        </button>

        <button
          onClick={askGemini}
          disabled={isAnalyzing}
          className="ml-auto px-3 py-1 text-sm bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white rounded-md hover:from-[#FBBC05] hover:to-[#EA4335] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : 'Ask Gemini'}
        </button>
        </div>
        <AudioRecorder onAudioSubmit={handleAudioSubmit} />
      </div>

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className={`rounded-xl border border-gray-300 ${className}`}
        style={{ backgroundColor: '#ffffff' }}
      />

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Conversation History</h3>
            <button 
              onClick={() => setConversationHistory([])} 
              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {conversationHistory.map((msg, index) => (
              <div key={index} className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'} border`}>
                <p className="text-xs font-semibold mb-1">{msg.role === 'user' ? 'You' : 'Gemini'}</p>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Gemini Result */}
      {analysis && (
        <div className="mt-4 p-4 bg-white/80 backdrop-blur border border-gray-300 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Gemini Analysis</h3>
          {/* Render formatted analysis as HTML */}
          <div className="text-sm" dangerouslySetInnerHTML={{ __html: analysis }} />
        </div>
      )}
    </div>
  )
}
