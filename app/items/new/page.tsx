"use client"

import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Container, TextField, Button, Typography, Alert, Box, MenuItem } from "@mui/material"
import { useAuth } from "@/lib/auth-context"
import { addItem } from "@/lib/firestore"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"

const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "tools", label: "Tools" },
  { value: "clothing", label: "Clothing" },
  { value: "furniture", label: "Furniture" },
  { value: "books", label: "Books" },
  { value: "other", label: "Other" },
]

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "your-default-key"

export default function NewItemPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validate file type
      if (!selectedFile.type.match('image.*')) {
        setError("Please select an image file (JPEG, PNG, etc.)")
        return
      }
      
      // Validate file size (e.g., 5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size too large (max 5MB)")
        return
      }
      
      setFile(selectedFile)
      setError("")
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string)
        }
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("image", file)
    
    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )
      
      return response.data.data.url
    } catch (err) {
      console.error("Image upload failed:", err)
      throw new Error("Failed to upload image. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to add an item")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      let imageUrl = ""

      if (file) {
        imageUrl = await uploadImage(file)
      }

      await addItem({
        title,
        description: description,
        category,
        price: Number.parseFloat(price),
        ownerId: user.uid,
        ownerName: user.displayName || "Unknown",
        available: true,
        createdAt: new Date(),
        imageUrls: imageUrl ? [imageUrl] : [],
      })

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to add item. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Add New Item
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

        <Box sx={{ mt: 2, mb: 2 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            Upload Image
          </Button>
          
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {file.name}
            </Typography>
          )}
          
          {previewUrl && (
            <Box sx={{ mt: 2 }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </Box>
          )}
        </Box>

        <Button type="submit" fullWidth variant="contained" disabled={isLoading} sx={{ mt: 3 }}>
          {isLoading ? "Adding..." : "Add Item"}
        </Button>
      </Box>
    </Container>
  )
}