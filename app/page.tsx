"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Stack from "@mui/material/Stack"
import { useAuth } from "@/lib/auth-context" // Assuming you have an auth context for user state

export default function Home() {
  const { user } = useAuth() // Get the current user from the auth context
  const router = useRouter()

  // Redirect to the dashboard if the user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" fontWeight="bold" mb={3}>
        Samsarental
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" mb={3}>
          Welcome to our marketplace where you can rent or borrow items from others in your community.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" component={Link} href="/login">
            Login
          </Button>
          <Button variant="outlined" component={Link} href="/signup">
            Sign Up
          </Button>
        </Stack>
      </Box>
    </Container>
  )
}
