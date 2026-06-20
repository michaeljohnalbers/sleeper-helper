import React, { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useColorScheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ToolContainer from "./ToolContainer";
import { Tools } from "../types/misc";
import { LEAGUE_NAME } from "../constants/global";
import SettingsMenu from "./MainSettings";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// This has to be a separate function to correctly set light/dark mode.
// Why? I have no idea.
function MainApp() {
  // Light/Dark mode
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return <></>;
  }

  const tools = Object.values(Tools) as Tools[];
  const [currentTool, setCurrentTool] = useState<Tools | null>(Tools.Home);

  /*
   * For hamburger menu in AppBar
   */
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = (tool: Tools): void => {
    setAnchorEl(null);
    setCurrentTool(tool);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {tools.map((tool) => (
              <MenuItem key={tool} onClick={() => handleMenuClose(tool)}>
                <Typography>{tool}</Typography>
              </MenuItem>
            ))}
          </Menu>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {LEAGUE_NAME} Helper
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SettingsMenu colorMode={mode} onColorModeChange={setMode} />
          </Box>
        </Toolbar>
      </AppBar>
      <ToolContainer currentTool={currentTool} />
    </Box>
  );
}

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme} noSsr>
      <CssBaseline /> {/* Necessary to correctly propagate dark/light mode */}
      <MainApp />
    </ThemeProvider>
  );
}
