import type { Timestamp } from "firebase/firestore"

export interface User {
  uid: string
  email: string
  displayName: string
  createdAt: Date | Timestamp
}

export interface Item {
  id: string
  title: string
  description: string
  category: string
  price: number
  ownerId: string
  ownerName: string
  available: boolean
  createdAt: Date | Timestamp
  imageUrl?: string
}

export interface BorrowRequest {
  id: string
  itemId: string
  itemTitle: string
  borrowerId: string
  borrowerName: string
  ownerId: string
  ownerName: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date | Timestamp
  deliveryMessage?: string
  paymentRequired?: boolean
  isSwap?: boolean
  swapItemId?: string
  swapItemTitle?: string
  swapDuration?: number
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  createdAt: Date | Timestamp
  read: boolean
}

export interface ChatConversation {
  id: string
  participants: string[] 
  participantNames: Record<string, string> 
  lastMessage?: {
    content: string
    senderId: string
    createdAt: Date | Timestamp
  }
  updatedAt: Date | Timestamp
  relatedItemId?: string
  relatedItemTitle?: string
  unreadCount?: Record<string, number> 
}

