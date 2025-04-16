"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { FormControlLabel, Checkbox, Box, Button, CircularProgress, Container, Divider, InputAdornment, Tab, Tabs, TextField, Typography } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { useTheme, useMediaQuery } from "@mui/material"
import { useAuth } from "@/lib/auth-context"
import { getItems } from "@/lib/firestore"
import { ItemCard } from "@/components/item-card"
import type { Item } from "@/types"

const categoryLabels: Record<string, string> = {
  electronics: "Electronics",
  tools: "Tools",
  clothing: "Clothing",
  furniture: "Furniture",
  books: "Books",
  other: "Other",
}

export default function Dashboard() {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"))
  const { user, loading } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [categories, setCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  useEffect(() => {
    const fetchItems = async () => {
      if (!loading) {
        try {
          setIsLoading(true)
          if (user) {
            const fetchedItems = await getItems()
            setItems(fetchedItems)
            const uniqueCategories = Array.from(new Set(fetchedItems.map(item => item.category)))
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase())
  }

  const filteredItems = items
    .filter(item =>
      selectedCategory === "all" ? true : item.category === selectedCategory
    )
    .filter(item =>
      item.title.toLowerCase().includes(searchQuery) ||
      item.description?.toLowerCase().includes(searchQuery)
    )
    .filter(item => (showAvailableOnly ? item.available : true))

  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, Item[]>)

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
    <Container sx={{ py: 4, px: { xs: 1, sm: 2 } }}>
      {/* Tabs, Search, and Add Button */}
      <Box sx={{ mb: 2 }}>
  <Box
    sx={{
      display: "flex",
      flexDirection: isSmallScreen ? "column-reverse" : "row",
      alignItems: isSmallScreen ? "stretch" : "center",
      gap: 2,
    }}
  >
    {/* Tabs Section (3/5 width on large screens) */}
    <Box
  sx={{
    flex: isSmallScreen ? "none" : 3,
    width: "100%",
    overflowX: "auto",
  }}
>
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
    }}
  >
    <Tabs
      value={selectedCategory}
      onChange={handleCategoryChange}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        flexGrow: 1,
        '& .MuiTab-root': {
          minWidth: 'unset',
          padding: isSmallScreen ? '6px 12px' : '12px 16px',
          fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
        },
        '& .MuiTabs-scrollButtons': {
          width: '24px',
          '&.Mui-disabled': {
            opacity: 0.3,
          },
        },
      }}
    >
      <Tab label="All" value="all" />
      {categories.map(category => (
        <Tab
          key={category}
          label={
            isSmallScreen
              ? categoryLabels[category]?.substring(0, 8) || category.substring(0, 8)
              : categoryLabels[category] || category
          }
          value={category}
        />
      ))}
    </Tabs>

    <FormControlLabel
      control={
        <Checkbox
          checked={showAvailableOnly}
          onChange={() => setShowAvailableOnly(prev => !prev)}
          size="small"
        />
      }
      label="Available"
      sx={{
        ml: 2,
        mr: isSmallScreen ? 1 : 2,
        mt: isSmallScreen ? 1 : 0,
        typography: "body2",
        whiteSpace: "nowrap",
      }}
    />
  </Box>
</Box>


    {/* Search and Add Button Section (2/5 width on large screens) */}
    <Box
      sx={{
        flex: isSmallScreen ? "none" : 2,
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        gap: 2,
        alignItems: isSmallScreen ? "stretch" : "center",
        width: "100%",
      }}
    >
      <TextField
        placeholder="Search items..."
        size="small"
        variant="outlined"
        onChange={handleSearchChange}
        fullWidth={isSmallScreen}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
        }}
        sx={{
          flexGrow: 1,
          maxWidth: isSmallScreen ? "100%" : "70%",
          '& .MuiOutlinedInput-root': {
            borderRadius: "40px",
          },
        }}
      />

      <Button
        variant="contained"
        component={Link}
        href="/items/new"
        sx={{
          whiteSpace: "nowrap",
          width: isSmallScreen ? "100%" : "25%",
          flexShrink: 0,
        }}
      >
        Add Item
      </Button>
    </Box>
  </Box>
</Box>


      {/* Main Content */}
    

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
            No items found
          </Typography>
          <Button variant="contained" component={Link} href="/items/new" sx={{ mt: 2 }}>
            Add an item
          </Button>
        </Box>
      ) : selectedCategory === "all" ? (
        <Box>
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => {
            const visibleItems = categoryItems
            .filter(item =>
              item.title.toLowerCase().includes(searchQuery) ||
              item.description?.toLowerCase().includes(searchQuery)
            )
            .filter(item => (showAvailableOnly ? item.available : true))

            if (visibleItems.length === 0) return null

            return (
              <Box key={category} sx={{ mb: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                 <Typography variant="h5" component="h2" sx={{ textTransform: "capitalize" }}>
                    {categoryLabels[category] || category}
                  </Typography>
                  
                  <Divider sx={{ flex: 1, ml: 2 }} />
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {visibleItems.map(item => (
                    <Box
                      key={item.id}
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "calc(50% - 12px)",
                          md: "calc(33.333% - 16px)",
                          lg: "calc(25% - 18px)",
                        },
                      }}
                    >
                      <ItemCard item={item} />
                    </Box>
                  ))}
                </Box>
              </Box>
            )
          })}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {filteredItems.map(item => (
            <Box
              key={item.id}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc(50% - 12px)",
                  md: "calc(33.333% - 16px)",
                  lg: "calc(25% - 18px)",
                },
              }}
            >
              <ItemCard item={item} />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  )
}