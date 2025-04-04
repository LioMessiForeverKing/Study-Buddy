'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

export default function GoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = createClient()
      
      // Log the start of authentication process
      console.log('Starting Google authentication process...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error('Authentication error:', error.message)
        throw error
      }
      
      console.log('Authentication successful, redirecting...', data)
      
    } catch (err) {
      console.error('Sign in error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="group relative flex items-center justify-center px-8 py-4 rounded-2xl text-lg font-medium text-white overflow-hidden backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(234,67,53,0.5)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#4285F4] before:via-[#34A853] before:to-[#FBBC05] before:transition-all before:duration-300 hover:before:bg-gradient-to-r hover:before:from-[#EA4335] hover:before:via-[#FF5722] hover:before:to-[#FF9800] before:animate-gradient-x"
    >
      <span className="relative">
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </span>
    </button>
  )
}