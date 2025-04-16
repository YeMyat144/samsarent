"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Box, Button, Container, CircularProgress, Typography, Paper, Tabs, Tab, Chip, Snackbar, Alert  } from "@mui/material"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import DialogContentText from "@mui/material/DialogContentText"
import TextField from "@mui/material/TextField"
import FormControlLabel from "@mui/material/FormControlLabel"
import Checkbox from "@mui/material/Checkbox"
import { useAuth } from "@/lib/auth-context"
import { getBorrowRequests, updateBorrowRequest, updateItemAvailability, getItem } from "@/lib/firestore"
import type { BorrowRequest, Item } from "@/types"
import { useChat} from "@/lib/chat-context"
import ChatIcon from "@mui/icons-material/Chat"
import { useRouter } from "next/navigation"
import { SwapAnimation } from "@/components/swap-animation"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function RequestsPage() {
  const [incomingRequests, setIncomingRequests] = useState<BorrowRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<BorrowRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; request: BorrowRequest | null }>({
    open: false,
    request: null,
  })
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [deliveryDateTime, setDeliveryDateTime] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [paymentRequired, setPaymentRequired] = useState(false)
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  })
  const [swapAnimation, setSwapAnimation] = useState<{
    open: boolean
    item1: Item | null
    item2: Item | null
  }>({
    open: false,
    item1: null,
    item2: null,
  }) 
  const { user } = useAuth()
  const { startNewConversation } = useChat()
  const router = useRouter()

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

  const handleRequestAction = async (request: BorrowRequest, status: "approved" | "rejected") => {
    try {
      if (status === "approved") {
        // Open the approval dialog to get delivery information
        setApprovalDialog({ open: true, request })
        // Reset form fields
        setDeliveryLocation("")
        setDeliveryDateTime("")
        setAdditionalInfo("")
        setPaymentRequired(false)
      } else {
        // Directly reject the request
        await updateBorrowRequest(request.id, status)

        // Update local state
        setIncomingRequests((prev) => prev.map((req) => (req.id === request.id ? { ...req, status } : req)))

        showNotification("Request rejected successfully", "success")
      }
    } catch (error: any) {
      console.error("Error updating request:", error)
      showNotification(error.message || "Failed to process request", "error")
    }
  }

  const handleApproveWithDelivery = async () => {
    if (!approvalDialog.request) return
  
    // Validate required fields
    if (!deliveryLocation.trim() || !deliveryDateTime.trim()) {
      showNotification("Please fill in both location and day/time fields", "error")
      return
    }
  
    try {
      // Format the delivery message
      const deliveryMessage = `I will deliver at ${deliveryLocation} on ${deliveryDateTime}.${
        additionalInfo ? `\n\nAdditional information: ${additionalInfo}` : ""
      }`
  
      const request = approvalDialog.request
      const isSwapRequest = request.isSwap === true
  
      // Update the request with delivery information
      await updateBorrowRequest(request.id, "approved", deliveryMessage, isSwapRequest ? false : paymentRequired)
  
      // Update item availability - make the requested item unavailable
      await updateItemAvailability(request.itemId, false)
  
      // If it's a swap, also update the swap item's availability
      // if (isSwapRequest && request.swapItemId) {
      //   await updateItemAvailability(request.swapItemId, false)
      // }
      let item1 = null
      let item2 = null
      
            if (isSwapRequest && request.swapItemId) {
              // Fetch both items for the animation
              item1 = await getItem(request.itemId)
              item2 = await getItem(request.swapItemId)
      
              // Update item availability - make both items unavailable
              await updateItemAvailability(request.itemId, false)
              await updateItemAvailability(request.swapItemId, false)
      
              // Show swap animation
              if (item1 && item2) {
                setSwapAnimation({
                  open: true,
                  item1,
                  item2,
                })
              }
            } else {
              // Just update the requested item's availability
              await updateItemAvailability(request.itemId, false)
            }
  
      // Update local state
      setIncomingRequests((prev) =>
        prev.map((req) =>
          req.id === request.id
            ? {
                ...req,
                status: "approved",
                deliveryMessage,
                paymentRequired: isSwapRequest ? false : paymentRequired,
              }
            : req
        )
      )
  
      // Close the dialog and reset form
      setApprovalDialog({ open: false, request: null })
      setDeliveryLocation("")
      setDeliveryDateTime("")
      setAdditionalInfo("")
      setPaymentRequired(false)
      
      if (!isSwapRequest || !item1 || !item2) {
        showNotification(
        isSwapRequest
          ? "Swap request approved successfully! The other user has been notified."
          : "Request approved successfully! The borrower has been notified.",
        "success"
      )
    }
    } catch (error: any) {
      console.error("Error approving request:", error)
      showNotification(error.message || "Failed to approve request", "error")
    }
  }

  const handleStartChat = async (request: BorrowRequest) => {
    if (!user) return
  
    try {
  // Determine the other user's ID and name
  const otherUserId = user.uid === request.ownerId ? request.borrowerId : request.ownerId
  const otherUserName = user.uid === request.ownerId ? request.borrowerName : request.ownerName
  
  const conversationId = await startNewConversation(otherUserId, otherUserName, request.itemId, request.itemTitle)
  
  // Navigate to the chat page with the conversation ID
  router.push(`/chat?id=${conversationId}`)
    } catch (err: any) {
  showNotification(err.message || "Failed to start conversation", "error")
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const closeApprovalDialog = () => {
    setApprovalDialog({ open: false, request: null })
    setDeliveryLocation("")
    setDeliveryDateTime("")
    setAdditionalInfo("")
    setPaymentRequired(false)
  }

  const showNotification = (message: string, severity: "success" | "error") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  const closeNotification = () => {
    setNotification({ ...notification, open: false })
  }

  const handleCloseSwapAnimation = () => {
    setSwapAnimation({
      open: false,
      item1: null,
      item2: null,
    })

    // Show success notification after animation closes
    showNotification("Swap request approved successfully! Both users have been notified.", "success")
  }


  if (isLoading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Please login to view your requests</Typography>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="request tabs">
          <Tab label={`Incoming Requests (${incomingRequests.length})`} id="tab-0" />
          <Tab label={`Your Requests (${outgoingRequests.length})`} id="tab-1" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {incomingRequests.length === 0 ? (
          <Typography>No incoming requests</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {incomingRequests.map((request) => (
              <Paper key={request.id} elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6">{request.itemTitle}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Request from {request.borrowerName} • {request.createdAt instanceof Date ? request.createdAt.toLocaleDateString() : new Date(request.createdAt.toMillis()).toLocaleDateString()}
                </Typography>

                <Box sx={{ my: 2, display: "flex", gap: 1, alignItems: "center" }}>
                  <Chip
                    label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    color={
                      request.status === "pending" ? "default" : request.status === "approved" ? "primary" : "error"
                    }
                    size="small"
                  />
                  {request.isSwap && <Chip label="Swap Request" color="secondary" size="small" />}
                </Box>

                {request.isSwap && (
                  <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: "rgba(241, 196, 15, 0.1)", borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Swap Details:
                    </Typography>
                    <Typography variant="body2">
                      {request.borrowerName} wants to swap their <strong>{request.swapItemTitle}</strong> with your{" "}
                      <strong>{request.itemTitle}</strong> for <strong>{request.swapDuration} days</strong>.
                    </Typography>
                  </Box>
                )}

                {request.status === "approved" && request.deliveryMessage && (
                  <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: "rgba(25, 118, 210, 0.08)", borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Delivery Information:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                      {request.deliveryMessage}
                    </Typography>
                    {request.paymentRequired && !request.isSwap && (
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: "medium" }}>
                        Payment will be required upon delivery.
                      </Typography>
                    )}
                  </Box>
                )}

                {request.status === "pending" && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                    <Button variant="outlined" onClick={() => handleRequestAction(request, "rejected")}>
                      Decline
                    </Button>
                    <Button variant="contained" onClick={() => handleRequestAction(request, "approved")}>
                      Approve
                    </Button>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {outgoingRequests.length === 0 ? (
          <Typography>You haven't made any borrow requests</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {outgoingRequests.map((request) => (
              <Paper key={request.id} elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6">{request.itemTitle}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Owner: {request.ownerName} • {request.createdAt instanceof Date ? request.createdAt.toLocaleDateString() : new Date(request.createdAt.toMillis()).toLocaleDateString()}
                </Typography>

                <Box sx={{ my: 2, display: "flex", gap: 1, alignItems: "center" }}>
                  <Chip
                    label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    color={
                      request.status === "pending" ? "default" : request.status === "approved" ? "primary" : "error"
                    }
                    size="small"
                  />
                  {request.isSwap && <Chip label="Swap Request" color="secondary" size="small" />}
                </Box>

                {request.isSwap && (
                  <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: "rgba(241, 196, 15, 0.1)", borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Swap Details:
                    </Typography>
                    <Typography variant="body2">
                      You offered to swap your <strong>{request.swapItemTitle}</strong> with {request.ownerName}'s{" "}
                      <strong>{request.itemTitle}</strong> for <strong>{request.swapDuration} days</strong>.
                    </Typography>
                  </Box>
                )}

                {request.status === "approved" && request.deliveryMessage && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(25, 118, 210, 0.08)", borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Delivery Information:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                      {request.deliveryMessage}
                    </Typography>
                    {request.paymentRequired && !request.isSwap && (
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: "medium" }}>
                        Payment will be required upon delivery.
                      </Typography>
                    )}
                  </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button variant="outlined" startIcon={<ChatIcon />} onClick={() => handleStartChat(request)}>
                    Message Owner
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </TabPanel>

      {/* Approval Dialog with Structured Form */}
      <Dialog open={approvalDialog.open} onClose={closeApprovalDialog} fullWidth maxWidth="sm">
        <DialogTitle>Approve Request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {approvalDialog.request?.isSwap
              ? `Please provide delivery information for the swap with ${approvalDialog.request?.borrowerName}. This will be sent as a notification when you approve the request.`
              : `Please provide delivery information for ${approvalDialog.request?.borrowerName}. This will be sent as a notification when you approve the request.`}
          </DialogContentText>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              autoFocus
              required
              margin="dense"
              id="deliveryLocation"
              label="Delivery Location"
              fullWidth
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="e.g., Coffee shop on Main Street, Your address, etc."
            />

            <TextField
              required
              margin="dense"
              id="deliveryDateTime"
              label="Day and Time"
              fullWidth
              value={deliveryDateTime}
              onChange={(e) => setDeliveryDateTime(e.target.value)}
              placeholder="e.g., Saturday at 2:00 PM, Tomorrow at noon, etc."
            />

            <TextField
              margin="dense"
              id="additionalInfo"
              label="Additional Information (Optional)"
              fullWidth
              multiline
              rows={2}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any other details the borrower should know"
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Preview:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                {deliveryLocation && deliveryDateTime
                  ? `I will deliver at ${deliveryLocation} on ${deliveryDateTime}.${
                      additionalInfo ? `\n\nAdditional information: ${additionalInfo}` : ""
                    }`
                  : "Please fill in the location and day/time fields to see preview."}
              </Typography>
            </Paper>
          </Box>

          {!approvalDialog.request?.isSwap && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={paymentRequired}
                  onChange={(e) => setPaymentRequired(e.target.checked)}
                  name="paymentRequired"
                />
              }
              label="Payment required upon delivery"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeApprovalDialog}>Cancel</Button>
          <Button
            onClick={handleApproveWithDelivery}
            variant="contained"
            color="primary"
            disabled={!deliveryLocation.trim() || !deliveryDateTime.trim()}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Swap Animation Dialog */}
      <SwapAnimation
        open={swapAnimation.open}
        onClose={handleCloseSwapAnimation}
        item1={swapAnimation.item1}
        item2={swapAnimation.item2}
      />


      {/* Notification Snackbar */}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={closeNotification}>
        <Alert onClose={closeNotification} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
