import React from "react";
import scoringCalculatorRawData from "../data/scoring-calculator.json";
import { Main } from "../types/scoring_calculator";

const scoringCalculatorData: Main = scoringCalculatorRawData;

// Matches the headings in Sleepers "Scoring Settings" dialog.
enum ScoringCategories {
  Bonus = "Bonus",
  Kicking = "Kicking",
  Misc = "Misc",
  Passing = "Passing",
  Receiving = "Receiving",
  Rushing = "Rushing",
  SpecialTeamsDefense = "Special Teams Defense",
  SpecialTeamsPlayer = "Special Teams Player",
  TeamDefense = "Team Defense",
}

class ScoringStatData {
  category: ScoringCategories;
  humanReadableName: string;

  constructor(category: ScoringCategories, humanReadableName: string) {
    this.category = category;
    this.humanReadableName = humanReadableName;
  }
}

const scoringStatData = new Map<string, ScoringStatData>();
convertScoringStats();

export default function ScoringCalculator() {
  return <>Hi there, scoring calculator here!</>;
}

/**
 * There isn't a good algorithmic way that I can see to convert the stats
 * (i.e., "sack", "fgm_40_49", "pass_int", etc.) to a category and friendly name.
 */
function convertScoringStats() {
  /********************************************************
   * Bonus
   ********************************************************/
  scoringStatData.set(
    "bonus_rec_yd_100",
    new ScoringStatData(ScoringCategories.Bonus, "100-199 Yard Receiving Game"),
  );
  scoringStatData.set(
    "bonus_rush_yd_100",
    new ScoringStatData(ScoringCategories.Bonus, "100-199 Yard Rushing Game"),
  );
  scoringStatData.set(
    "bonus_pass_yd_400",
    new ScoringStatData(ScoringCategories.Bonus, "400+ Yard Passing Game"),
  );
  scoringStatData.set(
    "bonus_pass_yd_300",
    new ScoringStatData(ScoringCategories.Bonus, "300-399 Yard Passing Game"),
  );
  scoringStatData.set(
    "bonus_rec_yd_200",
    new ScoringStatData(ScoringCategories.Bonus, "200+ Yard Receiving Game"),
  );
  scoringStatData.set(
    "bonus_rush_yd_200",
    new ScoringStatData(ScoringCategories.Bonus, "200+ Yard Rushing Game"),
  );

  /********************************************************
   * Kicking
   ********************************************************/
  scoringStatData.set(
    "fgm_40_49",
    new ScoringStatData(ScoringCategories.Kicking, "FG Made (40-49 yards"),
  );
  scoringStatData.set(
    "fgm_30_39",
    new ScoringStatData(ScoringCategories.Kicking, "FG Made (30-39 yards)"),
  );
  scoringStatData.set(
    "xpmiss",
    new ScoringStatData(ScoringCategories.Kicking, "PAT Missed"),
  );
  scoringStatData.set(
    "fgmiss",
    new ScoringStatData(ScoringCategories.Kicking, "FG Missed"),
  );
  scoringStatData.set(
    "fgm_0_19",
    new ScoringStatData(ScoringCategories.Kicking, "FG Made (0-19 yards)"),
  );
  scoringStatData.set(
    "fgm_20_29",
    new ScoringStatData(ScoringCategories.Kicking, "FG Made (20-29 yards)"),
  );
  scoringStatData.set(
    "xpm",
    new ScoringStatData(ScoringCategories.Kicking, "PAT Made"),
  );
  scoringStatData.set(
    "fgm_50p",
    new ScoringStatData(ScoringCategories.Kicking, "FG Made (50+ yards)"),
  );

  /********************************************************
   * Misc
   ********************************************************/
  scoringStatData.set(
    "fum",
    new ScoringStatData(ScoringCategories.Misc, "Fumble"),
  );
  scoringStatData.set(
    "fum_rec_td",
    new ScoringStatData(ScoringCategories.Misc, "Fumble Recovery TD"),
  );
  scoringStatData.set(
    "fum_lost",
    new ScoringStatData(ScoringCategories.Misc, "Fumble Lost"),
  );

  /********************************************************
   * Passing
   ********************************************************/
  scoringStatData.set(
    "pass_int",
    new ScoringStatData(ScoringCategories.Passing, "Pass Intercepted"),
  );
  scoringStatData.set(
    "pass_2pt",
    new ScoringStatData(ScoringCategories.Passing, "2-Pt Conversion"),
  );
  scoringStatData.set(
    "pass_int_td",
    new ScoringStatData(ScoringCategories.Passing, "Pick 6 Thrown"),
  );
  scoringStatData.set(
    "int",
    new ScoringStatData(ScoringCategories.Passing, "Pass Intercepted"),
  );
  // TODO: value is 1 pt / X yards
  scoringStatData.set(
    "pass_yd",
    new ScoringStatData(ScoringCategories.Passing, "Passing Yards"),
  );
  scoringStatData.set(
    "pass_td",
    new ScoringStatData(ScoringCategories.Passing, "Passing TD"),
  );

  /********************************************************
   * Receiving
   ********************************************************/
  scoringStatData.set(
    "bonus_rec_te",
    new ScoringStatData(ScoringCategories.Receiving, "Reception Bonus - TE"),
  );
  scoringStatData.set(
    "rec_td",
    new ScoringStatData(ScoringCategories.Receiving, "Receiving TD"),
  );
  scoringStatData.set(
    "rec_2pt",
    new ScoringStatData(ScoringCategories.Receiving, "2-Pt Conversion"),
  );
  scoringStatData.set(
    "rec",
    new ScoringStatData(ScoringCategories.Receiving, "Reception"),
  );
  scoringStatData.set(
    "rec_fd",
    new ScoringStatData(ScoringCategories.Receiving, "Receiving 1st Down"),
  );
  // TODO: value is 1 pt / X yards
  scoringStatData.set(
    "rec_yd",
    new ScoringStatData(ScoringCategories.Receiving, "Receiving Yards"),
  );

  /********************************************************
   * Rushing
   ********************************************************/
  scoringStatData.set(
    "rush_td",
    new ScoringStatData(ScoringCategories.Rushing, "Rushing TD"),
  );
  scoringStatData.set(
    "rush_fd",
    new ScoringStatData(ScoringCategories.Rushing, "Rushing 1st Down"),
  );
  scoringStatData.set(
    "rush_2pt",
    new ScoringStatData(ScoringCategories.Rushing, "2-Pt Conversion"),
  );
  // TODO: value is 1 pt / X yards
  scoringStatData.set(
    "rush_yd",
    new ScoringStatData(ScoringCategories.Rushing, "Rushing Yards"),
  );

  /********************************************************
   * Special Teams Defense
   ********************************************************/
  scoringStatData.set(
    "def_st_fum_rec",
    new ScoringStatData(
      ScoringCategories.SpecialTeamsDefense,
      "Special Teams Fumble Recovery",
    ),
  );
  scoringStatData.set(
    "def_st_ff",
    new ScoringStatData(
      ScoringCategories.SpecialTeamsDefense,
      "Special Teams Forced Fumble",
    ),
  );
  scoringStatData.set(
    "def_st_td",
    new ScoringStatData(
      ScoringCategories.SpecialTeamsDefense,
      "Special teams td",
    ),
  );

  /********************************************************
   * Special Teams Player
   ********************************************************/
  scoringStatData.set(
    "st_td",
    new ScoringStatData(
      ScoringCategories.SpecialTeamsPlayer,
      "Special teams player td",
    ),
  );
  scoringStatData.set(
    "st_fum_rec",
    new ScoringStatData(
      ScoringCategories.SpecialTeamsPlayer,
      "Special Teams Player Fumble Recovery",
    ),
  );
  scoringStatData.set(
    "st_ff",
    new ScoringStatData(
      ScoringCategories.SpecialTeamsPlayer,
      "Special Teams Player Forced Fumble",
    ),
  );
  // TODO: value is 1 pt / X yards
  scoringStatData.set(
    "pr_yd",
    new ScoringStatData(
      ScoringCategories.SpecialTeamsPlayer,
      "Player Punt Return Yards",
    ),
  );
  // TODO: value is 1 pt / X yards
  scoringStatData.set(
    "kr_yd",
    new ScoringStatData(
      ScoringCategories.SpecialTeamsPlayer,
      "Player Kick Return Yards",
    ),
  );

  /********************************************************
   * Team Defense
   ********************************************************/
  scoringStatData.set(
    "sack",
    new ScoringStatData(ScoringCategories.TeamDefense, "Sacks"),
  );
  scoringStatData.set(
    "def_forced_punts",
    new ScoringStatData(ScoringCategories.TeamDefense, "Forced Pun"),
  );
  scoringStatData.set(
    "pts_allow_0",
    new ScoringStatData(ScoringCategories.TeamDefense, "Points Allowed 0"),
  );
  scoringStatData.set(
    "yds_allow_450_499",
    new ScoringStatData(
      ScoringCategories.TeamDefense,
      "350-499 Total Yards Allowed",
    ),
  );
  scoringStatData.set(
    "yds_allow_400_449",
    new ScoringStatData(
      ScoringCategories.TeamDefense,
      "400-449 Total Yards Allowed",
    ),
  );
  scoringStatData.set(
    "def_4_and_stop",
    new ScoringStatData(ScoringCategories.TeamDefense, "4th Down Stop"),
  );
  scoringStatData.set(
    "yds_allow_550p",
    new ScoringStatData(
      ScoringCategories.TeamDefense,
      "550+ Total Yards Allowed",
    ),
  );
  scoringStatData.set(
    "yds_allow_350_399",
    new ScoringStatData(
      ScoringCategories.TeamDefense,
      "350-399 Total Yards Allowed",
    ),
  );
  scoringStatData.set(
    "ff",
    new ScoringStatData(ScoringCategories.TeamDefense, "Forced Fumble"),
  );
  scoringStatData.set(
    "pts_allow_14_20",
    new ScoringStatData(ScoringCategories.TeamDefense, "Points Allowed 14-20"),
  );
  scoringStatData.set(
    "def_2pt",
    new ScoringStatData(
      ScoringCategories.TeamDefense,
      "2-Pt Conversion Returns",
    ),
  );
  scoringStatData.set(
    "pts_allow_28_34",
    new ScoringStatData(
      ScoringCategories.TeamDefense,
      "Points Allowed (28-34)",
    ),
  );
  scoringStatData.set(
    "pts_allow_35p",
    new ScoringStatData(ScoringCategories.TeamDefense, "Points Allowed (35+)"),
  );
  scoringStatData.set(
    "pts_allow_7_13",
    new ScoringStatData(ScoringCategories.TeamDefense, "Points Allowed (7-13)"),
  );
  scoringStatData.set(
    "pts_allow_1_6",
    new ScoringStatData(ScoringCategories.TeamDefense, "Points Allowed 1-6"),
  );
  scoringStatData.set(
    "yds_allow_500_549",
    new ScoringStatData(
      ScoringCategories.TeamDefense,
      "500-549 Total Yards Allowed",
    ),
  );
  scoringStatData.set(
    "pts_allow_21_27",
    new ScoringStatData(ScoringCategories.TeamDefense, "Points Allowed 21-27"),
  );
  scoringStatData.set(
    "def_3_and_out",
    new ScoringStatData(ScoringCategories.TeamDefense, "3 and Out"),
  );
  scoringStatData.set(
    "tkl_loss",
    new ScoringStatData(ScoringCategories.TeamDefense, "Tackle For Loss"),
  );
  scoringStatData.set(
    "def_td",
    new ScoringStatData(ScoringCategories.TeamDefense, "Defense TD"),
  );
  scoringStatData.set(
    "safe",
    new ScoringStatData(ScoringCategories.TeamDefense, "Safety"),
  );
  scoringStatData.set(
    "blk_kick",
    new ScoringStatData(ScoringCategories.TeamDefense, "Blocked Kick"),
  );
  scoringStatData.set(
    "def_pass_def",
    new ScoringStatData(ScoringCategories.TeamDefense, "Pass Defended"),
  );
  scoringStatData.set(
    "fum_rec",
    new ScoringStatData(ScoringCategories.TeamDefense, "Fumble Recovery"),
  );
}
