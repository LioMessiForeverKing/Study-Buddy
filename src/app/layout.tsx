import './globals.css'
import { Inter, Roboto } from 'next/font/google'

const inter = Inter({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-google-sans',
})

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

export const metadata = {
  title: 'Study Buddy | Futuristic Learning',
  description: 'AI + Google Themed Learning Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} font-sans`}>{children}</body>
    </html>
  )
}
