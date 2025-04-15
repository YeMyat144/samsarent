import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot,
  } from "firebase/firestore"
  import { db } from "./firebase"
  import type { ChatMessage, ChatConversation } from "@/types"
  
  // Create or get a conversation between two users
  export const getOrCreateConversation = async (
    userId1: string,
    userId2: string,
    userName1: string,
    userName2: string,
    itemId?: string,
    itemTitle?: string,
  ): Promise<string> => {
    try {
      // Check if a conversation already exists between these users
      const conversationsRef = collection(db, "conversations")
      const q = query(conversationsRef, where("participants", "array-contains", userId1))
  
      const querySnapshot = await getDocs(q)
  
      let existingConversation: ChatConversation | null = null
  
      querySnapshot.forEach((doc) => {
        const conversation = { id: doc.id, ...doc.data() } as ChatConversation
        if (conversation.participants.includes(userId2)) {
          existingConversation = conversation
        }
      })
  
      if (existingConversation) {
        return existingConversation.id
      }
  
      // Create a new conversation
      const participantNames: Record<string, string> = {}
      participantNames[userId1] = userName1
      participantNames[userId2] = userName2
  
      const unreadCount: Record<string, number> = {}
      unreadCount[userId1] = 0
      unreadCount[userId2] = 0
  
      const newConversation = {
        participants: [userId1, userId2],
        participantNames,
        updatedAt: serverTimestamp(),
        unreadCount,
      } as Partial<ChatConversation>
  
      // Add item reference if provided
      if (itemId && itemTitle) {
        newConversation.relatedItemId = itemId
        newConversation.relatedItemTitle = itemTitle
      }
  
      const docRef = await addDoc(conversationsRef, newConversation)
      return docRef.id
    } catch (error) {
      console.error("Error creating conversation:", error)
      throw error
    }
  }
  
  // Send a message in a conversation
  export const sendMessage = async (
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
  ): Promise<string> => {
    try {
      // Add the message
      const messagesRef = collection(db, "messages")
      const messageData = {
        conversationId,
        senderId,
        senderName,
        content,
        createdAt: serverTimestamp(),
        read: false,
      }
  
      const messageRef = await addDoc(messagesRef, messageData)
  
      // Update the conversation with the last message
      const conversationRef = doc(db, "conversations", conversationId)
      const conversationDoc = await getDoc(conversationRef)
  
      if (conversationDoc.exists()) {
        const conversation = conversationDoc.data() as ChatConversation
  
        // Update unread count for all participants except the sender
        const unreadCount = { ...conversation.unreadCount }
        conversation.participants.forEach((participantId) => {
          if (participantId !== senderId) {
            unreadCount[participantId] = (unreadCount[participantId] || 0) + 1
          }
        })
  
        await updateDoc(conversationRef, {
          lastMessage: {
            content,
            senderId,
            createdAt: serverTimestamp(),
          },
          updatedAt: serverTimestamp(),
          unreadCount,
        })
      }
  
      return messageRef.id
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }
  
  // Get all conversations for a user
  export const getUserConversations = async (userId: string): Promise<ChatConversation[]> => {
    try {
      const conversationsRef = collection(db, "conversations")
      const q = query(conversationsRef, where("participants", "array-contains", userId), orderBy("updatedAt", "desc"))
  
      const querySnapshot = await getDocs(q)
      const conversations: ChatConversation[] = []
  
      querySnapshot.forEach((doc) => {
        conversations.push({ id: doc.id, ...doc.data() } as ChatConversation)
      })
  
      return conversations
    } catch (error) {
      console.error("Error getting conversations:", error)
      throw error
    }
  }
  
  // Get messages for a conversation
  export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    try {
      const messagesRef = collection(db, "messages")
      const q = query(messagesRef, where("conversationId", "==", conversationId), orderBy("createdAt", "asc"))
  
      const querySnapshot = await getDocs(q)
      const messages: ChatMessage[] = []
  
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage)
      })
  
      return messages
    } catch (error) {
      console.error("Error getting messages:", error)
      throw error
    }
  }
  
  // Mark messages as read
  export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
    try {
      // Update the unread count for this user in the conversation
      const conversationRef = doc(db, "conversations", conversationId)
      const conversationDoc = await getDoc(conversationRef)
  
      if (conversationDoc.exists()) {
        const conversation = conversationDoc.data() as ChatConversation
        const unreadCount = { ...conversation.unreadCount }
        unreadCount[userId] = 0
  
        await updateDoc(conversationRef, { unreadCount })
      }
  
      // Mark all messages from other users as read
      const messagesRef = collection(db, "messages")
      const q = query(
        messagesRef,
        where("conversationId", "==", conversationId),
        where("senderId", "!=", userId),
        where("read", "==", false),
      )
  
      const querySnapshot = await getDocs(q)
  
      const batch = querySnapshot.docs.map((doc) => {
        const messageRef = doc.ref
        return updateDoc(messageRef, { read: true })
      })
  
      await Promise.all(batch)
    } catch (error) {
      console.error("Error marking messages as read:", error)
      throw error
    }
  }
  
  // Get total unread message count for a user
  export const getTotalUnreadCount = async (userId: string): Promise<number> => {
    try {
      const conversationsRef = collection(db, "conversations")
      const q = query(conversationsRef, where("participants", "array-contains", userId))
  
      const querySnapshot = await getDocs(q)
      let totalUnread = 0
  
      querySnapshot.forEach((doc) => {
        const conversation = doc.data() as ChatConversation
        if (conversation.unreadCount && conversation.unreadCount[userId]) {
          totalUnread += conversation.unreadCount[userId]
        }
      })
  
      return totalUnread
    } catch (error) {
      console.error("Error getting unread count:", error)
      return 0
    }
  }
  
  // Subscribe to conversations updates
  export const subscribeToConversations = (userId: string, callback: (conversations: ChatConversation[]) => void) => {
    const conversationsRef = collection(db, "conversations")
    const q = query(conversationsRef, where("participants", "array-contains", userId), orderBy("updatedAt", "desc"))
  
    return onSnapshot(q, (querySnapshot) => {
      const conversations: ChatConversation[] = []
      querySnapshot.forEach((doc) => {
        conversations.push({ id: doc.id, ...doc.data() } as ChatConversation)
      })
      callback(conversations)
    })
  }
  
  // Subscribe to messages in a conversation
  export const subscribeToMessages = (conversationId: string, callback: (messages: ChatMessage[]) => void) => {
    const messagesRef = collection(db, "messages")
    const q = query(messagesRef, where("conversationId", "==", conversationId), orderBy("createdAt", "asc"))
  
    return onSnapshot(q, (querySnapshot) => {
      const messages: ChatMessage[] = []
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage)
      })
      callback(messages)
    })
  }
  