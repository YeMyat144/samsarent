import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Item, BorrowRequest, User } from "@/types"

// Add this function at the top of the file
const handleFirestoreError = (error: any) => {
  console.error("Firestore operation failed:", error)
  if (error.code === "unavailable" || error.message.includes("offline")) {
    throw new Error("Unable to connect to the database. Please check your internet connection.")
  }
  throw error
}

// User operations
export const createUser = async (userData: Omit<User, "id">) => {
  const userRef = doc(db, "users", userData.uid)
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
  })
}

export const getUser = async (userId: string) => {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  const data = userSnap.data() as Omit<User, "id">

  if (userSnap.exists()) {
    return { id: userSnap.id, ...data }
  }

  return null
}

export const updateUser = async (userId: string, updates: Partial<User>) => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, updates)
  } catch (error) {
    handleFirestoreError(error)
  }
}

// Item operations
export const addItem = async (itemData: Omit<Item, "id">) => {
  try {
    const itemsRef = collection(db, "items")
    const docRef = await addDoc(itemsRef, {
      ...itemData,
      createdAt: serverTimestamp(),
    })

    return docRef.id
  } catch (error) {
    return handleFirestoreError(error)
  }
}

export const getItems = async () => {
  try {
    const itemsRef = collection(db, "items")
    const querySnapshot = await getDocs(itemsRef)

    const items: Item[] = []
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as Item)
    })

    return items
  } catch (error) {
    return handleFirestoreError(error)
  }
}

export const getItem = async (itemId: string) => {
  try {
    const itemRef = doc(db, "items", itemId)
    const itemSnap = await getDoc(itemRef)

    if (itemSnap.exists()) {
      return { id: itemSnap.id, ...itemSnap.data() } as Item
    }

    return null
  } catch (error) {
    return handleFirestoreError(error)
  }
}

export const updateItemAvailability = async (itemId: string, available: boolean) => {
  const itemRef = doc(db, "items", itemId)
  await updateDoc(itemRef, { available })
}

export const deleteItem = async (itemId: string) => {
  const itemRef = doc(db, "items", itemId)
  await deleteDoc(itemRef)
}

// Borrow request operations
export const createBorrowRequest = async (requestData: any) => {
  const requestsRef = collection(db, "borrowRequests")
  const docRef = await addDoc(requestsRef, {
    ...requestData,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

export const getBorrowRequests = async (userId: string) => {
  try {
    const requestsRef = collection(db, "borrowRequests")
    const q = query(requestsRef, where("ownerId", "==", userId))
    const q2 = query(requestsRef, where("borrowerId", "==", userId))

    const [ownerSnapshot, borrowerSnapshot] = await Promise.all([getDocs(q), getDocs(q2)])

    const requests: BorrowRequest[] = []

    ownerSnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as BorrowRequest)
    })

    borrowerSnapshot.forEach((doc) => {
      // Avoid duplicates if user is both owner and borrower
      if (!requests.some((req) => req.id === doc.id)) {
        requests.push({ id: doc.id, ...doc.data() } as BorrowRequest)
      }
    })

    return requests
  } catch (error) {
    return handleFirestoreError(error)
  }
}

// Update the updateBorrowRequest function to handle swap information
export const updateBorrowRequest = async (
  requestId: string,
  status: "approved" | "rejected",
  deliveryMessage?: string,
  paymentRequired?: boolean,
  isSwap?: boolean,
) => {
  try {
    const requestRef = doc(db, "borrowRequests", requestId)

    // Create update data object with only the fields we want to update
    const updateData: Record<string, any> = { status }

    if (deliveryMessage !== undefined) {
      updateData.deliveryMessage = deliveryMessage
    }

    if (paymentRequired !== undefined) {
      updateData.paymentRequired = paymentRequired
    }

    // Don't include isSwap in the update if it's undefined
    if (isSwap !== undefined) {
      updateData.isSwap = isSwap
    }

    await updateDoc(requestRef, updateData)
  } catch (error) {
    return handleFirestoreError(error)
  }
}

// Add a function to get user items for swap
export const getUserItems = async (userId: string) => {
  try {
    const itemsRef = collection(db, "items")
    const q = query(itemsRef, where("ownerId", "==", userId), where("available", "==", true))
    const querySnapshot = await getDocs(q)

    const items: Item[] = []
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as Item)
    })

    return items
  } catch (error) {
    return handleFirestoreError(error)
  }
}
