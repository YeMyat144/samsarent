import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { OfflineDetector } from "@/components/offline-detector"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Samsarental",
  description: "A simple marketplace for renting and borrowing items",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/samsarental.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <OfflineDetector />
        </AuthProvider>
      </body>
    </html>
  )
}


import './globals.css'