"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Box, Container, Paper, Typography, TextField, IconButton, CircularProgress, Alert } from "@mui/material"
import { useSearchParams } from "next/navigation"
import SendIcon from "@mui/icons-material/Send"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useAuth } from "@/lib/auth-context"
import { useChat } from "@/lib/chat-context"
import { ConversationItem } from "@/components/chat/conversation-item"
import { MessageItem } from "@/components/chat/message-item"

export default function ChatPage() {
  const [messageInput, setMessageInput] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showConversations, setShowConversations] = useState(true)
  const { user } = useAuth()
  const { conversations, currentConversation, messages, isLoading, error, sendNewMessage, selectConversation } =
    useChat()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if we should open a specific conversation from URL params
  useEffect(() => {
    const conversationId = searchParams.get("id")
    if (conversationId && user) {
      selectConversation(conversationId)
      setShowConversations(false)
    }
  }, [searchParams, user])

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return

    await sendNewMessage(messageInput)
    setMessageInput("")
  }

  const handleSelectConversation = async (conversationId: string) => {
    await selectConversation(conversationId)
    if (isMobileView) {
      setShowConversations(false)
    }
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Please log in to use the chat feature.</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={3}>
        Messages
      </Typography>

      <Paper
        elevation={3}
        sx={{
          display: "flex",
          height: "calc(100vh - 200px)",
          minHeight: "500px",
          overflow: "hidden",
          boxShadow: "none",
        }}
      >
        {/* Conversations List */}
        {(!isMobileView || showConversations) && (
          <Box
            sx={{
              width: isMobileView ? "100%" : "300px",
              borderRight: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6">Conversations</Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: "auto" }}>
              {isLoading && !conversations.length ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : conversations.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No conversations yet. Start by messaging a lender or borrower.
                  </Typography>
                </Box>
              ) : (
                conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={currentConversation?.id === conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                  />
                ))
              )}
            </Box>
          </Box>
        )}

        {/* Chat Area */}
        {(!isMobileView || !showConversations) && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isMobileView && (
                <IconButton edge="start" onClick={() => setShowConversations(true)} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
              )}

              {currentConversation ? (
                <Box>
                  <Typography variant="h6">
                    {currentConversation.participantNames[
                      currentConversation.participants.find((id) => id !== user.uid) || ""
                    ] || "Unknown"}
                  </Typography>

                  {currentConversation.relatedItemTitle && (
                    <Typography variant="caption" color="text.secondary">
                      Re: {currentConversation.relatedItemTitle}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="h6">Select a conversation</Typography>
              )}
            </Box>

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 2,
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default",
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {isLoading && !messages.length ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : !currentConversation ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <Typography color="text.secondary">Select a conversation to start chatting</Typography>
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
                </Box>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <MessageItem key={message.id} message={message} isLastMessage={index === messages.length - 1} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Message Input */}
            {currentConversation && (
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  autoComplete="off"
                />
                <IconButton color="primary" type="submit" disabled={!messageInput.trim()} sx={{ ml: 1 }}>
                  <SendIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  )
}
