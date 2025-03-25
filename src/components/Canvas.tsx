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
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

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
    const currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
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
    </div>
  )
}