"use client"

import { useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Avatar from "@mui/material/Avatar"
import { useAuth } from "@/lib/auth-context"
import type { ChatMessage } from "@/types"

interface MessageItemProps {
  message: ChatMessage
  isLastMessage?: boolean
}

export function MessageItem({ message, isLastMessage = false }: MessageItemProps) {
  const { user } = useAuth()
  const messageRef = useRef<HTMLDivElement>(null)
  const isCurrentUser = user && message.senderId === user.uid

  // Format timestamp
  const timestamp =
    message.createdAt && "toDate" in message.createdAt
      ? message.createdAt.toDate()
      : message.createdAt instanceof Date
        ? message.createdAt
        : new Date()

  const timeString = timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  // Scroll into view if this is the last message
  useEffect(() => {
    if (isLastMessage && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [isLastMessage])

  return (
    <Box
      ref={messageRef}
      sx={{
        display: "flex",
        flexDirection: isCurrentUser ? "row-reverse" : "row",
        mb: 2,
        maxWidth: "80%",
        alignSelf: isCurrentUser ? "flex-end" : "flex-start",
      }}
    >
      {!isCurrentUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            mr: 1,
            bgcolor: "primary.main",
            fontSize: "0.875rem",
          }}
        >
          {message.senderName.charAt(0).toUpperCase()}
        </Avatar>
      )}

      <Box>
        {!isCurrentUser && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {message.senderName}
          </Typography>
        )}

        <Box
          sx={{
            bgcolor: isCurrentUser ? "primary.main" : "grey.100",
            color: isCurrentUser ? "white" : "text.primary",
            borderRadius: 2,
            px: 2,
            py: 1,
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          <Typography variant="body2">{message.content}</Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: isCurrentUser ? "right" : "left",
            mt: 0.5,
            mx: 1,
          }}
        >
          {timeString}
        </Typography>
      </Box>
    </Box>
  )
}
