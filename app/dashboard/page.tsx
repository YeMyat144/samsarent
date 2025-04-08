"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getItems } from "@/lib/firestore"
import { ItemCard } from "@/components/item-card"
import type { Item } from "@/types"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      if (!loading) {
        try {
          setIsLoading(true)
          if (user) {
            const fetchedItems = await getItems()
            setItems(fetchedItems)
          }
        } catch (error: any) {
          console.error("Error fetching items:", error)
          // You could add state for error handling if needed
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchItems()
  }, [user, loading])

  if (loading || isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <p>Please login to view this page</p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Items</h1>
        <Button asChild>
          <Link href="/items/new">Add New Item</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg mb-4">No items available yet</p>
          <Button asChild>
            <Link href="/items/new">Be the first to add an item</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
