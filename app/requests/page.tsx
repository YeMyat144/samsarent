"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { getBorrowRequests, updateBorrowRequest, updateItemAvailability } from "@/lib/firestore"
import type { BorrowRequest } from "@/types"

export default function RequestsPage() {
  const [incomingRequests, setIncomingRequests] = useState<BorrowRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<BorrowRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return

      try {
        const requests = await getBorrowRequests(user.uid)

        setIncomingRequests(requests.filter((req) => req.ownerId === user.uid))
        setOutgoingRequests(requests.filter((req) => req.borrowerId === user.uid))
      } catch (error) {
        console.error("Error fetching requests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [user])

  const handleRequestAction = async (requestId: string, status: "approved" | "rejected", itemId?: string) => {
    try {
      await updateBorrowRequest(requestId, status)

      // If approved, update item availability
      if (status === "approved" && itemId) {
        await updateItemAvailability(itemId, false)
      }

      // Update local state
      setIncomingRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status } : req)))
    } catch (error) {
      console.error("Error updating request:", error)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  if (!user) {
    return <div className="container mx-auto p-4">Please login to view your requests</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Borrow Requests</h1>

      <Tabs defaultValue="incoming">
        <TabsList className="mb-4">
          <TabsTrigger value="incoming">Incoming Requests ({incomingRequests.length})</TabsTrigger>
          <TabsTrigger value="outgoing">Your Requests ({outgoingRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming">
          {incomingRequests.length === 0 ? (
            <p>No incoming requests</p>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{request.itemTitle}</CardTitle>
                    <CardDescription>
                      Request from {request.borrowerName} •{" "}
                      {new Date(request.createdAt.toMillis()).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={
                        request.status === "pending"
                          ? "outline"
                          : request.status === "approved"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </CardContent>
                  {request.status === "pending" && (
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => handleRequestAction(request.id, "rejected")}>
                        Decline
                      </Button>
                      <Button onClick={() => handleRequestAction(request.id, "approved", request.itemId)}>
                        Approve
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outgoing">
          {outgoingRequests.length === 0 ? (
            <p>You haven't made any borrow requests</p>
          ) : (
            <div className="space-y-4">
              {outgoingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{request.itemTitle}</CardTitle>
                    <CardDescription>
                      Owner: {request.ownerName} • {new Date(request.createdAt.toMillis()).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={
                        request.status === "pending"
                          ? "outline"
                          : request.status === "approved"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
