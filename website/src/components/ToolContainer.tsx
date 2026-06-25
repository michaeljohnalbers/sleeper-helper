import Box from "@mui/material/Box";
import React, { Suspense, lazy } from "react";
import Home from "./Home";
import { Tools } from "../types/misc";

interface ToolContainerProps {
  currentTool: Tools;
}

// Code splitting w/ React to reduce bundle size
const ScoringCalculator = lazy(() => import("./ScoringCalculator"));

export default function ToolContainer({ currentTool }: ToolContainerProps) {
  let tool = <Home />;
  if (currentTool === Tools.ScoringCalculator) {
    tool = (
      <Suspense fallback={<div>Loading calculator...</div>}>
        <ScoringCalculator />
      </Suspense>
    );
  }

  return (
    <>
      {/* This box takes up the rest of the screen. */}
      <Box sx={{ flexGrow: 1, p: 3 }}>{tool}</Box>
    </>
  );
}
