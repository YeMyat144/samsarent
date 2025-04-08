"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Chip from "@mui/material/Chip"
import CircularProgress from "@mui/material/CircularProgress"
import { useAuth } from "@/lib/auth-context"
import { getBorrowRequests, updateBorrowRequest, updateItemAvailability } from "@/lib/firestore"
import type { BorrowRequest } from "@/types"
import {Navbar} from "@/components/navbar"

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
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
      <Navbar />
      <Typography variant="h4" component="h1" fontWeight="bold" mb={4} mt={7}>
        Borrow Requests
      </Typography>

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
                  Request from {request.borrowerName} • {new Date(request.createdAt.toMillis()).toLocaleDateString()}
                </Typography>

                <Box sx={{ my: 2 }}>
                  <Chip
                    label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    color={
                      request.status === "pending" ? "default" : request.status === "approved" ? "primary" : "error"
                    }
                    size="small"
                  />
                </Box>

                {request.status === "pending" && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                    <Button variant="outlined" onClick={() => handleRequestAction(request.id, "rejected")}>
                      Decline
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleRequestAction(request.id, "approved", request.itemId)}
                    >
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
                  Owner: {request.ownerName} • {new Date(request.createdAt.toMillis()).toLocaleDateString()}
                </Typography>

                <Box sx={{ my: 2 }}>
                  <Chip
                    label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    color={
                      request.status === "pending" ? "default" : request.status === "approved" ? "primary" : "error"
                    }
                    size="small"
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </TabPanel>
    </Container>
  )
}
