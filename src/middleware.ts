import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/auth/callback', '/auth/login']
  
  // If the current route is public, allow access
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  let response = NextResponse.next()

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: true
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0
            })
          }
        }
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // If there's no session and the route isn't public, redirect to home
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // If user is logged in and trying to access home page, redirect to classes
    if (session && request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/classes', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware auth error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}
