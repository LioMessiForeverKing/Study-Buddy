import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const publicUrls = ['/', '/auth/callback', '/auth/login']
  if (publicUrls.includes(request.nextUrl.pathname)) {
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

    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware auth error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback|auth/login).*)',
  ]
}
