"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <AppBar color="default" sx={{ backgroundColor: "white",boxShadow: "none", borderBottom: "1px solid #e0e0e0" }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={ Link }
          href= "/"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            color: "text.primary",
            textDecoration: "none",
          }}
        >
           Samsarental
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user ? (
            <>
              <Button component={Link} href="/dashboard" color={pathname === "/dashboard" ? "primary" : "inherit"}>
                Browse
              </Button>
              <Button component={Link} href="/requests" color={pathname === "/requests" ? "primary" : "inherit"}>
                Requests
              </Button>
              <Button variant="outlined" size="small" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} href="/login" color={pathname === "/login" ? "primary" : "inherit"}>
                Login
              </Button>
              <Button component={Link} href="/signup" variant="contained" size="small">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
