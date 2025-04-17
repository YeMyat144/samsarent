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
  Divider,
  ThemeProvider
} from "@mui/material"
import { Person, Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material"
import theme from "@/lib/theme"
import { useAuth } from "@/lib/auth-context"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await signup(email, password, name)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to create account")
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
          mt: 3,
          display: "flex",
          alignItems: "center"
        }}
      >
        <Container maxWidth="sm" >
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 4,
              p: 4,
              bgcolor: "background.paper"
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom color="text.primary" fontWeight="bold">
              Create an Account
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Sign up to start renting and borrowing items
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
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
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
                autoComplete="new-password"
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
                Create Account
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <Link href="/login" style={{ 
                    color: theme.palette.secondary.main, 
                    textDecoration: "none",
                    fontWeight: 500
                  }}>
                    Login
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