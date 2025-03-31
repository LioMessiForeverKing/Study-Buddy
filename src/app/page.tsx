'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { theme } from '../../public/theme'

export default function HomePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    setMounted(true)

    // GSAP Animations
    const heroContent = document.querySelector('.hero-content')
    const overviewContent = document.querySelector('.overview-content')
    const featureCards = document.querySelectorAll('.feature-card')

    gsap.fromTo(heroContent,
      { opacity: 0, y: 100, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 1.2, 
        ease: 'elastic.out(1, 0.5)'
      }
    )

    gsap.fromTo(overviewContent,
      { opacity: 0, y: 60 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        scrollTrigger: {
          trigger: overviewContent,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse'
        }
      }
    )

    featureCards.forEach((card, index) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40, rotation: -5, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          rotation: 0,
          scale: 1,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 15%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    // Add floating animation to Yubi logo
    const yubiLogo = document.querySelector('.yubi-logo')
    gsap.to(yubiLogo, {
      y: 15,
      rotation: 3,
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    })

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
      canvas.style.position = 'fixed'
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
      googleColors: string[] = [theme.colors.primary.blue, theme.colors.primary.green, theme.colors.primary.yellow, theme.colors.primary.red]

      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * (canvas?.width ?? window.innerWidth)
        this.y = Math.random() * (canvas?.height ?? window.innerHeight)
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
        if (this.x < 0 || this.x > (canvas?.width ?? 0)) this.speedX *= -1
        if (this.y < 0 || this.y > (canvas?.height ?? 0)) this.speedY *= -1

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
    <main className="relative min-h-screen flex flex-col overflow-y-auto text-gray-800 overflow-hidden bg-white">
      <div className="relative flex flex-col">
        {/* Yubi Logo */}
        <div className="absolute top-0 left-0 z-20 h-180 w-180">
          <Image src="/Yubi1.svg" alt="Yubi Logo" width={500} height={500} className="yubi-logo hover:scale-105 transition-transform" />
        </div>

        {/* Canvas Particles */}
        <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

        {/* ANIMATED GRADIENT BACKGROUND */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute w-[1500px] h-[1500px] top-[-500px] left-[-500px] bg-[radial-gradient(closest-side,_var(--primary-blue),_transparent)] animate-[pulse_12s_ease-in-out_infinite] blur-3xl opacity-20 hover:opacity-30 transition-all duration-700 hover:scale-110 hover:rotate-3" style={{'--primary-blue': theme.colors.primary.blue} as any} />
          <div className="absolute w-[1400px] h-[1400px] bottom-[-400px] right-[-400px] bg-[radial-gradient(closest-side,_var(--primary-red),_transparent)] animate-[pulse_15s_ease-in-out_infinite] blur-3xl opacity-20 hover:opacity-30 transition-all duration-700 hover:scale-110 hover:rotate-[-3deg]" style={{'--primary-red': theme.colors.primary.red} as any} />
          <div className="absolute w-[1300px] h-[1300px] top-[45%] left-[30%] bg-[radial-gradient(closest-side,_var(--primary-yellow),_transparent)] animate-[pulse_13s_ease-in-out_infinite] blur-3xl opacity-15 hover:opacity-25 transition-all duration-700 hover:scale-110 hover:translate-y-[-20px]" style={{'--primary-yellow': theme.colors.primary.yellow} as any} />
          <div className="absolute w-[1200px] h-[1200px] bottom-[35%] left-[25%] bg-[radial-gradient(closest-side,_var(--primary-green),_transparent)] animate-[pulse_14s_ease-in-out_infinite] blur-2xl opacity-20 hover:opacity-30 transition-all duration-700 hover:scale-110 hover:translate-x-[20px]" style={{'--primary-green': theme.colors.primary.green} as any} />
          <div className="absolute w-[1100px] h-[1100px] top-[65%] right-[20%] bg-[radial-gradient(closest-side,_var(--primary-blue),_transparent)] animate-[pulse_16s_ease-in-out_infinite] blur-2xl opacity-15 hover:opacity-25 transition-all duration-700 hover:scale-110 hover:translate-y-[20px]" style={{'--primary-blue': theme.colors.primary.blue} as any} />
        </div>

        {/* Content Container */}
        <div className="relative z-30 flex flex-col">
          {/* Hero Section */}
          <div className="min-h-screen flex items-center justify-center">
            <div className="hero-content relative z-40 w-full max-w-3xl px-8 py-14 rounded-3xl shadow-2xl border border-white/40 backdrop-blur-xl bg-white/70 transition-all duration-700 ease-out hover:shadow-[0_20px_60px_-10px_rgba(66,133,244,0.3)] hover:border-[#4285F4]/30 hover:scale-[1.05] hover:rotate-1">
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

              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md relative z-50">
                  <button
                    onClick={() => router.push('/notepad')}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium text-white bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] hover:from-[#EA4335] hover:via-[#FBBC05] hover:to-[#4285F4] transition-all duration-500 shadow-lg hover:shadow-[0_10px_30px_-10px_rgba(66,133,244,0.5)] hover:scale-105 group flex-1"
                  >
                    Launch NotePad
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => router.push('/auth')}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium bg-white border border-gray-200 hover:border-gray-300 text-gray-700 transition-all duration-500 shadow-lg hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:scale-105 group flex-1"
                  >
                    <Image src="/google.svg" alt="Google Logo" width={20} height={20} className="w-5 h-5" />
                    <span className="whitespace-nowrap">Sign in with Google</span>
                  </button>
                </div>

              <div className="mt-10 text-sm text-center text-gray-500">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] to-[#34A853]">v1.0.0</span> – Powered by Yubi with Google's Innovation
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <div className="min-h-screen flex items-center justify-center py-20">
            <div className="relative w-full max-w-6xl mx-auto px-4">
              <div className="overview-content max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Yubi2 Mascot */}
                <div className="relative flex justify-center items-center">
                  <Image
                    src="/Yubi2.svg"
                    alt="Yubi Mascot"
                    width={400}
                    height={400}
                    className="yubi2-mascot transform hover:scale-105 transition-all duration-500 animate-float"
                  />
                </div>
                {/* Overview Text */}
                <div className="space-y-6 md:order-first">
                  <h2 className="text-4xl md:text-5xl font-bold" style={{
                    background: 'linear-gradient(90deg, #4285F4, #34A853)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Meet Your Study Companion
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Study Buddy combines AI-powered tutoring with interactive learning tools to make your educational journey more engaging and effective.
                  </p>
                  <ul className="space-y-4">
                    {[
                      { text: 'Personalized AI Tutoring', color: '#4285F4' },
                      { text: 'Interactive Quizzes', color: '#34A853' },
                      { text: 'Progress Tracking', color: '#FBBC05' },
                      { text: 'Smart Study Planning', color: '#EA4335' },
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <span className="flex-shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }} />
                        <span className="text-gray-700">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Feature Cards */}
                <div className="col-span-2 flex justify-center items-center w-full mt-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl w-full mx-auto px-4 place-items-center">
                    {[
                      {
                        title: 'AI Tutor',
                        description: 'Get instant help with any subject',
                        gradient: 'from-[#4285F4] to-[#34A853]',
                      },
                      {
                        title: 'Smart Quiz',
                        description: 'Test your knowledge effectively',
                        gradient: 'from-[#EA4335] to-[#FBBC05]',
                      },
                      {
                        title: 'Progress',
                        description: 'Track your learning journey',
                        gradient: 'from-[#34A853] to-[#FBBC05]',
                      },
                      {
                        title: 'Resources',
                        description: 'Access study materials anywhere',
                        gradient: 'from-[#4285F4] to-[#EA4335]',
                      },
                    ].map((card, index) => (
                      <div
                        key={index}
                        className={`feature-card w-full max-w-sm p-8 rounded-3xl backdrop-blur-lg bg-white/70 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group`}
                      >
                        <h3 className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent mb-3`}>
                          {card.title}
                        </h3>
                        <p className="text-gray-600 text-base">{card.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
