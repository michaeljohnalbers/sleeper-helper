import { Box } from "@mui/material";
import React from "react";
import Home from "./Home";
import { Tools } from "../types/misc";

interface ToolContainerProps {
  currentTool: Tools;
}

export default function ToolContainer({ currentTool }: ToolContainerProps) {
  let tool = <Home />;
  if (currentTool === Tools.ScoringCalculator) {
    tool = <div>Placeholder for the calculator!</div>;
  }

  return (
    <>
      <Box sx={{ flexGrow: 1, p: 3 }}>{tool}</Box>
    </>
  );
}
