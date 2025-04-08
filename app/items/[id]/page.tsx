"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getItem, createBorrowRequest, deleteItem } from "@/lib/firestore"
import type { Item } from "@/types"

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<Item | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [requestSent, setRequestSent] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true)
        const fetchedItem = await getItem(params.id)
        setItem(fetchedItem)
      } catch (error: any) {
        console.error("Error fetching item:", error)
        setError(error.message || "Failed to load item details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchItem()
    }
  }, [params.id])

  const handleBorrowRequest = async () => {
    if (!user || !item) return

    try {
      await createBorrowRequest({
        itemId: item.id,
        itemTitle: item.title,
        borrowerId: user.uid,
        borrowerName: user.displayName || "Unknown",
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        status: "pending",
        createdAt: new Date(),
      })

      setRequestSent(true)
    } catch (err: any) {
      setError(err.message || "Failed to send borrow request")
    }
  }

  const handleDeleteItem = async () => {
    if (!user || !item) return

    if (user.uid !== item.ownerId) {
      setError("You don't have permission to delete this item")
      return
    }

    try {
      await deleteItem(item.id)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to delete item")
    }
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>
  }

  if (!item) {
    return <div className="container mx-auto p-4">Item not found</div>
  }

  const isOwner = user && user.uid === item.ownerId

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{item.title}</CardTitle>
              <CardDescription>Listed by {item.ownerName}</CardDescription>
            </div>
            <Badge variant={item.available ? "default" : "secondary"}>
              {item.available ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Description</h3>
            <p>{item.description}</p>
          </div>
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold mb-1">Category</h3>
              <p className="capitalize">{item.category}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Daily Price</h3>
              <p>${item.price.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Listings
          </Button>

          {isOwner ? (
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete Item
            </Button>
          ) : (
            <Button onClick={handleBorrowRequest} disabled={!item.available || requestSent || !user}>
              {requestSent
                ? "Request Sent"
                : !user
                  ? "Login to Borrow"
                  : !item.available
                    ? "Unavailable"
                    : "Request to Borrow"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
