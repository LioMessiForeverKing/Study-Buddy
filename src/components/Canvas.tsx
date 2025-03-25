"use client"

import { useEffect, useRef, useState } from "react"

interface Point {
  x: number
  y: number
}

interface CanvasProps {
  width?: number
  height?: number
  className?: string
}

export function Canvas({ width = 800, height = 600, className = "" }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [prevPoint, setPrevPoint] = useState<Point | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Set canvas background to white
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // Calculate position with scaling factor to account for any CSS transformations
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

    const context = canvas.getContext("2d")
    if (!context) return

    const rect = canvas.getBoundingClientRect()
    // Apply the same scaling factor for consistent drawing
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const currentPoint = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }

    if (prevPoint) {
      context.beginPath()
      context.moveTo(prevPoint.x, prevPoint.y)
      context.lineTo(currentPoint.x, currentPoint.y)
      context.strokeStyle = color
      context.lineWidth = brushSize
      context.lineCap = "round"
      context.lineJoin = "round"
      context.stroke()
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

    const context = canvas.getContext("2d")
    if (!context) return

    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [question, setQuestion] = useState('What is the solution to this equation?')

  const askGemini = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      setIsAnalyzing(true)
      setAnalysis(null)
      
      // Convert canvas to base64 image data
      const imageData = canvas.toDataURL('image/png')
      
      // Send to Gemini API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData, question }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }
      
      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Error analyzing image:', error)
      setAnalysis('Error analyzing image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <label htmlFor="color" className="text-sm font-medium">
            Color:
          </label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 border border-border rounded cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="brushSize" className="text-sm font-medium">
            Brush Size:
          </label>
          <input
            type="range"
            id="brushSize"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm">{brushSize}px</span>
        </div>
        <button
          onClick={clearCanvas}
          className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
        >
          Clear
        </button>
        <button
          onClick={askGemini}
          disabled={isAnalyzing}
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {isAnalyzing ? 'Analyzing...' : 'Ask Gemini'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className={`border border-border rounded-md cursor-crosshair ${className}`}
        style={{ backgroundColor: '#ffffff' }}
      />
      {analysis && (
        <div className="mt-4 p-4 bg-card border border-border rounded-md">
          <h3 className="text-lg font-medium mb-2">Gemini Analysis</h3>
          <p className="text-sm whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  )
}