"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppBar, Toolbar, Button, Box } from "@mui/material"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <AppBar position="static" sx={{ backgroundColor: 'secondary.main', boxShadow: "none" }}>
      <Toolbar sx={{ mt: 1, mb: 1, ml: 4, mr: 4, display: "flex", justifyContent: "space-between"  }}>
        <Link href="/" >
          <img
            src="/1.png" // Path to your logo
            alt="Samsarental Logo"
            style={{ width: "auto", height: "65px", marginRight: "10px" }} // Adjust size as needed
          />
        </Link>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user ? (
            <>
              <Button component={Link} href="/dashboard" color={pathname === "/dashboard" ? "primary" : "inherit"} sx={{ fontSize: "17px" }}>
                Browse
              </Button>
              <Button component={Link} href="/requests" color={pathname === "/requests" ? "primary" : "inherit"} sx={{ fontSize: "17px" }}>
                Requests
              </Button>
              <Button color="error" variant="outlined" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} href="/login" color={pathname === "/login" ? "primary" : "inherit"} sx={{ fontSize: "17px" }}>
                Login
              </Button>
              <Button component={Link} href="/signup" variant="contained" size="small" sx={{ fontSize: "17px" }}>
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
