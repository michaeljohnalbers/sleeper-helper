mod errors;
mod fantasypros;
mod model;
mod sleeper;

use crate::fantasypros::{FantasyPros, PlayerRank};
pub use crate::model::*;
use crate::sleeper::{PlayerDetails, Sleeper};
use chrono::Datelike;
use std::collections::HashMap;
use std::error::Error;
use std::{env, process};

fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 3 {
        print_help(&args[0]);
        process::exit(1);
    }

    let jwt = &args[1];
    let api_key = &args[2];
    let year = chrono::Local::now().year();

    let sleeper = Sleeper::new(jwt.to_string(), year)?;
    let rosters = sleeper.roster_details;

    let player_rankings = FantasyPros::new(api_key.to_string(), year)?;

    let cap = Cap::new(1300);
    let mut season = Season::new(cap);

    let league_size = rosters.len() as i32;
    for roster in rosters {
        let owner = Owner::new(roster.owner.as_str());
        let mut team = Team::new(owner);

        for player_details in roster.players {
            let player_round_cost = get_draft_round_cost(
                &player_rankings,
                &player_details,
                league_size,
                sleeper.roster_size,
            )?;

            let mut player = Player::new(
                player_details.name.as_str(),
                player_details.active,
                player_details.position.as_str(),
                player_details.team.as_str(),
                player_details.points_scored,
            );
            player.set_draft_round_cost(player_round_cost);

            team.add_player(player);
        }
        season.add_team(team);
    }

    let mut seasons = HashMap::new();
    seasons.insert(year.to_string(), season);
    let json = serde_json::to_string(&seasons)?;
    println!("{json}");

    Ok(())
}

fn get_draft_round_cost(
    player_rankings: &FantasyPros,
    player_details: &PlayerDetails,
    number_teams: i32,
    roster_size: i32,
) -> Result<i32, Box<dyn Error>> {
    const MAX_RANK: i32 = 9999;
    let mut final_player_rank = MAX_RANK;
    for ii in 0..player_rankings.superflex_rankings.players.len() {
        let player_rank = player_rankings.superflex_rankings.players.get(ii).unwrap();
        if player_details.yahoo_id == player_rank.player_yahoo_id.parse::<i32>()? {
            final_player_rank = player_rank.rank_ecr;
            break;
        }

        if player_probably_equal(player_rank, player_details) {
            final_player_rank = player_rank.rank_ecr
        }
    }

    // Fantasy Pros doesn't include K or DEF in their superflex rankings. But we still want some
    // round cost for them. So as a compromise these positions will use overall rankings. There
    // shouldn't be too much impact to this as these positions aren't valued and will likely end
    // end up costing last/last round picks.
    if final_player_rank == MAX_RANK {
        for ii in 0..player_rankings.overall_rankings.players.len() {
            let player_rank = player_rankings.overall_rankings.players.get(ii).unwrap();
            if player_details.yahoo_id == player_rank.player_yahoo_id.parse::<i32>()? {
                final_player_rank = player_rank.rank_ecr;
                break;
            }

            if player_probably_equal(player_rank, player_details) {
                final_player_rank = player_rank.rank_ecr
            }
        }
    }

    if final_player_rank == MAX_RANK {
        // Fantasy Pros just doesn't have rankings for some players. When this was being
        // developed initially, neither Tom Brady (newly retired) or Jarrett Stidham (no clue why)
        // had no rankings.
        eprintln!("WARNING: No ranking found for {:?}", player_details);
        return Ok(roster_size);
    }

    let mut round_cost = ((final_player_rank as f32) / (number_teams as f32)).ceil() as i32;
    if round_cost > roster_size {
        round_cost = roster_size;
    }

    Ok(round_cost)
}

fn player_probably_equal(player_rank: &PlayerRank, player_details: &PlayerDetails) -> bool {
    // Fantasy Pros uses the full name of a player ("Patrick Mahomes II") whereas Sleeper
    // doesn't bother with any suffixes ("Patrick Mahomes").
    // Fantasy Pros used "DST" whereas Sleeper used "DEF".
    player_rank
        .player_name
        .contains(player_details.name.as_str())
        && (player_rank.player_position_id == player_details.position
            || player_details.position == "DEF" && player_rank.player_position_id == "DST")
}

fn print_help(exe: &str) {
    eprintln!("usage: {exe} [Sleeper JWT] [FantasyPros API Key]");
    eprintln!("  No Sleeper JWT or FantasyPros API Key supplied");
    let jwt_help = "  To get the Sleeper JWT, open sleeper.com, filter network traffic \
for 'graphql' then grap Authorization header value.";
    eprintln!("{jwt_help}");
    let apikey_help = "  To get the Fantasy Pros API Key, open fantasypros.com, go to NFL \
rankings, select non-default scoring or position value, filter network traffic for 'consensus' then \
grab x-api-key header value.";
    eprintln!("{apikey_help}");
}
