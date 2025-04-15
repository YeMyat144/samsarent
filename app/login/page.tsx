"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Box, Button, TextField, Typography, Paper, Container, Alert } from "@mui/material"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to login")
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ py: 8, display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Paper elevation={3} sx={{ width: "100%", p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Login
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your credentials to access your account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Login
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "#5f877f", textDecoration: "none" }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
