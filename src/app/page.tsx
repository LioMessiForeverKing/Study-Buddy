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

      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.radius = Math.random() * 1.5 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.8
        this.speedY = (Math.random() - 0.5) * 0.8
        this.color = `rgba(66, 133, 244, ${Math.random() * 0.1 + 0.05})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
      }
    }

    const particles = Array.from({ length: 150 }, () => new Particle())

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.update()
        p.draw(ctx)
      })
      requestAnimationFrame(animate)
    }

    animate()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
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
        <div className="absolute w-[800px] h-[800px] top-[-200px] left-[-200px] bg-[radial-gradient(closest-side,_#4285F4,_transparent)] animate-pulse-slow blur-3xl opacity-30" />
        <div className="absolute w-[700px] h-[700px] bottom-[-150px] right-[-150px] bg-[radial-gradient(closest-side,_#EA4335,_transparent)] animate-pulse-slow blur-3xl opacity-30" />
        <div className="absolute w-[600px] h-[600px] top-[20%] left-[40%] bg-[radial-gradient(closest-side,_#FBBC05,_transparent)] animate-pulse-slow blur-3xl opacity-20" />
        <div className="absolute w-[500px] h-[500px] bottom-[10%] left-[10%] bg-[radial-gradient(closest-side,_#34A853,_transparent)] animate-pulse-slow blur-2xl opacity-30" />
      </div>

      {/* Glass Card */}
      <div
        className={`relative z-10 max-w-3xl w-full px-8 py-14 rounded-3xl shadow-xl border border-white/30 backdrop-blur-lg bg-white/60 transition-all duration-700 ease-out ${
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
          Welcome to <span className="font-semibold text-black">Study Buddy</span> — your AI Notetaker, and reinforcement learning assistant.
        </p>

        <div className="flex justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-medium text-white bg-gradient-to-r from-[#4285F4] to-[#34A853] hover:from-[#FBBC05] hover:to-[#EA4335] transition-all shadow-lg hover:scale-105"
          >
            Launch Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-10 text-sm text-center text-gray-500">
          v1.0.0 – Powered by Yubi.
        </div>
      </div>
    </main>
  )
}
