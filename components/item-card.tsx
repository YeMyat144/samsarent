import Link from "next/link"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import type { Item } from "@/types"

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item.id}`} passHref legacyBehavior>
      <Card
        component="a"
        color="background.light"
        sx={{
          height: "100%",
          width: "90%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
          textDecoration: "none",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: 2,
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 6,
          },
        }}
      >
        {item.imageUrls ? (
          <CardMedia
            component="img"
            sx={{
              height: 180,
              width: "50%",
              margin: "auto",
              objectFit: "cover",
            }}
            image={item.imageUrls[0] || ""}
            alt={item.title}
          />
        ) : (
          <Box
            sx={{
              height: 180,
              bgcolor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No image available
            </Typography>
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary.main" noWrap>
              {item.title}
            </Typography>
            <Chip
              label={item.available ? "Available" : "Unavailable"}
              size="small"
              sx={{
                bgcolor: item.available ? "secondary.main" : "grey.300",
                color: item.available ? "success.contrastText" : "text.secondary",
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Listed by {item.ownerName}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              color: "text.primary",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {item.description}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
              {item.category}
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              ${item.price.toFixed(2)}/day
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  )
}
