import React, { useState, useCallback, useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UndoIcon from "@mui/icons-material/Undo";
import TuneIcon from "@mui/icons-material/Tune";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  calculatePlayerPoints,
  ScoringCalculatorData,
} from "../utils/scoring_calculator_helper";
import { Main } from "../types/scoring_calculator";

// ─── Misc ─────────────────────────────────────────────────────────
let scoringCalculatorData: ScoringCalculatorData = null;

const supportedPositions = ["QB", "RB", "WR", "TE", "K", "DEF"];

function fmtVal(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DeltaChip({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.05)
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  const positive = delta > 0;
  return (
    <Chip
      label={`${positive ? "+" : ""}${delta.toFixed(1)}`}
      size="small"
      color={positive ? "success" : "error"}
      variant="outlined"
      sx={{ fontWeight: 600, minWidth: 60 }}
    />
  );
}

function PosChip({ pos }: { pos: string }) {
  const colorMap = new Map<string, any>([
    ["QB", "primary"],
    ["RB", "success"],
    ["WR", "secondary"],
    ["TE", "warning"],
  ]);
  return (
    <Chip
      label={pos}
      size="small"
      color={colorMap.get(pos) ?? "default"}
      variant="outlined"
      sx={{ fontWeight: 600, minWidth: 40 }}
    />
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ScoringCalculator() {
  const [scoring, setScoring] = useState<Map<string, number> | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);
  const [jsonLoadError, setJsonLoadError] = useState<string | null>(null);
  const [changedStats, setChangedStats] = useState<Set<string>>(
    new Set<string>(),
  );

  const [activePosSet, setActivePosSet] =
    useState<string[]>(supportedPositions);
  const [sortCol, setSortCol] = useState("after");

  const handleInput = useCallback(
    (stat: string, value: string) => {
      let valueAsNumber: number = parseFloat(value) || 0;

      setScoring((prev) => {
        const newState = new Map<string, number>(prev);
        newState.set(stat, valueAsNumber);
        return newState;
      });

      setChangedStats((prev) => {
        const newState = new Set<string>(prev);
        if (Math.abs(valueAsNumber - scoring.get(stat)) > 0.0001) {
          newState.add(stat);
        } else {
          // For if the value is changed back to the default.
          newState.delete(stat);
        }
        return newState;
      });
    },
    [scoring],
  );

  const handleRevert = useCallback((stat: string) => {
    setScoring((prev) => {
      const newState = new Map<string, number>(prev);
      newState.set(stat, scoringCalculatorData.getScoringSettings().get(stat));
      return newState;
    });
    setChangedStats((prev) => {
      const newState = new Set<string>(prev);
      newState.delete(stat);
      return newState;
    });
  }, []);

  const handleResetAll = () => {
    setScoring(scoringCalculatorData.getScoringSettings());
    setChangedStats(new Set<string>());
  };

  const handlePosToggle = (_: any, newVal: string[]) => {
    setActivePosSet(newVal);
  };

  // This gets downloaded twice in dev because of <StrictMode> in index.tsx.
  // Claude says it doesn't harm anything and won't happen in prod.
  useEffect(() => {
    console.log("Downloading JSON");
    fetch("scoring-calculator.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((json: Main) => {
        scoringCalculatorData = new ScoringCalculatorData(json);
        console.log(
          "JSON downloaded, setting scoring: " +
            scoringCalculatorData.getScoringSettings(),
        );
        setScoring(scoringCalculatorData.getScoringSettings());
      })
      .catch((err) => setJsonLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading calculator data...</div>;
  }

  if (jsonLoadError) {
    alert("Error loading data: " + jsonLoadError);
  }

  // Changes summary grouped by section
  const changeSummary = scoringCalculatorData
    .getScoringCategories()
    .flatMap((category) =>
      category.scoringStatData
        .filter((s) => changedStats.has(s.statKey))
        .map((s) => ({
          label: s.label,
          from: scoringCalculatorData.getScoringSettings().get(s.statKey),
          to: scoring.get(s.statKey),
        })),
    );

  // Build leaderboard rows
  const playerRows = [...scoringCalculatorData.getPlayers().values()]
    .filter((p) => activePosSet.includes(p.position))
    .map((p) => {
      const beforePoints = calculatePlayerPoints(
        p.stats,
        scoringCalculatorData.getScoringSettings(),
      );
      const afterPoints = calculatePlayerPoints(p.stats, scoring);
      return {
        ...p,
        before: beforePoints,
        after: afterPoints,
        delta: afterPoints - beforePoints,
      };
    })
    .sort((a, b) =>
      sortCol === "after"
        ? b.after - a.after
        : sortCol === "before"
          ? b.before - a.before
          : b.delta - a.delta,
    );

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          height: "100vh",
          /* hack for mobile, otherwise this won't show up (via Claude) */
          minWidth: 800,
        }}
      >
        {/* ── Left panel ── */}
        <Paper
          square
          elevation={2}
          sx={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TuneIcon fontSize="small" color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
              Scoring settings
            </Typography>
            {changedStats.size > 0 && (
              <Chip
                label={`${changedStats.size} changed`}
                size="small"
                color="warning"
              />
            )}
          </Box>

          {/* Scrollable settings */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {scoringCalculatorData.getScoringCategories().map((category) => {
              const sectionChanged = category.scoringStatData.filter((s) =>
                changedStats.has(s.statKey),
              ).length;
              return (
                <Accordion
                  key={category.category}
                  disableGutters
                  elevation={0}
                  sx={{
                    "&:before": { display: "none" },
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flex: 1,
                        mr: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {category.category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {category.scoringStatData.length} settings
                      </Typography>
                      {sectionChanged > 0 && (
                        <Chip
                          label={`${sectionChanged} changed`}
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ height: 18, fontSize: 10, ml: "auto" }}
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1 }}>
                    {category.scoringStatData.map((s) => {
                      const isChanged = changedStats.has(s.statKey);
                      return (
                        <Box
                          key={s.statKey}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1,
                            py: 0.75,
                            borderRadius: 1,
                            bgcolor: isChanged ? "warning.50" : "transparent",
                            border: "1px solid",
                            borderColor: isChanged
                              ? "warning.300"
                              : "transparent",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ flex: 1 }}
                            color={
                              isChanged ? "warning.dark" : "text.secondary"
                            }
                          >
                            {s.label}
                          </Typography>
                          {isChanged && (
                            <Typography
                              variant="caption"
                              color="warning.main"
                              sx={{
                                textDecoration: "line-through",
                                minWidth: 28,
                                textAlign: "right",
                              }}
                            >
                              {fmtVal(
                                scoringCalculatorData
                                  .getScoringSettings()
                                  .get(s.statKey),
                              )}
                            </Typography>
                          )}
                          <Tooltip
                            title={
                              s.isPointsPerYard
                                ? "1 point per " +
                                  1.0 / scoring.get(s.statKey) +
                                  " yds"
                                : undefined
                            }
                          >
                            <TextField
                              size="small"
                              type="number"
                              value={scoring.get(s.statKey)}
                              onChange={(e) =>
                                handleInput(s.statKey, e.target.value)
                              }
                              slotProps={{
                                htmlInput: {
                                  step: s.step,
                                  fontWeight: isChanged ? 600 : 400,
                                },
                              }}
                              sx={{
                                width: 82,
                                "& .MuiOutlinedInput-root": isChanged
                                  ? {
                                      "& fieldset": {
                                        borderColor: "warning.main",
                                      },
                                    }
                                  : {},
                              }}
                            />
                          </Tooltip>
                          <Tooltip
                            title={isChanged ? "Revert to baseline" : undefined}
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleRevert(s.statKey)}
                                disabled={!isChanged}
                                color={isChanged ? "warning" : "default"}
                                sx={{ opacity: isChanged ? 1 : 0 }}
                              >
                                <UndoIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>

          {/* Changes summary */}
          {changeSummary.length > 0 && (
            <Box
              sx={{
                borderTop: 1,
                borderColor: "divider",
                px: 2,
                py: 1.5,
                bgcolor: "action.hover",
              }}
            >
              <Alert severity="warning" variant="outlined" sx={{ py: 0.5 }}>
                <AlertTitle sx={{ fontSize: 12, mb: 0.5 }}>
                  {changeSummary.length} change
                  {changeSummary.length !== 1 ? "s" : ""} from baseline
                </AlertTitle>
                {changeSummary.map((c) => (
                  <Box
                    key={c.label}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.25,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ flex: 1 }}
                    >
                      {c.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        textDecoration: "line-through",
                        color: "text.disabled",
                      }}
                    >
                      {fmtVal(c.from)}
                    </Typography>
                    <ArrowForwardIcon
                      sx={{ fontSize: 11, color: "text.disabled" }}
                    />
                    <Typography
                      variant="caption"
                      color="warning.dark"
                      sx={{ fontWeight: 600 }}
                    >
                      {fmtVal(c.to)}
                    </Typography>
                  </Box>
                ))}
              </Alert>
            </Box>
          )}

          {/* Footer */}
          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              gap: 1,
            }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={handleResetAll}
              disabled={changedStats.size === 0}
            >
              Reset all
            </Button>
          </Box>
        </Paper>

        {/* ── Right panel ── */}
        <Box
          sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          {/* Header */}
          <Paper
            square
            elevation={1}
            sx={{
              px: 2.5,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EmojiEventsIcon fontSize="small" color="action" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Player leaderboard
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <ToggleButtonGroup
                value={activePosSet}
                onChange={handlePosToggle}
                size="small"
                aria-label="position filter"
              >
                {supportedPositions.map((pos) => (
                  <ToggleButton
                    key={pos}
                    value={pos}
                    sx={{ px: 1.5, fontWeight: 600, fontSize: 11 }}
                  >
                    {pos}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Divider orientation="vertical" flexItem />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortCol}
                  label="Sort by"
                  onChange={(e) => setSortCol(e.target.value)}
                >
                  <MenuItem value="after">New points</MenuItem>
                  <MenuItem value="before">Original points</MenuItem>
                  <MenuItem value="delta">Biggest change</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Player Table */}
          <TableContainer sx={{ flex: 1, overflow: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 36 }}>#</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell sx={{ width: 60 }}>Pos</TableCell>
                  <TableCell align="right" sx={{ width: 90 }}>
                    Original
                  </TableCell>
                  <TableCell sx={{ width: 24 }} />
                  <TableCell align="right" sx={{ width: 80 }}>
                    New pts
                  </TableCell>
                  <TableCell align="right" sx={{ width: 90 }}>
                    Change
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playerRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 6, color: "text.disabled" }}
                    >
                      No positions selected
                    </TableCell>
                  </TableRow>
                ) : (
                  playerRows.map((p, i) => (
                    <TableRow key={p.name} hover>
                      <TableCell sx={{ color: "text.disabled", fontSize: 12 }}>
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.team}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <PosChip pos={p.position} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {p.before.toFixed(0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <ArrowForwardIcon
                          sx={{ fontSize: 14, color: "text.disabled" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontFamily: "monospace",
                          }}
                        >
                          {/* Sleeper's season total for a player only uses ints */}
                          {p.after.toFixed(0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <DeltaChip delta={p.delta} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  );
}
