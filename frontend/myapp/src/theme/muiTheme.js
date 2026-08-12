import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#B8925A",
      light: "#D4B382",
      dark: "#9E7B47",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#6B6862",
      light: "#8D8A83",
      dark: "#4A4843",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FAF9F6",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1C1B19",
      secondary: "#6B6862",
    },
    divider: "#E7E4DD",
    success: {
      main: "#3E7A55",
    },
    error: {
      main: "#B3413B",
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: {
      fontFamily: '"Roboto", Georgia, serif',
      fontWeight: 600,
      color: "#1C1B19",
    },
    h2: {
      fontFamily: '"Roboto", Georgia, serif',
      fontWeight: 600,
      color: "#1C1B19",
    },
    h3: {
      fontFamily: '"Roboto", Georgia, serif',
      fontWeight: 600,
      color: "#1C1B19",
    },
    h4: {
      fontFamily: '"Roboto", Georgia, serif',
      fontWeight: 600,
      color: "#1C1B19",
    },
    h5: {
      fontFamily: '"Roboto", Georgia, serif',
      fontWeight: 600,
      color: "#1C1B19",
    },
    h6: {
      fontFamily: '"Roboto", Georgia, serif',
      fontWeight: 600,
      color: "#1C1B19",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
      fontFamily: '"Inter", sans-serif',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "none",
          padding: "8px 20px",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(184, 146, 90, 0.25)",
          },
        },
        containedPrimary: {
          backgroundColor: "#B8925A",
          "&:hover": {
            backgroundColor: "#9E7B47",
          },
        },
        outlinedPrimary: {
          borderColor: "#B8925A",
          color: "#B8925A",
          "&:hover": {
            borderColor: "#9E7B47",
            backgroundColor: "rgba(184, 146, 90, 0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          borderColor: "#E7E4DD",
          boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E7E4DD",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B8925A",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B8925A",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 20px 40px -8px rgba(28, 27, 25, 0.12)",
        },
      },
    },
  },
});

export default muiTheme;
