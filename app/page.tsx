"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Stack,
  Paper,
  Card,
  CardContent,
  ThemeProvider
} from "@mui/material"
import { Search, LocalOffer, GroupAdd } from "@mui/icons-material"
import theme from "@/lib/theme"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const features = [
    {
      icon: <Search sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "Find What You Need",
      description: "Browse thousands of items available for rent in your community."
    },
    {
      icon: <LocalOffer sx={{ fontSize: 48, color: "secondary.main" }} />,
      title: "Save Money",
      description: "Why buy when you can rent? Save money and reduce waste."
    },
    {
      icon: <GroupAdd sx={{ fontSize: 48, color: "info.main" }} />,
      title: "Build Community",
      description: "Connect with neighbors and share resources locally."
    }
  ]

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        {/* Hero Section */}
        <Box 
          sx={{ 
            bgcolor: "primary.main", 
            color: "white",
            py: 12,
            position: "relative",
            overflow: "hidden"
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                  Samsarent
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                  Borrow what you need, share what you don't
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    href="/login"
                    size="large"
                    sx={{ 
                      bgcolor: "white", 
                      color: "primary.main",
                      "&:hover": { bgcolor: "error.main" }
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="outlined" 
                    component={Link} 
                    href="/signup"
                    size="large"
                    sx={{ 
                      borderColor: "white", 
                      color: "white",
                      "&:hover": { borderColor: "error.main", color: "error.main" }
                    }}
                  >
                    Sign Up
                  </Button>
                </Stack>
              </Box>
              <Box 
                sx={{ 
                  flex: 1,
                  height: 400, 
                  width: "100%", 
                  borderRadius: 4,
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >

                <img src="/img.jpg" alt="Hero Image" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 4 }} />
            
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h4" component="h2" textAlign="center" fontWeight="medium" sx={{ mb: 6, color: "text.primary" }}>
            How It Works
          </Typography>

          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", md: "row" },
            gap: 4
          }}>
            {features.map((feature, index) => (
              <Paper 
                key={index}
                elevation={0} 
                sx={{ 
                  p: 4, 
                  flex: 1,
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  bgcolor: "background.paper", 
                  borderRadius: 4 
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "text.primary" }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" textAlign="center" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>

        {/* CTA Section */}
        <Box sx={{ bgcolor: "secondary.main", color: "white", py: 8 }}>
          <Container maxWidth="md" sx={{ textAlign: "center" }}>
            <Typography variant="h4" component="h2" fontWeight="medium" gutterBottom>
              Ready to start sharing?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Join our community today and discover the benefits of collaborative consumption.
            </Typography>
            <Button 
              variant="contained" 
              component={Link} 
              href="/signup"
              size="large"
              sx={{ 
                bgcolor: "white", 
                color: "secondary.main",
                px: 4,
                "&:hover": { bgcolor: "error.main" }
              }}
            >
              Create an Account
            </Button>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: "background.paper", py: 4, borderTop: 1, borderColor: "divider" }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" textAlign="center">
              © {new Date().getFullYear()} Samsarent. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}