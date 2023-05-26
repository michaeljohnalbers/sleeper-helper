mod errors;
mod model;
mod sleeper;

pub use crate::model::*;
use crate::sleeper::Sleeper;
use chrono::Datelike;
use std::collections::HashMap;
use std::error::Error;
use std::{env, process};

fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 2 {
        eprintln!("usage: {} [jwt] ", &args[0]);
        eprintln!("  No JWT supplied");
        process::exit(1);
    }

    let jwt = &args[1];
    let year = chrono::Local::now().year();

    let sleeper = Sleeper::new(jwt.to_string(), year)?;
    let rosters = sleeper.roster_details;

    let cap = Cap::new(1300);
    let mut season = Season::new(cap);

    for roster in rosters {
        let owner = Owner::new(roster.owner.as_str());
        let mut team = Team::new(owner);

        for player_details in roster.players {
            let player = Player::new(
                player_details.name.as_str(),
                player_details.active,
                player_details.position.as_str(),
                player_details.team.as_str(),
                player_details.points_scored,
            );

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
