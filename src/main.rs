mod model;
mod sleeper;

pub use crate::model::*;
pub use crate::sleeper::get_player_list;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
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

    sleeper::get_league_id()?;

    let player_list = sleeper::get_player_list()?;
    //println!("{:#?}", player_list);

    let player_stats = sleeper::get_player_stats(2022)?;

    sleeper::get_league_scoring_settings(String::from("1"), 2022)?;

    sleeper::get_league_detail()?;
    Ok(())
}
