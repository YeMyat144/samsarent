"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type UserCredential
} from "firebase/auth"
import { auth } from "./firebase"
import { createUser, getUser } from "./firestore"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  signup: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<UserCredential> // Correct return type
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {},
  login: async () => { return {} as UserCredential }, // Default empty return type
  logout: async () => {},
  refreshUser: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch the full user data from Firestore
        try {
          const userData = await getUser(firebaseUser.uid)
          if (userData) {
            setUser(userData)
          } else {
            // If user data doesn't exist in Firestore, create it
            await createUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              createdAt: new Date(),
            })
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              createdAt: new Date(),
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signup = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        })

        // Create user document in Firestore
        await createUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || "",
          displayName: name,
          createdAt: new Date(),
        })

        // Update the local user state with the new user data
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || "",
          displayName: name,
          createdAt: new Date(),
        })
      }
    } catch (error) {
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    return signOut(auth)
  }

  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        const userData = await getUser(auth.currentUser.uid)
        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error("Error refreshing user data:", error)
      }
    }
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
