'use client'

import { useEffect, useRef, useState } from 'react'
import { AudioRecorder } from './AudioRecorder'
import { marked } from 'marked'
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { getUserSettings } from '@/utils/supabase/user-settings'
import { getPersonalization } from '@/utils/supabase/database'
import { chaptersService } from '@/utils/supabase/chapters'

interface Point {
  x: number
  y: number
}

interface TextElement {
  id: string
  x: number
  y: number
  text: string
  color: string
  fontSize: number
  isDragging: boolean
}

interface CanvasPage {
  id: string
  textElements: TextElement[]
  imageData?: string
}

interface PageDataWithImage {
  id: string
  imageData: string
  textElements: TextElement[]
}

interface CanvasProps {
  width?: number
  height?: number
  className?: string
  chapterId: string
  classId: string
}

// Define a type for conversation messages
interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export function Canvas({ 
  width = 1100, 
  height = 1100, 
  className = '',
  chapterId,
  classId 
}: CanvasProps) {
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
  
  // Text tool state
  const [isTextTool, setIsTextTool] = useState(false)
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [activeTextId, setActiveTextId] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(16)
  
  // Multi-page state
  const [pages, setPages] = useState<CanvasPage[]>([{ id: '1', textElements: [] }])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

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

  // Add this function to get all pages data
  const getAllPagesData = (): PageDataWithImage[] => {
    const canvas = canvasRef.current;
    if (!canvas) {
      // If no canvas, create a blank white image data
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }
      const blankImageData = tempCanvas.toDataURL('image/png');
      
      return pages.map(page => ({
        id: page.id,
        imageData: page.imageData || blankImageData,
        textElements: page.textElements
      }));
    }

    // Save current page before getting all data
    saveCurrentPage();

    return pages.map(page => ({
      id: page.id,
      imageData: page.imageData || canvas.toDataURL('image/png'),
      textElements: page.textElements
    }));
  };

  // Update handleAudioSubmit to use speech synthesis
  const handleAudioSubmit = async (audioData: string, mimeType: string) => {
    try {
      setIsProcessingAudio(true);
      setAnalysis(null);
      
      saveCurrentPage();
      
      const canvas = canvasRef.current;
      const currentCanvasData = canvas ? canvas.toDataURL('image/png') : null;
      
      const allPagesData = getAllPagesData();
      
      // Get personalization data from Supabase
      const personalizationData = await getPersonalization();
      
      // Get user settings
      const userSettings = await getUserSettings();

      // Create the new user message
      const newUserMessage: ConversationMessage = {
        role: 'user' as const,
        content: question
      };

      // Create updated history array
      const updatedHistory: ConversationMessage[] = [
        ...conversationHistory,
        newUserMessage
      ];

      // Transform the data to match the expected format
      const personalizationPayload = personalizationData ? {
        learning_style: personalizationData.learning_style,
        interests: personalizationData.interests,
        communication_style: personalizationData.communication_style,
        motivation_type: personalizationData.motivation_type,
        custom_prompts: personalizationData.custom_prompts
      } : null;
      
      console.log('Sending personalization data:', personalizationPayload);

      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData,
          mimeType,
          prompt: question,
          canvasData: currentCanvasData,
          allPagesData,
          currentPageIndex,
          history: updatedHistory,
          textElements,
          personalizationData: personalizationPayload,
          userSettings
        })
      });

      if (!response.ok) throw new Error('Failed to process audio');
      const data = await response.json();
      const formattedAnalysis = await marked(data.analysis);
      setAnalysis(formattedAnalysis);
      
      // Create a properly typed assistant message
      const assistantMessage: ConversationMessage = {
        role: 'assistant' as const,
        content: data.analysis
      };
      
      // Update the conversation history with properly typed messages
      setConversationHistory([...updatedHistory, assistantMessage]);
      
      speakText(data.analysis);
    } catch (error) {
      console.error('Error processing audio:', error);
      setAnalysis('Error processing audio. Please try again.');
    } finally {
      setIsProcessingAudio(false);
    }
  }

  // Load saved drawing when component mounts
  useEffect(() => {
    // Temporarily disabled loading saved drawings
    /*
    const loadSavedDrawing = async () => {
      try {
        const savedDrawing = await chaptersService.getDrawing(chapterId)
        if (savedDrawing?.page_data) {
          setPages(savedDrawing.page_data.pages || [{ id: '1', textElements: [] }])
          setCurrentPageIndex(savedDrawing.page_data.currentPageIndex || 0)
        }
      } catch (error) {
        console.error('Error loading drawing:', error)
      }
    }

    loadSavedDrawing()
    */
  }, [chapterId])

  // Save drawing when pages or current page changes
  useEffect(() => {
    // Temporarily disabled auto-save functionality
    /*
    const saveDrawing = async () => {
      try {
        await chaptersService.saveDrawing({
          chapter_id: chapterId,
          class_id: classId,
          page_data: {
            pages: getAllPagesData(),
            currentPageIndex
          }
        })
      } catch (error) {
        console.error('Error saving drawing:', error)
      }
    }

    const debounceTimer = setTimeout(saveDrawing, 1000) // Debounce save
    return () => clearTimeout(debounceTimer)
    */
  }, [pages, currentPageIndex, chapterId, classId])

  // Initialize canvas when component mounts or when page changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // If the current page has saved image data, restore it
    const currentPage = pages[currentPageIndex]
    if (currentPage.imageData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
      img.src = currentPage.imageData
    }
    
    // Update text elements from the current page
    setTextElements(currentPage.textElements)
  }, [currentPageIndex, pages])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    if (isTextTool) {
      // Add a new text element when in text tool mode
      const newTextElement: TextElement = {
        id: `text-${Date.now()}`,
        x,
        y,
        text: 'Click to edit',
        color,
        fontSize,
        isDragging: false
      }
      setTextElements([...textElements, newTextElement])
      setActiveTextId(newTextElement.id)
      
      // Immediately set this element to active for editing
      setTimeout(() => {
        const activeElement = document.querySelector(`[data-text-id="${newTextElement.id}"]`) as HTMLElement
        if (activeElement) {
          const textArea = activeElement.querySelector('textarea')
          if (textArea) {
            textArea.focus()
            textArea.select()
          }
        }
      }, 50)
    } else {
      setIsDrawing(true)
      setPrevPoint({ x, y })
    }
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

  // Handle text element dragging
  const handleTextMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setActiveTextId(id)
    
    // Mark this text element as being dragged
    setTextElements(textElements.map(el => 
      el.id === id ? { ...el, isDragging: true } : el
    ))
  }
  
  const handleTextMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Only proceed if we have a text element being dragged
    if (!textElements.some(el => el.isDragging)) return
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    setTextElements(textElements.map(el => {
      if (el.isDragging) {
        return {
          ...el,
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY
        }
      }
      return el
    }))
  }
  
  const handleTextMouseUp = () => {
    // Clear dragging state for all text elements
    setTextElements(textElements.map(el => 
      el.isDragging ? { ...el, isDragging: false } : el
    ))
  }
  
  // Handle text editing
  const handleTextChange = (id: string, newText: string) => {
    setTextElements(textElements.map(el => 
      el.id === id ? { ...el, text: newText } : el
    ))
  }
  
  // Delete a text element
  const deleteTextElement = (id: string) => {
    setTextElements(textElements.filter(el => el.id !== id))
    if (activeTextId === id) {
      setActiveTextId(null)
    }
  }
  
  const stopDrawing = () => {
    setIsDrawing(false)
    setPrevPoint(null)
    handleTextMouseUp()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Clear all text elements
    setTextElements([])
    setActiveTextId(null)
    
    // Update the current page in the pages array
    const updatedPages = [...pages]
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      textElements: [],
      imageData: canvas.toDataURL('image/png')
    }
    setPages(updatedPages)
  }
  
  // Save the current canvas state before switching pages
  const saveCurrentPage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updatedPages = [...pages]
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      imageData: canvas.toDataURL('image/png'),
      textElements: textElements
    }
    setPages(updatedPages)
  }
  
  // Add a new page
  const addNewPage = () => {
    // First save the current page
    saveCurrentPage()
    
    // Create a new page
    const newPage: CanvasPage = {
      id: Date.now().toString(),
      textElements: []
    }
    
    // Add the new page and switch to it
    setPages([...pages, newPage])
    setCurrentPageIndex(pages.length)
  }
  
  // Navigate to the previous page
  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      saveCurrentPage()
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }
  
  // Navigate to the next page
  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      saveCurrentPage()
      setCurrentPageIndex(currentPageIndex + 1)
    }
  }

  const askGemini = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
  
    try {
      setIsAnalyzing(true)
      setAnalysis(null)
      
      // Save the current page before analyzing
      saveCurrentPage()
      
      // Get current page data
      const currentPageImageData = canvas.toDataURL('image/png')
      
      // Prepare all pages data to send to Gemini
      const allPagesData = pages.map((page, index) => ({
        pageNumber: index + 1,
        imageData: index === currentPageIndex ? currentPageImageData : page.imageData,
        textElements: index === currentPageIndex ? textElements : page.textElements
      }))
      
      const newUserMessage: ConversationMessage = {
        role: 'user' as const,
        content: question
      }
      
      const updatedHistory: ConversationMessage[] = [
        ...conversationHistory,
        newUserMessage
      ]
      setConversationHistory(updatedHistory)

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageData: currentPageImageData, // Keep for backward compatibility
          allPagesData, // Send all pages data
          currentPageIndex,
          question,
          history: updatedHistory,
          textElements: textElements // Keep for backward compatibility
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
        {/* Page Navigation */}
        <div className="flex items-center gap-2 mr-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPageIndex === 0}
            className="p-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>
          
          <span className="text-sm font-medium">
            Page {currentPageIndex + 1} of {pages.length}
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={currentPageIndex === pages.length - 1}
            className="p-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight size={18} />
          </button>
          
          <button
            onClick={addNewPage}
            className="p-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            title="Add New Page"
          >
            <Plus size={18} />
          </button>
        </div>
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

        {isTextTool && (
          <div className="flex items-center gap-2">
            <label htmlFor="fontSize" className="text-sm font-medium">Font Size:</label>
            <input
              type="range"
              id="fontSize"
              min="10"
              max="36"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-sm">{fontSize}px</span>
          </div>
        )}

        <button
          onClick={() => {
            setIsTextTool(false)
            setIsEraser(!isEraser)
          }}
          disabled={isTextTool}
          className={`px-3 py-1 text-sm rounded-md transition ${
            isEraser
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          } ${isTextTool ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isEraser ? 'Eraser ON' : 'Eraser OFF'}
        </button>
        
        <button
          onClick={() => {
            setIsTextTool(!isTextTool)
            if (isEraser) setIsEraser(false)
          }}
          className={`px-3 py-1 text-sm rounded-md transition ${
            isTextTool
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {isTextTool ? 'Text Tool ON' : 'Text Tool'}
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
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={(e) => {
            draw(e)
            handleTextMouseMove(e)
          }}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`rounded-xl border border-gray-300 ${className}`}
          style={{ backgroundColor: '#ffffff' }}
        />
        
        {/* Text Elements Overlay */}
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {textElements.map((element) => (
            <div 
              key={element.id}
              data-text-id={element.id}
              className={`absolute ${element.id === activeTextId ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-2 hover:ring-blue-300'}`}
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                color: element.color,
                fontSize: `${element.fontSize}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                cursor: element.isDragging ? 'grabbing' : 'grab',
                maxWidth: '250px',
                wordBreak: 'break-word',
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: element.id === activeTextId ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
                transition: 'background-color 0.2s, box-shadow 0.2s',
                zIndex: element.id === activeTextId ? 10 : 1
              }}
              onMouseDown={(e) => handleTextMouseDown(e, element.id)}
            >
              {element.id === activeTextId ? (
                <div className="flex flex-col">
                  <div className="flex justify-end mb-1">
                    <button 
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                      onClick={() => deleteTextElement(element.id)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <textarea
                    value={element.text}
                    onChange={(e) => handleTextChange(element.id, e.target.value)}
                    className="p-2 border border-gray-300 rounded bg-white/90 backdrop-blur-sm shadow-sm w-full"
                    style={{ color: element.color, fontSize: `${element.fontSize}px` }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    rows={3}
                  />
                </div>
              ) : (
                <div 
                  className="p-2 cursor-pointer rounded hover:bg-white/70 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveTextId(element.id)
                  }}
                >
                  {element.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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
