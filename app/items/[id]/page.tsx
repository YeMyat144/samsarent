"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Container from "@mui/material/Container"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import Snackbar from "@mui/material/Snackbar"
import { useAuth } from "@/lib/auth-context"
import { getItem, createBorrowRequest, deleteItem } from "@/lib/firestore"
import type { Item } from "@/types"
import { Navbar } from "@/components/navbar"

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
  const router = useRouter()

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
      showNotification("Request sent successfully! You'll be notified when the owner responds.")
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
      <Navbar />
        <Box sx={{mt:6, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
          {/* Image Section */}
          <Box sx={{ width: { xs: "100%", md: "40%" } }}>
            {item.imageUrl ? (
              <img
                src={item.imageUrl || "/placeholder.svg"}
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
                color={item.available ? "success" : "default"}
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
                <Typography variant="body1">${item.price.toFixed(2)}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button variant="outlined" onClick={() => router.push("/dashboard")}>
                Back to Listings
              </Button>

              {isOwner ? (
                <Button variant="contained" color="error" onClick={handleDeleteItem}>
                  Delete Item
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleBorrowRequest}
                  disabled={!item.available || requestSent || !user}
                >
                  {requestSent
                    ? "Request Sent"
                    : !user
                      ? "Login to Borrow"
                      : !item.available
                        ? "Unavailable"
                        : "Request to Borrow"}
                </Button>
              )}
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
