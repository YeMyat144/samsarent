"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import Avatar from "@mui/material/Avatar"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Divider from "@mui/material/Divider"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import { useAuth } from "@/lib/auth-context"
import { getUserItems, getBorrowRequests } from "@/lib/firestore"
import { ItemCard } from "@/components/item-card"
import type { Item } from "@/types"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0)
  const [listedItems, setListedItems] = useState<Item[]>([])
  const [rentedItems, setRentedItems] = useState<Item[]>([])
  const [swappedItems, setSwappedItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError("")

        // Fetch user's items
        const items = await getUserItems(user.uid)
        setListedItems(items)

        // Fetch borrow requests to determine rented and swapped items
        const requests = await getBorrowRequests(user.uid)

        // Filter for approved borrow requests where user is the borrower (rented)
        const borrowedItemIds = requests
          .filter((req) => req.borrowerId === user.uid && req.status === "approved" && !req.isSwap)
          .map((req) => req.itemId)

        // Filter for approved swap requests where user is involved
        const swapRequests = requests.filter(
          (req) => req.status === "approved" && req.isSwap && (req.borrowerId === user.uid || req.ownerId === user.uid),
        )

        // Get all items involved in swaps
        const swapItemIds = swapRequests.flatMap((req) => [req.itemId, req.swapItemId || ""]).filter((id) => id !== "")

        // Fetch the actual items for rented and swapped
        // Note: In a real app, you'd want to batch these requests or create a server function
        // This is simplified for demonstration
        const rentedItemsPromises = borrowedItemIds.map((id) => getItemById(id))
        const swappedItemsPromises = swapItemIds.map((id) => getItemById(id))

        const fetchedRentedItems = (await Promise.all(rentedItemsPromises)).filter(Boolean) as Item[]
        const fetchedSwappedItems = (await Promise.all(swappedItemsPromises)).filter(Boolean) as Item[]

        setRentedItems(fetchedRentedItems)
        setSwappedItems(fetchedSwappedItems)
      } catch (err: any) {
        console.error("Error fetching user data:", err)
        setError(err.message || "Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  // Helper function to get an item by ID
  const getItemById = async (itemId: string): Promise<Item | null> => {
    try {
      // Import dynamically to avoid circular dependencies
      const { getItem } = await import("@/lib/firestore")
      return await getItem(itemId)
    } catch (error) {
      console.error(`Error fetching item ${itemId}:`, error)
      return null
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Format the date when the user joined
  const formatMemberSince = () => {
    if (!user?.metadata?.creationTime) return "Unknown"

    const creationDate = new Date(user.metadata.creationTime)
    return creationDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
        <Alert severity="info">Please log in to view your profile</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", mb: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "primary.main",
              fontSize: "2.5rem",
              fontWeight: "bold",
              mr: { xs: 0, sm: 4 },
              mb: { xs: 2, sm: 0 },
            }}
          >
            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
          </Avatar>

          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              {user.displayName || "User"}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {formatMemberSince()}
            </Typography>
          </Box>
        </Box>

        
        <Box sx={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", mb: 3 }}>
          <Box sx={{ textAlign: "center", p: 2 }}>
            <Typography variant="h5" color="primary.main">
              {listedItems.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items Listed
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", p: 2 }}>
            <Typography variant="h5" color="primary.main">
              {rentedItems.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items Rented
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", p: 2 }}>
            <Typography variant="h5" color="primary.main">
              {swappedItems.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items Swapped
            </Typography>
          </Box>
        </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "white" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs" centered>
            <Tab label="Listed Items" id="profile-tab-0" />
            <Tab label="Rented Items" id="profile-tab-1" />
            <Tab label="Swapped Items" id="profile-tab-2" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {listedItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                You haven't listed any items yet.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {listedItems.map((item) => (
                <Box key={item.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }, mb: 3 }}>
                  <ItemCard item={item} />
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {rentedItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                You haven't rented any items yet.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {rentedItems.map((item) => (
                <Box key={item.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }, mb: 3 }}>
                  <ItemCard item={item} />
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {swappedItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                You haven't swapped any items yet.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {swappedItems.map((item) => (
                <Box key={item.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }, mb: 3 }}>
                  <ItemCard item={item} />
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>
    </Container>
  )
}