"use client"

import type React from "react"
import {Navbar} from "@/components/navbar"
import { useEffect, useState } from "react"
import Link from "next/link"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import CircularProgress from "@mui/material/CircularProgress"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Divider from "@mui/material/Divider"
import { useAuth } from "@/lib/auth-context"
import { getItems } from "@/lib/firestore"
import { ItemCard } from "@/components/item-card"
import type { Item } from "@/types"

// Category labels for display
const categoryLabels: Record<string, string> = {
  electronics: "Electronics",
  tools: "Tools",
  clothing: "Clothing",
  furniture: "Furniture",
  books: "Books",
  other: "Other",
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchItems = async () => {
      if (!loading) {
        try {
          setIsLoading(true)
          if (user) {
            const fetchedItems = await getItems()
            setItems(fetchedItems)

            // Extract unique categories from items
            const uniqueCategories = Array.from(new Set(fetchedItems.map((item) => item.category)))
            setCategories(uniqueCategories)
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

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue)
  }

  // Filter items by selected category
  const filteredItems = selectedCategory === "all" ? items : items.filter((item) => item.category === selectedCategory)

  // Group items by category for "all" view
  const itemsByCategory = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, Item[]>,
  )

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
      <Navbar />
      <Box sx={{ mt:7, display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="All Categories" value="all" />
          {categories.map((category) => (
            <Tab key={category} label={categoryLabels[category] || category} value={category} />
          ))}
        </Tabs>
      </Box>
        <Button variant="contained" component={Link} href="/items/new">
          Add New Item
        </Button>
      </Box>

      {/* Category Tabs */}
      

      {items.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" gutterBottom>
            No items available yet
          </Typography>
          <Button variant="contained" component={Link} href="/items/new" sx={{ mt: 2 }}>
            Be the first to add an item
          </Button>
        </Box>
      ) : filteredItems.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" gutterBottom>
            No items in this category
          </Typography>
          <Button variant="contained" component={Link} href="/items/new" sx={{ mt: 2 }}>
            Add an item in this category
          </Button>
        </Box>
      ) : selectedCategory === "all" ? (
        // Display items grouped by category
        <Box>
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <Box key={category} sx={{ mb: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" component="h2" sx={{ textTransform: "capitalize" }}>
                  {categoryLabels[category] || category}
                </Typography>
                <Divider sx={{ flex: 1, ml: 2 }} />
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {categoryItems.map((item) => (
                  <Box key={item.id} sx={{ width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" } }}>
                    <ItemCard item={item} />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        // Display filtered items
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {filteredItems.map((item) => (
            <Box key={item.id} sx={{ width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" } }}>
              <ItemCard item={item} />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  )
}
