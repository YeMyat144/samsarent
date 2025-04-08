import Link from "next/link"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import type { Item } from "@/types"

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Typography variant="h6" component="h2">
            {item.title}
          </Typography>
          <Chip
            label={item.available ? "Available" : "Unavailable"}
            color={item.available ? "primary" : "default"}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Listed by {item.ownerName}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            mb: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.description}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {item.category}
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            ${item.price.toFixed(2)}/day
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button component={Link} href={`/items/${item.id}`} variant="contained" fullWidth>
          View Details
        </Button>
      </CardActions>
    </Card>
  )
}
