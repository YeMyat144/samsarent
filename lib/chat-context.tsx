"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import {
  sendMessage,
  markMessagesAsRead,
  getTotalUnreadCount,
  subscribeToConversations,
  subscribeToMessages,
  getOrCreateConversation,
  deleteConversation,
} from "./chat"
import type { ChatConversation, ChatMessage } from "@/types"

interface ChatContextType {
  conversations: ChatConversation[]
  currentConversation: ChatConversation | null
  messages: ChatMessage[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  sendNewMessage: (content: string) => Promise<void>
  selectConversation: (conversationId: string) => Promise<void>
  startNewConversation: (
    otherUserId: string,
    otherUserName: string,
    itemId?: string,
    itemTitle?: string,
  ) => Promise<string>
  refreshUnreadCount: () => Promise<void>
  deleteCurrentConversation: () => Promise<void>
}

const ChatContext = createContext<ChatContextType>({
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  sendNewMessage: async () => {},
  selectConversation: async () => {},
  startNewConversation: async () => "",
  refreshUnreadCount: async () => {},
  deleteCurrentConversation: async () => {},
})

export const useChat = () => useContext(ChatContext)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Load conversations when user changes
  useEffect(() => {
    if (!user) {
      setConversations([])
      setCurrentConversation(null)
      setMessages([])
      setUnreadCount(0)
      return
    }

    // Subscribe to conversations
    const unsubscribe = subscribeToConversations(user.uid, (updatedConversations) => {
      setConversations(updatedConversations)

      // Update current conversation if it's in the list
      if (currentConversation) {
        const updated = updatedConversations.find((c) => c.id === currentConversation.id)
        if (updated) {
          setCurrentConversation(updated)
        }
      }

      // Calculate total unread count
      let total = 0
      updatedConversations.forEach((conv) => {
        if (conv.unreadCount && conv.unreadCount[user.uid]) {
          total += conv.unreadCount[user.uid]
        }
      })
      setUnreadCount(total)
    })

    // Fetch initial unread count
    refreshUnreadCount()

    return () => unsubscribe()
  }, [user])

  // Subscribe to messages when current conversation changes
  useEffect(() => {
    if (!currentConversation || !user) return

    // Mark messages as read when conversation is selected
    markMessagesAsRead(currentConversation.id, user.uid).catch((err) =>
      console.error("Error marking messages as read:", err),
    )

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(currentConversation.id, (updatedMessages) => {
      setMessages(updatedMessages)
    })

    return () => unsubscribe()
  }, [currentConversation, user])

  const selectConversation = async (conversationId: string) => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Find the conversation in the list
      const conversation = conversations.find((c) => c.id === conversationId)
      if (conversation) {
        setCurrentConversation(conversation)

        // Mark messages as read
        await markMessagesAsRead(conversationId, user.uid)

        // Refresh unread count
        await refreshUnreadCount()
      }
    } catch (err: any) {
      setError(err.message || "Failed to load conversation")
      console.error("Error selecting conversation:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const sendNewMessage = async (content: string) => {
    if (!user || !currentConversation) return

    try {
      setError(null)
      await sendMessage(currentConversation.id, user.uid, user.displayName || "Unknown", content)
    } catch (err: any) {
      setError(err.message || "Failed to send message")
      console.error("Error sending message:", err)
    }
  }

  const startNewConversation = async (
    otherUserId: string,
    otherUserName: string,
    itemId?: string,
    itemTitle?: string,
  ) => {
    if (!user) throw new Error("You must be logged in to start a conversation")

    try {
      setIsLoading(true)
      setError(null)

      const conversationId = await getOrCreateConversation(
        user.uid,
        otherUserId,
        user.displayName || "Unknown",
        otherUserName,
        itemId,
        itemTitle,
      )

      // Select the new conversation
      await selectConversation(conversationId)

      return conversationId
    } catch (err: any) {
      setError(err.message || "Failed to start conversation")
      console.error("Error starting conversation:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUnreadCount = async () => {
    if (!user) return

    try {
      const count = await getTotalUnreadCount(user.uid)
      setUnreadCount(count)
    } catch (err) {
      console.error("Error refreshing unread count:", err)
    }
  }

  const deleteCurrentConversation = async () => {
    if (!currentConversation) return

    try {
      setIsLoading(true)
      setError(null)

      await deleteConversation(currentConversation.id)

      // Reset current conversation
      setCurrentConversation(null)
      setMessages([])
    } catch (err: any) {
      setError(err.message || "Failed to delete conversation")
      console.error("Error deleting conversation:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        unreadCount,
        isLoading,
        error,
        sendNewMessage,
        selectConversation,
        startNewConversation,
        refreshUnreadCount,
        deleteCurrentConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
