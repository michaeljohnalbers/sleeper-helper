/**
 *  Mirrors types in scraper/src/main/.../tools/calculator/model
 */

export interface Player {
  name: string;
  position: string;
  team: string;
  /** Key: Sleeper statistic name, i.e., rush_yd */
  stats: Record<string, number>;
}

/**
 * Top level JSON class
 */
export interface Main {
  /** Key: Sleeper statistic name, i.e., rush_yd */
  league_scoring_settings: Record<string, number>;
  /** Key: Sleeper player ID */
  players: Record<string, Player>;
}
