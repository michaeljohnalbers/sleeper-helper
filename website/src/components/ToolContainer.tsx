import { Box } from "@mui/material";
import React from "react";
import Home from "./Home";
import { Tools } from "../types/misc";
import ScoringCalculator from "./ScoringCalculator";

interface ToolContainerProps {
  currentTool: Tools;
}

export default function ToolContainer({ currentTool }: ToolContainerProps) {
  let tool = <Home />;
  if (currentTool === Tools.ScoringCalculator) {
    tool = <ScoringCalculator />;
  }

  return (
    <>
      {/* This box takes up the rest of the screen. */}
      <Box sx={{ flexGrow: 1, p: 3 }}>{tool}</Box>
    </>
  );
}
