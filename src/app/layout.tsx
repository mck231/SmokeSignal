import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Link from "next/link"

// Example fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

// Minimal header directly in this file
function GlobalHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="mx-auto max-w-5xl flex items-center justify-between p-4">
        <div className="font-semibold text-lg">
          <Link href="/">Smoke Signal</Link>
        </div>
        <div>
          <Link
            href="/vote"
            className="text-blue-600 hover:underline"
          >
            Go to Votes
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GlobalHeader />
        <main>{children}</main>
      </body>
    </html>
  )
}
