
'use client'

import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function GoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/classes'
  
  useEffect(() => {
    const button = buttonRef.current
    
    if (button) {
      // Initial gradient
      const defaultGradient = {
        start: '#34A853',
        middle: '#FBBC05',
        end: '#34A853'
      }
      
      // Hover gradient
      const hoverGradient = {
        start: '#EA4335',
        middle: '#FBBC05',
        end: '#4285F4'
      }
      
      // Set up hover animation
      const hoverAnimation = gsap.to(button, {
        background: `linear-gradient(135deg, ${hoverGradient.start} 0%, ${hoverGradient.middle} 50%, ${hoverGradient.end} 100%)`,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
        paused: true
      })
      
      // Add hover listeners
      button.addEventListener('mouseenter', () => hoverAnimation.play())
      button.addEventListener('mouseleave', () => hoverAnimation.reverse())
      
      // Subtle pulse animation
      gsap.to(button, {
        boxShadow: '0 4px 15px rgba(52, 168, 83, 0.3)',
        yoyo: true,
        repeat: -1,
        duration: 2,
        ease: "power1.inOut"
      })
      
      return () => {
        button.removeEventListener('mouseenter', () => hoverAnimation.play())
        button.removeEventListener('mouseleave', () => hoverAnimation.reverse())
      }
    }
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) throw error
      
    } catch (err) {
      console.error('Sign in error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="
        w-full
        px-6
        py-3
        rounded-xl
        text-white
        font-medium
        text-lg
        transition-all
        duration-300
        transform
        hover:shadow-xl
        disabled:opacity-50
        disabled:cursor-not-allowed
        relative
        overflow-hidden
        bg-gradient-to-r
        from-[#34A853]
        via-[#FBBC05]
        to-[#34A853]
        backdrop-blur-sm
        border
        border-white/20
      "
      style={{
        backgroundSize: '200% 100%',
      }}
    >
      <div className="relative z-10 flex items-center justify-center gap-3">
        <span className="tracking-wide">
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </span>
      </div>
      
      {/* Animated background overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
    </button>
  )
}
