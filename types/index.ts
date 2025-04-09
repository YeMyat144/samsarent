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
}
