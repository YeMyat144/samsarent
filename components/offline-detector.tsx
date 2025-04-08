"use client"

import { useEffect, useState } from "react"
import Alert from "@mui/material/Alert"
import Snackbar from "@mui/material/Snackbar"

export function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine)

    // Add event listeners
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  return (
    <Snackbar open={isOffline} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
      <Alert severity="error" sx={{ width: "100%" }}>
        You're offline. Some features may not work properly. Please check your internet connection.
      </Alert>
    </Snackbar>
  )
}
