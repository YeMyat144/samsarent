"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import { motion } from "framer-motion"
import type { Item } from "@/types"

interface SwapAnimationProps {
  open: boolean
  onClose: () => void
  item1: Item | null
  item2: Item | null
}

export function SwapAnimation({ open, onClose, item1, item2 }: SwapAnimationProps) {
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    if (open) {
      // Reset animation state when dialog opens
      setAnimationComplete(false)
    }
  }, [open])

  // Close dialog after animation completes and a delay
  useEffect(() => {
    if (animationComplete) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000) // 2 second delay after animation completes
      return () => clearTimeout(timer)
    }
  }, [animationComplete, onClose])

  if (!item1 || !item2) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Items Swapped Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The swap has been approved and both items are now unavailable for other users.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 300,
            position: "relative",
            px: 4,
          }}
        >
          {/* First Item */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: ["0%", "110%", "110%", "0%"], zIndex: [1, 2, 2, 1] }}
            transition={{ duration: 2, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
            onAnimationComplete={() => setAnimationComplete(true)}
            style={{ width: "40%", position: "relative" }}
          >
            <ItemCard item={item1} />
          </motion.div>

          {/* Swap Icon */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              bgcolor: "primary.main",
              color: "white",
              borderRadius: "50%",
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            ⇄
          </Box>

          {/* Second Item */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: ["0%", "-110%", "-110%", "0%"], zIndex: [1, 2, 2, 1] }}
            transition={{ duration: 2, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
            style={{ width: "40%", position: "relative" }}
          >
            <ItemCard item={item2} />
          </motion.div>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

// Simple item card for the animation
function ItemCard({ item }: { item: Item }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: 140,
          mb: 2,
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "grey.100",
        }}
      >
        {item.imageUrls ? (
          <img
            src={item.imageUrls?.[0] || "/placeholder.svg"}
            alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No image
            </Typography>
          </Box>
        )}
      </Box>
      <Typography variant="h6" component="h3" gutterBottom noWrap>
        {item.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Owner: {item.ownerName}
      </Typography>
    </Paper>
  )
}
