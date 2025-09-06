"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import {Box, Container, Paper, Typography, TextField, IconButton, Button} from "@mui/material"
import Alert from "@mui/material/Alert"
import CircularProgress from "@mui/material/CircularProgress"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import SendIcon from "@mui/icons-material/Send"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import DeleteIcon from "@mui/icons-material/Delete"
import { useAuth } from "@/lib/auth-context"
import { useChat } from "@/lib/chat-context"
import { ConversationItem } from "@/components/chat/conversation-item"
import { MessageItem } from "@/components/chat/message-item"
import { ContactMethods } from "@/components/contact-methods"

export default function ChatPage() {
  const [messageInput, setMessageInput] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showConversations, setShowConversations] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { user } = useAuth()
  const {
    conversations,
    currentConversation,
    messages,
    otherUser,
    isLoading,
    error,
    sendNewMessage,
    selectConversation,
    deleteCurrentConversation,
  } = useChat()
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

  const handleDeleteConversation = async () => {
    await deleteCurrentConversation()
    setDeleteDialogOpen(false)
    if (isMobileView) {
      setShowConversations(true)
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
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Secure internal messaging
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: "auto" }}>
              {isLoading && !conversations.length ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : conversations.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="text.secondary" gutterBottom>
                    No conversations yet. Start by messaging a lender or borrower.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    All conversations are private and secure
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
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                {isMobileView && (
                  <IconButton edge="start" onClick={() => setShowConversations(true)} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                  </IconButton>
                )}

                {currentConversation ? (
                  <Box sx={{ flex: 1 }}>
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

                    {/* Contact Methods */}
                    {otherUser && (
                      <Box sx={{ mt: 1 }}>
                        <ContactMethods user={otherUser} variant="compact" showLabel={false} />
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="h6">Select a conversation</Typography>
                )}
              </Box>

              {currentConversation && (
                <IconButton color="error" onClick={() => setDeleteDialogOpen(true)} aria-label="Delete conversation">
                  <DeleteIcon />
                </IconButton>
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
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", textAlign: "center", p: 3 }}>
                  <Typography color="text.secondary" gutterBottom>
                    No messages yet. Start the conversation!
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This is your secure, private communication channel
                  </Typography>
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
              <Box>
                {/* Primary Communication Notice */}
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "primary.50",
                    borderTop: "1px solid",
                    borderColor: "primary.200",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                    💬 Primary communication channel - All messages are secure and private
                  </Typography>
                </Box>
                
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
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this conversation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConversation} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
