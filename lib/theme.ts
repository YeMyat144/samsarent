"use client"
import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  palette: {
    primary: {
      main: "#c1814f", // softbrown
    },
    secondary: {
      main: "#5f877f", // soft teal-green
    },
    info: {
      main: "#6b3c2e", // deep brownish-red
    },
    error: {
      main: "#fdfaf6", // soft red
    },
    background: {
      default: "#fdfaf6", // light background (can change if needed)
      paper: "#fdfaf6",
    },
    text: {
      primary: "#c1814f", // dark gray
      secondary: "#6b3c2e", // deep brownish-red
    },
    warning: {
      main: "#d6b8a2", // soft beige
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: "none",
        },
      },
    },
  },
})

export default theme
