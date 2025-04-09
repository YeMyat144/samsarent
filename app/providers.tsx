// app/providers.tsx
"use client"

import { ThemeProvider, CssBaseline } from "@mui/material"
import theme from "@/lib/theme"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { OfflineDetector } from "@/components/offline-detector"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        {children}
        <OfflineDetector />
      </ThemeProvider>
    </AuthProvider>
  )
}
