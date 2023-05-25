mod model;
mod sleeper;

pub use crate::model::*;
use crate::sleeper::Sleeper;
use chrono::Datelike;
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

    let sleeper = Sleeper::new(jwt.to_string(), year);

    // TODO: include generated-on date for the data

    println!("{:#?}", sleeper.unwrap().roster_details);
    Ok(())
}

/// Just to not have warnings.
fn dummy() -> Result<(), Box<dyn Error>> {
    let cap = Cap::new(1300);
    let mut season = Season::new(cap);

    let owner = Owner::new("1234", "theKekoa");
    let mut team = Team::new(owner);
    team.add_player(Player::new(
        "Christian McCaffrey",
        vec!["RB".to_string()],
        "4000",
        "SF",
    ));
    team.add_player(Player::new(
        "Nick Chubb",
        vec!["RB".to_string()],
        "4001",
        "CLE",
    ));
    season.add_team(team);

    let owner = Owner::new("abcd", "Orange Herbert");
    let mut team = Team::new(owner);
    team.add_player(Player::new(
        "Justin Herbert",
        vec!["QB".to_string()],
        "9",
        "LAC",
    ));
    season.add_team(team);

    let mut seasons = std::collections::HashMap::new();
    seasons.insert("2023", season);

    let json = serde_json::to_string(&seasons)?;
    //println!("{json}");
    Ok(())
}
