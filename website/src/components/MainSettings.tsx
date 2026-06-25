import React from "react";
import { useState } from "react";
import type { MouseEvent } from "react";
import {
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import BrightnessMedium from "@mui/icons-material/BrightnessMedium";
import SettingsIcon from "@mui/icons-material/Settings";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CheckIcon from "@mui/icons-material/Check";

// ─── Types ──────────────────────────────────────────────────────────────────

type ColorMode = "light" | "dark" | "system" | undefined;

interface SettingsMenuProps {
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode | null) => void;
}

// ─── Settings menu ──────────────────────────────────────────────────────────

export default function SettingsMenu({
  colorMode,
  onColorModeChange,
}: SettingsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelectMode = (mode: ColorMode) => {
    onColorModeChange(mode);
    handleClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        aria-label="Open settings menu"
      >
        <SettingsIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {/* ── Appearance ── */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 2, pt: 0.5, pb: 0.5, display: "block" }}
        >
          Appearance
        </Typography>

        <MenuItem
          selected={colorMode === "light"}
          onClick={() => handleSelectMode("light")}
        >
          <ListItemIcon>
            <LightModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Light mode</ListItemText>
          {colorMode === "light" && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>

        <MenuItem
          selected={colorMode === "dark"}
          onClick={() => handleSelectMode("dark")}
        >
          <ListItemIcon>
            <DarkModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dark mode</ListItemText>
          {colorMode === "dark" && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>

        <MenuItem
          selected={colorMode === "system"}
          onClick={() => handleSelectMode("system")}
        >
          <ListItemIcon>
            <BrightnessMedium fontSize="small" />
          </ListItemIcon>
          <ListItemText>System</ListItemText>
          {colorMode === "system" && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>

        {/* ── Add future setting categories below ──
        <Divider sx={{ my: 0.5 }} />
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, pt: 0.5, pb: 0.5, display: "block" }}>
          Notifications
        </Typography>
        <MenuItem onClick={...}>
          <ListItemIcon><NotificationsIcon fontSize="small" /></ListItemIcon>
          <ListItemText>...</ListItemText>
        </MenuItem>
        */}
      </Menu>
    </>
  );
}
