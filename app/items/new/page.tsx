"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Container from "@mui/material/Container"
import Alert from "@mui/material/Alert"
import MenuItem from "@mui/material/MenuItem"
import { useAuth } from "@/lib/auth-context"
import { addItem } from "@/lib/firestore"
import { Navbar } from "@/components/navbar"

const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "tools", label: "Tools" },
  { value: "clothing", label: "Clothing" },
  { value: "furniture", label: "Furniture" },
  { value: "books", label: "Books" },
  { value: "other", label: "Other" },
]

export default function NewItemPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to add an item")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await addItem({
        title,
        description,
        category,
        price: Number.parseFloat(price),
        ownerId: user.uid,
        ownerName: user.displayName || "Unknown",
        available: true,
        createdAt: new Date(),
      })

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to add item. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Navbar />
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Add New Item
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          List an item for others to rent or borrow
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={4}
            id="description"
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            select
            margin="normal"
            required
            fullWidth
            id="category"
            label="Category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="normal"
            required
            fullWidth
            id="price"
            label="Daily Price ($)"
            name="price"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <Button type="submit" fullWidth variant="contained" disabled={isLoading} sx={{ mt: 3 }}>
            {isLoading ? "Adding..." : "Add Item"}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
