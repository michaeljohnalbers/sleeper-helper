import { Main } from "../types/scoring_calculator";
import scoringCalculatorRawData from "../data/scoring-calculator.json";

const scoringCalculatorData: Main = scoringCalculatorRawData;
const leagueScoringSettings = scoringCalculatorData.league_scoring_settings;

export {
  ScoringStatData,
  ScoringCategories,
  getScoringCategories,
  getScoringSettings,
};

function getScoringCategories(): ScoringCategory[] {
  return scoringCategories;
}

function getScoringSettings(): Map<string, number> {
  return new Map<string, number>(Object.entries(leagueScoringSettings));
}

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

class ScoringCategory {
  category: ScoringCategories;
  scoringStatData: ScoringStatData[];

  constructor(category: ScoringCategories, scoringStatData: ScoringStatData[]) {
    this.category = category;
    this.scoringStatData = scoringStatData;
  }
}

class ScoringStatData {
  label: string;
  isPointsPerYard: boolean;
  statKey: string;
  step: number;

  constructor(
    statKey: string,
    label: string,
    step: number = 1,
    // Accounts for stats like points per passing yard, etc.
    isPointsPerYard: boolean = false,
  ) {
    this.label = label;
    this.isPointsPerYard = isPointsPerYard;
    this.statKey = statKey;
    this.step = step;
  }
}

/**
 * The order of the items in the arrays in this function directly affects
 * the order in which they are displayed.
 */
function buildScoringStatData(): ScoringCategory[] {
  /********************************************************
   * Bonus
   ********************************************************/
  let bonus = new ScoringCategory(ScoringCategories.Bonus, [
    new ScoringStatData("bonus_rec_yd_100", "100-199 Yard Receiving Game"),
    new ScoringStatData("bonus_rush_yd_100", "100-199 Yard Rushing Game"),
    new ScoringStatData("bonus_pass_yd_400", "400+ Yard Passing Game"),
    new ScoringStatData("bonus_pass_yd_300", "300-399 Yard Passing Game"),
    new ScoringStatData("bonus_rec_yd_200", "200+ Yard Receiving Game"),
    new ScoringStatData("bonus_rush_yd_200", "200+ Yard Rushing Game"),
  ]);

  /********************************************************
   * Kicking
   ********************************************************/
  let kicking = new ScoringCategory(ScoringCategories.Kicking, [
    new ScoringStatData("fgm_0_19", "FG Made (0-19 yards)"),
    new ScoringStatData("fgm_20_29", "FG Made (20-29 yards)"),
    new ScoringStatData("fgm_30_39", "FG Made (30-39 yards)"),
    new ScoringStatData("fgm_40_49", "FG Made (40-49 yards"),
    new ScoringStatData("fgm_50p", "FG Made (50+ yards)"),
    new ScoringStatData("xpm", "PAT Made"),
    new ScoringStatData("xpmiss", "PAT Missed"),
    new ScoringStatData("fgmiss", "FG Missed"),
  ]);

  /********************************************************
   * Misc
   ********************************************************/
  let misc = new ScoringCategory(ScoringCategories.Misc, [
    new ScoringStatData("fum", "Fumble"),
    new ScoringStatData("fum_lost", "Fumble Lost"),
    new ScoringStatData("fum_rec_td", "Fumble Recovery TD"),
  ]);

  /********************************************************
   * Passing
   ********************************************************/
  let passing = new ScoringCategory(ScoringCategories.Passing, [
    new ScoringStatData("pass_yd", "Passing Yards", 0.01, true),
    new ScoringStatData("pass_td", "Passing TD"),
    new ScoringStatData("pass_2pt", "2-Pt Conversion"),
    new ScoringStatData("pass_int", "Pass Intercepted"),
    new ScoringStatData("pass_int_td", "Pick 6 Thrown"),
  ]);

  /********************************************************
   * Receiving
   ********************************************************/
  let receiving = new ScoringCategory(ScoringCategories.Receiving, [
    new ScoringStatData("rec", "Reception"),
    new ScoringStatData("rec_yd", "Receiving Yards", 0.1, true),
    new ScoringStatData("rec_td", "Receiving TD"),
    new ScoringStatData("rec_2pt", "2-Pt Conversion"),
    new ScoringStatData("rec_fd", "Receiving 1st Down", 0.05),
    new ScoringStatData("bonus_rec_te", "Reception Bonus - TE", 0.1),
  ]);

  /********************************************************
   * Rushing
   ********************************************************/
  let rushing = new ScoringCategory(ScoringCategories.Rushing, [
    new ScoringStatData("rush_yd", "Rushing Yards", 0.1, true),
    new ScoringStatData("rush_td", "Rushing TD"),
    new ScoringStatData("rush_2pt", "2-Pt Conversion"),
    new ScoringStatData("rush_fd", "Rushing 1st Down", 0.05),
  ]);

  /********************************************************
   * Special Teams Defense
   ********************************************************/
  let std = new ScoringCategory(ScoringCategories.SpecialTeamsDefense, [
    new ScoringStatData("def_st_td", "Special teams td"),
    new ScoringStatData("def_st_ff", "Special Teams Forced Fumble"),
    new ScoringStatData("def_st_fum_rec", "Special Teams Fumble Recovery"),
  ]);

  /********************************************************
   * Special Teams Player
   ********************************************************/
  let stp = new ScoringCategory(ScoringCategories.SpecialTeamsPlayer, [
    new ScoringStatData("st_td", "Special teams player td"),
    new ScoringStatData("st_ff", "Special Teams Player Forced Fumble"),
    new ScoringStatData("st_fum_rec", "Special Teams Player Fumble Recovery"),
    new ScoringStatData("pr_yd", "Player Punt Return Yards", 0.1, true),
    new ScoringStatData("kr_yd", "Player Kick Return Yards", 0.1, true),
  ]);

  /********************************************************
   * Team Defense
   ********************************************************/
  let defense = new ScoringCategory(ScoringCategories.TeamDefense, [
    new ScoringStatData("pts_allow_0", "Points Allowed 0"),
    new ScoringStatData("pts_allow_1_6", "Points Allowed 1-6"),
    new ScoringStatData("pts_allow_7_13", "Points Allowed (7-13)"),
    new ScoringStatData("pts_allow_14_20", "Points Allowed 14-20"),
    new ScoringStatData("pts_allow_21_27", "Points Allowed 21-27"),
    new ScoringStatData("pts_allow_28_34", "Points Allowed (28-34)"),
    new ScoringStatData("pts_allow_35p", "Points Allowed (35+)"),
    new ScoringStatData("yds_allow_350_399", "350-399 Total Yards Allowed"),
    new ScoringStatData("yds_allow_400_449", "400-449 Total Yards Allowed"),
    new ScoringStatData("yds_allow_450_499", "350-499 Total Yards Allowed"),
    new ScoringStatData("yds_allow_500_549", "500-549 Total Yards Allowed"),
    new ScoringStatData("yds_allow_550p", "550+ Total Yards Allowed"),
    new ScoringStatData("def_td", "Defense TD"),
    new ScoringStatData("def_2pt", "2-Pt Conversion Returns"),
    new ScoringStatData("safe", "Safety"),
    new ScoringStatData("sack", "Sacks"),
    new ScoringStatData("tkl_loss", "Tackle For Loss"),
    new ScoringStatData("int", "Pass Intercepted"),
    new ScoringStatData("def_pass_def", "Pass Defended", 0.1),
    new ScoringStatData("def_forced_punts", "Forced Punt", 0.1),
    new ScoringStatData("def_3_and_out", "3 and Out"),
    new ScoringStatData("def_4_and_stop", "4th Down Stop"),
    new ScoringStatData("ff", "Forced Fumble"),
    new ScoringStatData("fum_rec", "Fumble Recovery"),
    new ScoringStatData("blk_kick", "Blocked Kick"),
  ]);

  return [passing, rushing, receiving, kicking, defense, std, stp, misc, bonus];
}

/**
 * There isn't a good algorithmic way that I can see to convert the stats
 * (i.e., "sack", "fgm_40_49", "pass_int", etc.) to a category and friendly name.
 */
const scoringCategories = buildScoringStatData();
