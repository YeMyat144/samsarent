import Link from "next/link"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Stack from "@mui/material/Stack"

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" fontWeight="bold" mb={3}>
        Rent & Borrow Marketplace
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" mb={3}>
          Welcome to our marketplace where you can rent or borrow items from others in your community.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" component={Link} href="/login">
            Login
          </Button>
          <Button variant="outlined" component={Link} href="/signup">
            Sign Up
          </Button>
        </Stack>
      </Box>
    </Container>
  )
}
