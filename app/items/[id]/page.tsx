"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Box, Button, Container, Typography, CircularProgress, Alert, Snackbar, Chip, Divider } from "@mui/material"
import { useAuth } from "@/lib/auth-context"
import { getItem, createBorrowRequest, deleteItem } from "@/lib/firestore"
import type { Item } from "@/types"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import Switch from "@mui/material/Switch"
import FormControlLabel from "@mui/material/FormControlLabel"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useChat } from "@/lib/chat-context"
import ChatIcon from "@mui/icons-material/Chat"

export default function ItemDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<Item | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [requestSent, setRequestSent] = useState(false)
  const [notification, setNotification] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  })
  const { user } = useAuth()
  const { startNewConversation } = useChat()
  const router = useRouter()

  const [isSwapMode, setIsSwapMode] = useState(false)
  const [swapItemId, setSwapItemId] = useState("")
  const [swapDuration, setSwapDuration] = useState(7)
  const [userItems, setUserItems] = useState<Item[]>([])

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true)
        const fetchedItem = await getItem(params.id as string)
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

  const fetchUserItems = async (userId: string) => {
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
      console.error("Error fetching user items:", error)
      return []
    }
  }

  useEffect(() => {
    const fetchUserItemsData = async () => {
      if (user) {
        try {
          const items = await fetchUserItems(user.uid)
          setUserItems(items)
        } catch (error) {
          console.error("Error fetching user items:", error)
        }
      }
    }

    fetchUserItemsData()
  }, [user])

  const handleBorrowRequest = async () => {
    if (!user || !item) return

    try {
      // Create the base request object
      const requestData: any = {
        itemId: item.id,
        itemTitle: item.title,
        borrowerId: user.uid,
        borrowerName: user.displayName || "Unknown",
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        status: "pending",
        createdAt: new Date(),
      }

      // Add swap-related fields only if in swap mode
      if (isSwapMode && swapItemId) {
        const swapItem = userItems.find((item) => item.id === swapItemId)
        requestData.isSwap = true
        requestData.swapItemId = swapItemId
        requestData.swapItemTitle = swapItem ? swapItem.title : "Unknown Item"
        requestData.swapDuration = swapDuration
      }

      await createBorrowRequest(requestData)

      setRequestSent(true)
      showNotification(
        `${isSwapMode ? "Swap" : "Borrow"} request sent successfully! You'll be notified when the owner responds.`,
      )
    } catch (err: any) {
      setError(err.message || "Failed to send request")
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

  const handleStartChat = async () => {
    if (!user || !item) return

    try {
      // Don't allow messaging yourself
      if (user.uid === item.ownerId) {
        showNotification("You can't message yourself")
        return
      }

      const conversationId = await startNewConversation(item.ownerId, item.ownerName, item.id, item.title)

      // Navigate to the chat page with the conversation ID
      router.push(`/chat?id=${conversationId}`)
    } catch (err: any) {
      setError(err.message || "Failed to start conversation")
    }
  }

  const showNotification = (message: string) => {
    setNotification({
      open: true,
      message,
    })
  }

  const closeNotification = () => {
    setNotification({ ...notification, open: false })
  }

  if (isLoading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  if (!item) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Item not found</Typography>
      </Container>
    )
  }

  const isOwner = user && user.uid === item.ownerId

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
          {/* Image Section */}
          <Box sx={{ width: { xs: "100%", md: "40%" } }}>
            {item.imageUrls ? (
              <img
                src={(Array.isArray(item.imageUrls) && item.imageUrls.length > 0 ? item.imageUrls[0] : "/placeholder.svg")}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "300px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
                onError={(e) => {
                  // Replace with a placeholder if image fails to load
                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=400"
                  ;(e.target as HTMLImageElement).alt = "Image not available"
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "250px",
                  bgcolor: "grey.100",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No image available
                </Typography>
              </Box>
            )}
          </Box>

          {/* Details Section */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Listed by {item.ownerName}
                </Typography>
              </Box>
              <Chip
                label={item.available ? "Available" : "Unavailable"}
                color={item.available ? "primary" : "default"}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1">{item.description}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Category
                </Typography>
                <Typography variant="body1" sx={{ textTransform: "capitalize" }}>
                  {item.category}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Daily Price
                </Typography>
                <Typography variant="body1">${item.price}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
              <Box sx={{ flex: 1, display: "flex", alignItems: "flex-start" }}>
              <Button variant="outlined" onClick={() => router.push("/dashboard")}>
                Back
              </Button>
              </Box>

              <Box sx={{ flex: 1 }}>
              {isOwner ? (
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" color="primary" onClick={handleDeleteItem}>
                  Delete Item
                </Button>
                </Box>
              ) : (
                <Box>
                  {user && (
                    <Button
                      variant="outlined"
                      startIcon={<ChatIcon />}
                      onClick={handleStartChat}
                      sx={{ mb: 2, width: "100%" }}
                    >
                      Message {item.ownerName}
                    </Button>
                 )}
                  
                  <FormControlLabel
                    control={
                      <Switch checked={isSwapMode} onChange={(e) => setIsSwapMode(e.target.checked)} color="primary" />
                    }
                    label="Swap instead of borrow"
                  />

                  {isSwapMode && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="swap-item-label">Item to Swap</InputLabel>
                        <Select
                          labelId="swap-item-label"
                          value={swapItemId}
                          label="Item to Swap"
                          onChange={(e) => setSwapItemId(e.target.value)}
                          required
                        >
                          {userItems.length === 0 ? (
                            <MenuItem disabled value="">
                              You don't have any items to swap
                            </MenuItem>
                          ) : (
                            userItems.map((item) => (
                              <MenuItem key={item.id} value={item.id}>
                                {item.title}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel id="swap-duration-label">Swap Duration (days)</InputLabel>
                        <Select
                          labelId="swap-duration-label"
                          value={swapDuration}
                          label="Swap Duration (days)"
                          onChange={(e) => setSwapDuration(Number(e.target.value))}
                        >
                          <MenuItem value={3}>3 days</MenuItem>
                          <MenuItem value={7}>1 week</MenuItem>
                          <MenuItem value={14}>2 weeks</MenuItem>
                          <MenuItem value={30}>1 month</MenuItem>
                        </Select>
                      </FormControl>
                      
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    onClick={handleBorrowRequest}
                    disabled={!item.available || requestSent || !user || (isSwapMode && !swapItemId)}
                    fullWidth
                  >
                    {requestSent
                      ? "Request Sent"
                      : !user
                        ? "Login to Borrow"
                        : !item.available
                          ? "Unavailable"
                          : isSwapMode
                            ? "Request to Swap"
                            : "Request to Borrow"}
                  </Button>
                  
                </Box>
              )}
              </Box>
            </Box>
          </Box>
        </Box>

      {/* Notification Snackbar */}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={closeNotification}>
        <Alert onClose={closeNotification} severity="success" sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
