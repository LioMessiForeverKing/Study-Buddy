import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // Await the cookies() function as required by Next.js
    const cookieStore = await cookies()
    const response = NextResponse.redirect(new URL('/notepad', request.url))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // Use the awaited cookieStore
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            response.cookies.set(name, '', { ...options, maxAge: -1 })
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    return response
  }

  return NextResponse.redirect(new URL('/', request.url))
}
