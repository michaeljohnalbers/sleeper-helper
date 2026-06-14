import React, { useState, useCallback } from "react";
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
  getScoringCategories,
  getScoringSettings,
} from "../utils/scoring_helper";

// ─── Helpers ────────────────────────────────────────────────────────────────

// function calcPts(stats, scoring) {
//   return Object.keys(scoring).reduce(
//     (sum, key) => sum + (stats[key] ?? 0) * scoring[key],
//     0,
//   );
// }

function fmtVal(v: number) {
  const n = v; //parseFloat(v);
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
  const colorMap = {
    QB: "primary",
    RB: "success",
    WR: "secondary",
    TE: "warning",
  };
  // @ts-ignore
  return (
    <Chip
      label={pos}
      size="small"
      //color={colorMap[pos] ?? "default"}
      color={"default"} // TODO: here
      variant="outlined"
      sx={{ fontWeight: 600, minWidth: 40 }}
    />
  );
}

const SCORING_CATEGORIES = getScoringCategories();
const DEFAULT_SCORING_SETTINGS = getScoringSettings();

// ─── Main component ──────────────────────────────────────────────────────────

export default function ScoringCalculator() {
  const [scoring, setScoring] = useState<Map<string, number>>(
    DEFAULT_SCORING_SETTINGS,
  );
  const [changedStats, setChangedStats] = useState<Set<string>>(
    new Set<string>(),
  );

  const [activePosSet, setActivePosSet] = useState<string[]>([
    "QB",
    "RB",
    "WR",
    "TE",
  ]);
  const [sortCol, setSortCol] = useState("after");

  const handleInput = useCallback((stat: string, value: string) => {
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
  }, []);

  const handleRevert = useCallback((stat: string) => {
    setScoring((prev) => {
      const newState = new Map<string, number>(prev);
      newState.set(stat, DEFAULT_SCORING_SETTINGS.get(stat));
      return newState;
    });
    setChangedStats((prev) => {
      const newState = new Set<string>(prev);
      newState.delete(stat);
      return newState;
    });
  }, []);

  const handleResetAll = () => {
    setScoring(DEFAULT_SCORING_SETTINGS);
    setChangedStats(new Set<string>());
  };

  const handlePosToggle = (_: any, newVal: string[]) => {
    if (newVal.length === 0) return;
    setActivePosSet(newVal);
  };

  // Changes summary grouped by section
  const changeSummary = SCORING_CATEGORIES.flatMap((category) =>
    category.scoringStatData
      .filter((s) => changedStats.has(s.statKey))
      .map((s) => ({
        label: s.label,
        from: DEFAULT_SCORING_SETTINGS.get(s.statKey),
        to: scoring.get(s.statKey),
      })),
  );

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          height: "100vh",
          overflow: "hidden",
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
            {SCORING_CATEGORIES.map((category) => {
              const sectionChanged = category.scoringStatData.filter((s) =>
                changedStats.has(s.statKey),
              ).length;
              return (
                <Accordion
                  key={category.category}
                  defaultExpanded
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
                              {fmtVal(DEFAULT_SCORING_SETTINGS.get(s.statKey))}
                            </Typography>
                          )}
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
                          <Tooltip title="Revert to baseline">
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
                {["QB", "RB", "WR", "TE"].map((pos) => (
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

          {/* Table */}
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
              {/* TODO: uncomment
              <TableBody>
                {rows.length === 0 ? (
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
                  rows.map((p, i) => (
                    <TableRow key={p.name} hover>
                      <TableCell sx={{ color: "text.disabled", fontSize: 12 }}>
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{fontWeight: 600}}>{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.team}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <PosChip pos={p.pos} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          //fontFamily="monospace" // TODO: here
                        >
                          {p.before.toFixed(1)}
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
                          sx = {{
                            fontWeight: 600
                            fontFamily: "monospace"
                          }}
                        >
                          {p.after.toFixed(1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <DeltaChip delta={p.delta} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              */}
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  );
}

function calculatePlayerPoints(playerStats: Record<string, number>): number {
  let points = 0;
  (Object.entries(playerStats) as [string, number][]).forEach(
    ([stat, statValue]) => {
      let scoringSetting = 0.0; // scoringSettings.get(stat);
      if (scoringSetting === undefined) {
        alert(
          "Scoring stat not found in settings: " +
            stat +
            ". Tell Michael he missed something...or Sleeper broke it.",
        );
      } else {
        points += statValue * scoringSetting; // TODO: need to adjust this to match what Sleeper does, see old code
      }
    },
  );
  return points;
}
