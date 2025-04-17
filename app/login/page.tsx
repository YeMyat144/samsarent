"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Container, 
  Alert,
  InputAdornment,
  IconButton,
  ThemeProvider
} from "@mui/material"
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material"
import theme from "@/lib/theme"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          mt: 7,
        }}
      >
        <Container maxWidth="sm" >
          
          <Paper  
            sx={{ 
              borderRadius: 4,
              p: 4,
              bgcolor: "background.paper"
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom color="text.primary" fontWeight="bold">
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Enter your credentials to access your account
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 3 }}
              />

              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                sx={{ 
                  mt: 2, 
                  mb: 3, 
                  py: 1.5,
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "info.main"
                  }
                }}
              >
                Login
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" style={{ 
                    color: theme.palette.secondary.main, 
                    textDecoration: "none",
                    fontWeight: 500
                  }}>
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Samsarent. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}