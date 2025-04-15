"use client"

import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Avatar from "@mui/material/Avatar"
import Badge from "@mui/material/Badge"
import { useAuth } from "@/lib/auth-context"
import type { ChatConversation } from "@/types"

interface ConversationItemProps {
  conversation: ChatConversation
  isSelected: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const { user } = useAuth()

  if (!user) return null

  // Get the other participant's info
  const otherParticipantId = conversation.participants.find((id) => id !== user.uid) || ""
  const otherParticipantName = conversation.participantNames[otherParticipantId] || "Unknown"

  // Get unread count for current user
  const unreadCount = conversation.unreadCount?.[user.uid] || 0

  // Format timestamp
  const timestamp =
    conversation.updatedAt && "toDate" in conversation.updatedAt
      ? conversation.updatedAt.toDate()
      : conversation.updatedAt instanceof Date
        ? conversation.updatedAt
        : new Date()

  const timeString = timestamp.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // Format last message
  const lastMessage = conversation.lastMessage?.content || "No messages yet"
  const isLastMessageFromUser = conversation.lastMessage?.senderId === user.uid

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        p: 2,
        borderRadius: 1,
        cursor: "pointer",
        bgcolor: isSelected ? "action.selected" : "transparent",
        "&:hover": {
          bgcolor: isSelected ? "action.selected" : "action.hover",
        },
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Badge color="secondary" badgeContent={unreadCount} invisible={unreadCount === 0} overlap="circular">
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: "primary.main",
          }}
        >
          {otherParticipantName.charAt(0).toUpperCase()}
        </Avatar>
      </Badge>

      <Box sx={{ ml: 2, flex: 1, overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" noWrap fontWeight={unreadCount > 0 ? "bold" : "normal"}>
            {otherParticipantName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {timeString}
          </Typography>
        </Box>

        {conversation.relatedItemTitle && (
          <Typography
            variant="caption"
            color="primary"
            sx={{
              display: "block",
              mb: 0.5,
            }}
          >
            Re: {conversation.relatedItemTitle}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" noWrap fontWeight={unreadCount > 0 ? "bold" : "normal"}>
          {isLastMessageFromUser ? `You: ${lastMessage}` : lastMessage}
        </Typography>
      </Box>
    </Box>
  )
}
