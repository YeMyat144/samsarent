"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import CircularProgress from "@mui/material/CircularProgress"
import { useAuth } from "@/lib/auth-context"
import { getItems } from "@/lib/firestore"
import { ItemCard } from "@/components/item-card"
import type { Item } from "@/types"
import {Navbar} from "@/components/navbar"

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
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchItems()
  }, [user, loading])

  if (loading || isLoading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="body1" gutterBottom>
          Please login to view this page
        </Typography>
        <Button variant="contained" component={Link} href="/login" sx={{ mt: 2 }}>
          Login
        </Button>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }}>
      <Navbar/>
      <Box sx={{ mt:7, display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Available Items
        </Typography>
        <Button variant="contained" component={Link} href="/items/new">
          Add New Item
        </Button>
      </Box>

      {items.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" gutterBottom>
            No items available yet
          </Typography>
          <Button variant="contained" component={Link} href="/items/new" sx={{ mt: 2 }}>
            Be the first to add an item
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {items.map((item) => (
            <Box key={item.id} sx={{ width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" } }}>
              <ItemCard item={item} />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  )
}
