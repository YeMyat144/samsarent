"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AppBar, Toolbar, Button, Box, Avatar, Menu, MenuItem, ListItemIcon, Typography, Divider, Badge } from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"
import LogoutIcon from "@mui/icons-material/Logout"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useChat } from "@/lib/chat-context"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { unreadCount } = useChat()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleClose()
    await logout()
    router.push("/")
  }

  const handleProfileClick = () => {
    handleClose()
    router.push("/profile")
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: 'secondary.main', boxShadow: "none" }}>
      <Toolbar sx={{ mt: 1, mb: 1, ml: 4, mr: 4, display: "flex", justifyContent: "space-between"  }}>
        
        <Link href="/" >
          <img
            src="/logo.png"
            alt="Samsarent Logo"
            style={{ width: "auto", height: "65px", marginRight: "10px" }} 
          />
        </Link> 

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user ? (
            <>
              <Button
                component={Link}
                href="/dashboard"
                color={pathname === "/dashboard" ? "primary" : "inherit"}
                sx={{
                  fontSize: "17px" 
                }}
              >
                Browse
              </Button>

              <Button
                component={Link}
                href="/requests"
                color={pathname === "/requests" ? "primary" : "inherit"}
                sx={{
                  fontSize: "17px" 
                }}
              >
                Requests
              </Button>

              <Badge
                badgeContent={unreadCount}
                color="error"
                overlap="rectangular"
              >
                <Button
                  component={Link}
                  href="/chat"
                  color={pathname === "/chat" ? "primary" : "inherit"}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "17px" 
                  }}
                >
                  Chat
                </Button>
              </Badge>

              <Avatar
                onClick={handleClick}
                sx={{
                  width:38,
                  height: 38,
                  bgcolor: "primary.main",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "17px" ,
                  fontWeight: "bold",
                }}
              >
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    overflow: "visible",
                    mt: 1.5,
                    "& .MuiMenuItem-root": {
                      px: 2,
                      py: 1,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {user.displayName || "User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: "0.75rem" }}>
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                component={Link}
                href="/login"
                color={pathname === "/login" ? "primary" : "inherit"}
                sx={{
                  fontSize: "17px" ,
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                size="small"
                sx={{
                  bgcolor: "primary.main",
                  fontSize: "17px" ,
                  color: "white",
                  "&:hover": {
                    bgcolor: "secondary.light",
                  },
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}


