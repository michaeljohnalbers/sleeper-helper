use serde::Deserialize;
use std::collections::HashMap;
use std::error::Error;
use std::ops::Sub;
use std::path::Path;
use std::time::{Duration, SystemTime};

/// Definition of a single player in Sleeper (not complete)
#[derive(Debug, Clone, Deserialize)]
pub struct Player {
    active: bool,
    fantasy_positions: Option<Vec<String>>, // TODO: want just 'position'?
    first_name: String,
    last_name: String,
    player_id: String,
    team: Option<String>,
}

pub fn get_player_list() -> Result<HashMap<String, Player>, Box<dyn Error>> {
    // If this changes, update .gitignore
    let players_file = Path::new("sleeper_player_list.json");

    let mut get_list = true;

    if players_file.is_file() {
        let metadata = players_file.metadata().unwrap();
        let one_day = Duration::from_secs(60 * 60 * 24);
        let max_age = SystemTime::now().sub(one_day);
        get_list = metadata.modified().unwrap().lt(&max_age)
    }

    let player_json: String;
    if get_list {
        println!("Fetching player list from Sleeper...");
        let response = reqwest::blocking::get("https://api.sleeper.app/v1/players/nfl")?;
        player_json = response.text()?;
        std::fs::write(players_file, player_json.clone())?;
    } else {
        player_json = std::fs::read_to_string(players_file)?;
    }

    let players: HashMap<String, Player> = serde_json::from_str(player_json.as_str())?;
    Ok(players)
}
