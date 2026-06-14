import React, { useState } from "react";
import {
  AppBar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ToolContainer from "./ToolContainer";
import { Tools } from "../types/misc";
import { LEAGUE_NAME } from "../constants/global";

export default function App() {
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
    <>
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
          </Toolbar>
        </AppBar>
        <ToolContainer currentTool={currentTool} />
      </Box>
    </>
  );
}
