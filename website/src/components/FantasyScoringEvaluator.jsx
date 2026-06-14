import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Button,
  Stack,
  Alert,
  AlertTitle,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UndoIcon from "@mui/icons-material/Undo";
import TuneIcon from "@mui/icons-material/Tune";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// ─── Static data ────────────────────────────────────────────────────────────

const SCORING_SECTIONS = [
  {
    id: "passing",
    label: "Passing",
    settings: [
      { stat: "pass_yd", label: "Passing yards", unit: "/ yd", step: 0.01 },
      { stat: "pass_td", label: "Passing TDs", unit: "/ TD", step: 0.5 },
      { stat: "int", label: "Interceptions", unit: "/ INT", step: 0.5 },
      { stat: "pass_300", label: "300+ yd bonus", unit: "bonus", step: 0.5 },
    ],
  },
  {
    id: "rushing",
    label: "Rushing",
    settings: [
      { stat: "rush_yd", label: "Rushing yards", unit: "/ yd", step: 0.01 },
      { stat: "rush_td", label: "Rushing TDs", unit: "/ TD", step: 0.5 },
      { stat: "rush_100", label: "100+ yd bonus", unit: "bonus", step: 0.5 },
    ],
  },
  {
    id: "receiving",
    label: "Receiving",
    settings: [
      { stat: "rec_yd", label: "Receiving yards", unit: "/ yd", step: 0.01 },
      { stat: "rec", label: "Receptions (PPR)", unit: "/ rec", step: 0.5 },
      { stat: "rec_td", label: "Receiving TDs", unit: "/ TD", step: 0.5 },
      { stat: "rec_100", label: "100+ yd bonus", unit: "bonus", step: 0.5 },
    ],
  },
  {
    id: "misc",
    label: "Misc",
    settings: [
      { stat: "fum", label: "Fumbles lost", unit: "/ fum", step: 0.5 },
      { stat: "two_pt", label: "2-pt conversions", unit: "/ conv", step: 0.5 },
    ],
  },
];

const DEFAULT_SCORING = {
  pass_yd: 0.04,
  pass_td: 4,
  int: -2,
  pass_300: 3,
  rush_yd: 0.1,
  rush_td: 6,
  rush_100: 3,
  rec_yd: 0.1,
  rec: 1,
  rec_td: 6,
  rec_100: 3,
  fum: -2,
  two_pt: 2,
};

const PLAYERS = [
  {
    name: "Lamar Jackson",
    team: "BAL",
    pos: "QB",
    stats: {
      pass_yd: 312,
      pass_td: 3,
      int: 0,
      rush_yd: 54,
      rush_td: 1,
      rec: 0,
      rec_yd: 0,
      rec_td: 0,
      fum: 0,
      two_pt: 0,
      pass_300: 1,
      rush_100: 0,
      rec_100: 0,
    },
  },
  {
    name: "Christian McCaffrey",
    team: "SF",
    pos: "RB",
    stats: {
      pass_yd: 0,
      pass_td: 0,
      int: 0,
      rush_yd: 128,
      rush_td: 2,
      rec: 7,
      rec_yd: 64,
      rec_td: 0,
      fum: 0,
      two_pt: 0,
      pass_300: 0,
      rush_100: 1,
      rec_100: 0,
    },
  },
  {
    name: "Tyreek Hill",
    team: "MIA",
    pos: "WR",
    stats: {
      pass_yd: 0,
      pass_td: 0,
      int: 0,
      rush_yd: 0,
      rush_td: 0,
      rec: 9,
      rec_yd: 143,
      rec_td: 1,
      fum: 0,
      two_pt: 0,
      pass_300: 0,
      rush_100: 0,
      rec_100: 1,
    },
  },
  {
    name: "Travis Kelce",
    team: "KC",
    pos: "TE",
    stats: {
      pass_yd: 0,
      pass_td: 0,
      int: 0,
      rush_yd: 0,
      rush_td: 0,
      rec: 8,
      rec_yd: 92,
      rec_td: 1,
      fum: 0,
      two_pt: 0,
      pass_300: 0,
      rush_100: 0,
      rec_100: 0,
    },
  },
  {
    name: "Josh Allen",
    team: "BUF",
    pos: "QB",
    stats: {
      pass_yd: 287,
      pass_td: 2,
      int: 1,
      rush_yd: 42,
      rush_td: 1,
      rec: 0,
      rec_yd: 0,
      rec_td: 0,
      fum: 0,
      two_pt: 0,
      pass_300: 0,
      rush_100: 0,
      rec_100: 0,
    },
  },
  {
    name: "Davante Adams",
    team: "LV",
    pos: "WR",
    stats: {
      pass_yd: 0,
      pass_td: 0,
      int: 0,
      rush_yd: 0,
      rush_td: 0,
      rec: 10,
      rec_yd: 118,
      rec_td: 1,
      fum: 0,
      two_pt: 0,
      pass_300: 0,
      rush_100: 0,
      rec_100: 1,
    },
  },
  {
    name: "Derrick Henry",
    team: "TEN",
    pos: "RB",
    stats: {
      pass_yd: 0,
      pass_td: 0,
      int: 0,
      rush_yd: 137,
      rush_td: 1,
      rec: 2,
      rec_yd: 14,
      rec_td: 0,
      fum: 0,
      two_pt: 0,
      pass_300: 0,
      rush_100: 1,
      rec_100: 0,
    },
  },
  {
    name: "Justin Jefferson",
    team: "MIN",
    pos: "WR",
    stats: {
      pass_yd: 0,
      pass_td: 0,
      int: 0,
      rush_yd: 0,
      rush_td: 0,
      rec: 7,
      rec_yd: 104,
      rec_td: 1,
      fum: 0,
      two_pt: 0,
      pass_300: 0,
      rush_100: 0,
      rec_100: 1,
    },
  },
  {
    name: "Stefon Diggs",
    team: "BUF",
    pos: "WR",
    stats: {
      pass_yd: 0,
      pass_td: 0,
      int: 0,
      rush_yd: 0,
      rush_td: 0,
      rec: 8,
      rec_yd: 87,
      rec_td: 0,
      fum: 0,
      two_pt: 1,
      pass_300: 0,
      rush_100: 0,
      rec_100: 0,
    },
  },
  {
    name: "Nick Chubb",
    team: "CLE",
    pos: "RB",
    stats: {
      pass_yd: 0,
      pass_td: 0,
      int: 0,
      rush_yd: 94,
      rush_td: 1,
      rec: 3,
      rec_yd: 22,
      rec_td: 0,
      fum: 0,
      two_pt: 0,
      pass_300: 0,
      rush_100: 0,
      rec_100: 0,
    },
  },
  {
    name: "Sam LaPorta",
    team: "DET",
    pos: "TE",
    stats: {
      pass_yd: 0,
      pass_td: 0,
      int: 0,
      rush_yd: 0,
      rush_td: 0,
      rec: 6,
      rec_yd: 71,
      rec_td: 1,
      fum: 0,
      two_pt: 0,
      pass_300: 0,
      rush_100: 0,
      rec_100: 0,
    },
  },
  {
    name: "Austin Ekeler",
    team: "LAC",
    pos: "RB",
    stats: {
      pass_yd: 0,
      pass_td: 0,
      int: 0,
      rush_yd: 61,
      rush_td: 0,
      rec: 6,
      rec_yd: 48,
      rec_td: 1,
      fum: 0,
      two_pt: 0,
      pass_300: 0,
      rush_100: 0,
      rec_100: 0,
    },
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcPts(stats, scoring) {
  return Object.keys(scoring).reduce(
    (sum, key) => sum + (stats[key] ?? 0) * scoring[key],
    0,
  );
}

function fmtVal(v) {
  const n = parseFloat(v);
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DeltaChip({ delta }) {
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

function PosChip({ pos }) {
  const colorMap = {
    QB: "primary",
    RB: "success",
    WR: "secondary",
    TE: "warning",
  };
  return (
    <Chip
      label={pos}
      size="small"
      color={colorMap[pos] ?? "default"}
      variant="outlined"
      sx={{ fontWeight: 600, minWidth: 40 }}
    />
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function FantasyScoringEvaluator() {
  const [baseline] = useState({ ...DEFAULT_SCORING });
  const [scoring, setScoring] = useState({ ...DEFAULT_SCORING });
  const [lockedBaseline, setLockedBaseline] = useState({ ...DEFAULT_SCORING });
  const [activePosSet, setActivePosSet] = useState(["QB", "RB", "WR", "TE"]);
  const [sortCol, setSortCol] = useState("after");
  const [baselineLocked, setBaselineLocked] = useState(false);

  // Which stats differ from the locked baseline
  const changedStats = Object.keys(scoring).filter(
    (k) => Math.abs(scoring[k] - lockedBaseline[k]) > 0.0001,
  );

  const handleInput = useCallback((stat, value) => {
    setScoring((prev) => ({ ...prev, [stat]: parseFloat(value) || 0 }));
  }, []);

  const handleRevert = useCallback(
    (stat) => {
      setScoring((prev) => ({ ...prev, [stat]: lockedBaseline[stat] }));
    },
    [lockedBaseline],
  );

  const handleResetAll = () => setScoring({ ...lockedBaseline });

  const handleSetBaseline = () => {
    setLockedBaseline({ ...scoring });
    setBaselineLocked(true);
    setTimeout(() => setBaselineLocked(false), 1800);
  };

  const handlePosToggle = (_, newVal) => {
    if (newVal.length === 0) return;
    setActivePosSet(newVal);
  };

  // Build leaderboard rows
  const rows = PLAYERS.filter((p) => activePosSet.includes(p.pos))
    .map((p) => ({
      ...p,
      before: calcPts(p.stats, lockedBaseline),
      after: calcPts(p.stats, scoring),
      delta: calcPts(p.stats, scoring) - calcPts(p.stats, lockedBaseline),
    }))
    .sort((a, b) =>
      sortCol === "after"
        ? b.after - a.after
        : sortCol === "before"
          ? b.before - a.before
          : b.delta - a.delta,
    );

  // Changes summary grouped by section
  const changeSummary = SCORING_SECTIONS.flatMap((sec) =>
    sec.settings
      .filter((s) => changedStats.includes(s.stat))
      .map((s) => ({
        label: s.label,
        from: lockedBaseline[s.stat],
        to: scoring[s.stat],
      })),
  );

  return (
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
          <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
            Scoring settings
          </Typography>
          {changedStats.length > 0 && (
            <Chip
              label={`${changedStats.length} changed`}
              size="small"
              color="warning"
            />
          )}
        </Box>

        {/* Scrollable settings */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {SCORING_SECTIONS.map((section) => {
            const sectionChanged = section.settings.filter((s) =>
              changedStats.includes(s.stat),
            ).length;
            return (
              <Accordion
                key={section.id}
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
                    <Typography variant="body2" fontWeight={600}>
                      {section.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {section.settings.length} settings
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
                  {section.settings.map((s) => {
                    const isChanged = changedStats.includes(s.stat);
                    return (
                      <Box
                        key={s.stat}
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
                          color={isChanged ? "warning.dark" : "text.secondary"}
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
                            {fmtVal(lockedBaseline[s.stat])}
                          </Typography>
                        )}
                        <TextField
                          size="small"
                          type="number"
                          value={scoring[s.stat]}
                          onChange={(e) => handleInput(s.stat, e.target.value)}
                          inputProps={{
                            step: s.step,
                            style: {
                              textAlign: "right",
                              width: 56,
                              padding: "4px 6px",
                              fontWeight: isChanged ? 600 : 400,
                            },
                          }}
                          sx={{
                            width: 72,
                            "& .MuiOutlinedInput-root": isChanged
                              ? {
                                  "& fieldset": { borderColor: "warning.main" },
                                }
                              : {},
                          }}
                        />
                        <Typography
                          variant="caption"
                          color={isChanged ? "warning.main" : "text.disabled"}
                          sx={{ minWidth: 32 }}
                        >
                          {s.unit}
                        </Typography>
                        <Tooltip title="Revert to baseline">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleRevert(s.stat)}
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
                    fontWeight={600}
                    color="warning.dark"
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
            disabled={changedStats.length === 0}
          >
            Reset all
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            size="small"
            variant="contained"
            onClick={handleSetBaseline}
            color={baselineLocked ? "success" : "primary"}
          >
            {baselineLocked ? "Baseline set ✓" : "Set as baseline"}
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
            <Typography variant="subtitle1" fontWeight={600}>
              Player leaderboard
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
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
                      <Typography variant="body2" fontWeight={600}>
                        {p.name}
                      </Typography>
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
                        fontFamily="monospace"
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
                        fontWeight={600}
                        fontFamily="monospace"
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
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
