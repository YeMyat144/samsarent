"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Chat as ChatIcon,
  Message as MessageIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material"
import { useAuth } from "@/lib/auth-context"
import { updateUser } from "@/lib/firestore"
import type { User } from "@/types/index"

interface ContactSettingsProps {
  onSave?: () => void
}

export function ContactSettings({ onSave }: ContactSettingsProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [contactMethods, setContactMethods] = useState({
    line: "",
    messenger: "",
    whatsapp: "",
    telegram: "",
    phone: "",
  })

  // Load user's current contact methods
  useEffect(() => {
    if (user?.contactMethods) {
      setContactMethods({
        line: user.contactMethods.line || "",
        messenger: user.contactMethods.messenger || "",
        whatsapp: user.contactMethods.whatsapp || "",
        telegram: user.contactMethods.telegram || "",
        phone: user.contactMethods.phone || "",
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setContactMethods(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      // Filter out empty values
      const filteredContactMethods = Object.fromEntries(
        Object.entries(contactMethods).filter(([_, value]) => value.trim() !== "")
      )

      await updateUser(user.uid, {
        contactMethods: filteredContactMethods
      })

      setSuccess("Contact methods updated successfully!")
      setIsEditing(false)
      onSave?.()
    } catch (err: any) {
      setError(err.message || "Failed to update contact methods")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    if (user?.contactMethods) {
      setContactMethods({
        line: user.contactMethods.line || "",
        messenger: user.contactMethods.messenger || "",
        whatsapp: user.contactMethods.whatsapp || "",
        telegram: user.contactMethods.telegram || "",
        phone: user.contactMethods.phone || "",
      })
    } else {
      setContactMethods({
        line: "",
        messenger: "",
        whatsapp: "",
        telegram: "",
        phone: "",
      })
    }
    setIsEditing(false)
    setError(null)
    setSuccess(null)
  }

  const getContactIcon = (type: string) => {
    switch (type) {
      case "line":
        return <ChatIcon />
      case "messenger":
        return <MessageIcon />
      case "whatsapp":
        return <WhatsAppIcon />
      case "telegram":
        return <TelegramIcon />
      case "phone":
        return <PhoneIcon />
      default:
        return <ChatIcon />
    }
  }

  const getContactLabel = (type: string) => {
    switch (type) {
      case "line":
        return "LINE ID"
      case "messenger":
        return "Messenger Username"
      case "whatsapp":
        return "WhatsApp Number"
      case "telegram":
        return "Telegram Username"
      case "phone":
        return "Phone Number"
      default:
        return type
    }
  }

  const getContactPlaceholder = (type: string) => {
    switch (type) {
      case "line":
        return "e.g., @username or username"
      case "messenger":
        return "e.g., username"
      case "whatsapp":
        return "e.g., +1234567890"
      case "telegram":
        return "e.g., @username"
      case "phone":
        return "e.g., +1234567890"
      default:
        return ""
    }
  }

  if (!user) {
    return (
      <Alert severity="info">
        Please log in to manage your contact methods.
      </Alert>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">
          Contact Methods
        </Typography>
        {!isEditing ? (
          <Tooltip title="Edit contact methods">
            <IconButton onClick={() => setIsEditing(true)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Save changes">
              <IconButton 
                onClick={handleSave} 
                color="primary" 
                disabled={isLoading}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton onClick={handleCancel} color="secondary">
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add your contact information to make it easier for others to reach you through alternative channels. 
        This information will be visible to users you chat with.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(contactMethods).map(([type, value]) => (
          <Box key={type} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ minWidth: 40, display: "flex", justifyContent: "center" }}>
              {getContactIcon(type)}
            </Box>
            <TextField
              fullWidth
              label={getContactLabel(type)}
              placeholder={getContactPlaceholder(type)}
              value={value}
              onChange={(e) => handleInputChange(type, e.target.value)}
              disabled={!isEditing || isLoading}
              size="small"
              variant="outlined"
            />
          </Box>
        ))}
      </Box>

      {isEditing && (
        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      )}
    </Paper>
  )
}
