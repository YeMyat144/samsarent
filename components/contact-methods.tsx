"use client"

import React from "react"
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material"
import {
  Chat as ChatIcon,
  Message as MessageIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Phone as PhoneIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material"
import type { User } from "@/types"

interface ContactMethodsProps {
  user: User
  variant?: "compact" | "full"
  showLabel?: boolean
}

export function ContactMethods({ user, variant = "compact", showLabel = true }: ContactMethodsProps) {
  const contactMethods = user.contactMethods || {}
  const hasContactMethods = Object.values(contactMethods).some(method => method && method.trim() !== "")

  if (!hasContactMethods) {
    return null
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
        return "LINE"
      case "messenger":
        return "Messenger"
      case "whatsapp":
        return "WhatsApp"
      case "telegram":
        return "Telegram"
      case "phone":
        return "Phone"
      default:
        return type
    }
  }

  const getContactUrl = (type: string, value: string) => {
    switch (type) {
      case "line":
        return `https://line.me/ti/p/${value}`
      case "messenger":
        return `https://m.me/${value}`
      case "whatsapp":
        return `https://wa.me/${value.replace(/[^\d]/g, "")}`
      case "telegram":
        return `https://t.me/${value}`
      case "phone":
        return `tel:${value}`
      default:
        return "#"
    }
  }

  const contactEntries = Object.entries(contactMethods).filter(([_, value]) => value && value.trim() !== "")

  if (variant === "compact") {
    return (
      <Box>
        {showLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            Alternative Contact:
          </Typography>
        )}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {contactEntries.map(([type, value]) => (
            <Tooltip key={type} title={`Contact via ${getContactLabel(type)}`}>
              <IconButton
                size="small"
                color="primary"
                href={getContactUrl(type, value)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  p: 0.5,
                  "&:hover": {
                    bgcolor: "primary.50"
                  }
                }}
              >
                {getContactIcon(type)}
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      </Box>
    )
  }

  return (
    <Box>
      {showLabel && (
        <Typography variant="subtitle2" gutterBottom>
          Alternative Contact Methods
        </Typography>
      )}
      <Stack spacing={1}>
        {contactEntries.map(([type, value]) => (
          <Box key={type} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              color="primary"
              href={getContactUrl(type, value)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {getContactIcon(type)}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {getContactLabel(type)}: {value}
            </Typography>
            <IconButton
              size="small"
              href={getContactUrl(type, value)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
