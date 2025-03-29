'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()

    class Particle {
      x!: number
      y!: number
      radius!: number
      speedX!: number
      speedY!: number
      color!: string
      targetRadius!: number
      colorIndex!: number
      colorTransition!: number
      googleColors: string[] = ['#4285F4', '#34A853', '#FBBC05', '#EA4335']

      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.radius = Math.random() * 2 + 1
        this.targetRadius = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 1.2
        this.speedY = (Math.random() - 0.5) * 1.2
        this.colorIndex = Math.floor(Math.random() * this.googleColors.length)
        this.colorTransition = 0
        this.color = this.googleColors[this.colorIndex]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1

        // Smooth radius transition
        this.radius += (this.targetRadius - this.radius) * 0.1
        if (Math.abs(this.targetRadius - this.radius) < 0.1) {
          this.targetRadius = Math.random() * 3 + 1
        }

        // Color transition
        this.colorTransition += 0.005
        if (this.colorTransition >= 1) {
          this.colorTransition = 0
          this.colorIndex = (this.colorIndex + 1) % this.googleColors.length
        }

        const nextColorIndex = (this.colorIndex + 1) % this.googleColors.length
        const currentColor = this.googleColors[this.colorIndex]
        const nextColor = this.googleColors[nextColorIndex]
        
        // Create smooth color transition
        this.color = this.lerpColor(currentColor, nextColor, this.colorTransition)
      }

      lerpColor(color1: string, color2: string, factor: number): string {
        const r1 = parseInt(color1.slice(1, 3), 16)
        const g1 = parseInt(color1.slice(3, 5), 16)
        const b1 = parseInt(color1.slice(5, 7), 16)
        
        const r2 = parseInt(color2.slice(1, 3), 16)
        const g2 = parseInt(color2.slice(3, 5), 16)
        const b2 = parseInt(color2.slice(5, 7), 16)
        
        const r = Math.round(r1 + (r2 - r1) * factor)
        const g = Math.round(g1 + (g2 - g1) * factor)
        const b = Math.round(b1 + (b2 - b1) * factor)
        
        return `rgba(${r}, ${g}, ${b}, ${0.2 + Math.sin(this.colorTransition * Math.PI) * 0.1})`
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Add glow effect
        ctx.shadowBlur = this.radius * 2
        ctx.shadowColor = this.color
        
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
        
        // Reset shadow for next particle
        ctx.shadowBlur = 0
      }
    }

    const particles = Array.from({ length: 200 }, () => new Particle())

    let animationFrameId: number
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.update()
        p.draw(ctx)
      })
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()
    
    const handleResize = () => {
      resizeCanvas()
      particles.forEach(p => p.reset())
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <main className="relative min-h-screen flex items-center justify-center text-gray-800 overflow-hidden bg-white">
      {/* Yubi Logo */}
      <div className="absolute top-0 left-0 z-20 h-180 w-180">
        <Image src="/Yubi1.svg" alt="Yubi Logo" width={500} height={500} className="hover:scale-105 transition-transform" />
      </div>

      {/* Canvas Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* ANIMATED GRADIENT BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute w-[800px] h-[800px] top-[-200px] left-[-200px] bg-[radial-gradient(closest-side,_#4285F4,_transparent)] animate-[pulse_4s_ease-in-out_infinite] blur-3xl opacity-30 hover:opacity-40 transition-opacity" />
        <div className="absolute w-[700px] h-[700px] bottom-[-150px] right-[-150px] bg-[radial-gradient(closest-side,_#EA4335,_transparent)] animate-[pulse_6s_ease-in-out_infinite] blur-3xl opacity-30 hover:opacity-40 transition-opacity" />
        <div className="absolute w-[600px] h-[600px] top-[20%] left-[40%] bg-[radial-gradient(closest-side,_#FBBC05,_transparent)] animate-[pulse_5s_ease-in-out_infinite] blur-3xl opacity-20 hover:opacity-30 transition-opacity" />
        <div className="absolute w-[500px] h-[500px] bottom-[10%] left-[10%] bg-[radial-gradient(closest-side,_#34A853,_transparent)] animate-[pulse_7s_ease-in-out_infinite] blur-2xl opacity-30 hover:opacity-40 transition-opacity" />
        <div className="absolute w-[400px] h-[400px] top-[40%] right-[5%] bg-[radial-gradient(closest-side,_#4285F4,_transparent)] animate-[pulse_8s_ease-in-out_infinite] blur-2xl opacity-20 hover:opacity-30 transition-opacity" />
      </div>

      {/* Glass Card */}
      <div
        className={`relative z-10 max-w-3xl w-full px-8 py-14 rounded-3xl shadow-2xl border border-white/40 backdrop-blur-xl bg-white/70 transition-all duration-700 ease-out hover:shadow-[0_20px_60px_-10px_rgba(66,133,244,0.3)] hover:border-[#4285F4]/30 hover:scale-[1.02] ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h1
          className="text-6xl md:text-7xl font-extrabold text-center mb-6 tracking-tight"
          style={{
            background:
              'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Study Buddy
        </h1>

        <p className="text-lg md:text-xl text-center text-gray-700 mb-10 leading-relaxed">
          Discover the future of learning with <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] to-[#34A853]">Study Buddy</span> — your intelligent AI companion for enhanced learning and productivity.
        </p>

        <div className="flex justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium text-white bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] hover:from-[#EA4335] hover:via-[#FBBC05] hover:to-[#4285F4] transition-all duration-500 shadow-lg hover:shadow-[0_10px_30px_-10px_rgba(66,133,244,0.5)] hover:scale-105 group"
          >
            Launch Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-10 text-sm text-center text-gray-500">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] to-[#34A853]">v1.0.0</span> – Powered by Yubi with Google's Innovation
        </div>
      </div>
    </main>
  )
}
