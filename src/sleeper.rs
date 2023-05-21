use reqwest::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use reqwest::StatusCode;
use serde::Deserialize;
use std::collections::HashMap;
use std::error::Error;
use std::fmt;
use std::fmt::{Display, Formatter};
use std::ops::Sub;
use std::path::Path;
use std::time::{Duration, SystemTime};

// TODO: maybe just get data for all seasons?

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
        // Sleeper recommends only grabbing this data once per day.
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

#[derive(Deserialize, Debug, Clone)]
struct InitializeLeague {
    league_id: String,
    name: String,
    previous_league_id: Option<String>,
    season: String,
    status: String,
}

#[derive(Deserialize, Debug, Clone)]
struct InitializeData {
    my_leagues: Vec<InitializeLeague>,
}

#[derive(Deserialize, Debug, Clone)]
struct Initialize {
    data: InitializeData,
}

pub fn get_league_id() -> Result<String, Box<dyn Error>> {
    println!("Retrieving league Id");
    let client = reqwest::blocking::Client::new();

    // This API call can be seen when loading the app (just https://sleeper.com) the first time, or after a refresh.
    let template = r#"{
  "operationName": "initialize_app",
  "variables":{},
  "query":"query initialize_app { my_leagues(exclude_archived: false) {league_id name previous_league_id season status} }"
}"#;
    //
    //query initialize_app { me { avatar cookies created display_name real_name email notifications phone user_id verification data_updated deleted} my_channels {avatar channel_id parent_id description is_private is_favorite name sort_order sport sharding_enabled last_topic_id last_message_id last_topic_read_id last_message_read_id total_members} recommended_channels(limit: 4) {avatar channel_id parent_id description is_private is_favorite name  sort_order\n          sport\n          sharding_enabled\n          last_topic_id\n          last_message_id\n          last_topic_read_id\n          last_message_read_id\n          total_members\n        }\n\n        my_leagues(exclude_archived: false) {\n          avatar\n          company_id\n          display_order\n          draft_id\n          last_author_id\n          last_author_avatar\n          last_author_display_name\n          last_author_is_bot\n          last_message_attachment\n          last_message_id\n          last_message_text\n          last_message_text_map\n          last_message_attachment\n          last_message_time\n          last_pinned_message_id\n          last_read_id\n          last_transaction_id\n          league_id\n          metadata\n          matchup_legs\n          name\n          previous_league_id\n          roster_positions\n          scoring_settings\n          season\n          season_type\n          settings\n          sport\n          status\n          total_rosters\n        }\n\n        \n        nfl_sport_info: sport_info(sport: \"nfl\")\n      \n\n        nba_sport_info: sport_info(sport: \"nba\")\n      \n\n        cbb_sport_info: sport_info(sport: \"cbb\")\n      \n\n        lcs_sport_info: sport_info(sport: \"lcs\")\n      \n\n        lec_sport_info: sport_info(sport: \"lec\")\n      \n\n        lck_sport_info: sport_info(sport: \"lck\")\n      \n\n        vcs_sport_info: sport_info(sport: \"vcs\")\n      \n\n        cblol_sport_info: sport_info(sport: \"cblol\")\n      \n\n      }
    let response = client
        .post("https://sleeper.com/graphql")
        .header(ACCEPT, "application/json")
        .header(CONTENT_TYPE, "application/json")
        // TODO: need to provide JWT
        .header(AUTHORIZATION, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXIiOiJiOGE1OTNhNDczMDhhMTI0N2IzZWY4N2U5NTQ2N2M4YSIsImRpc3BsYXlfbmFtZSI6Im1pY2hhZWxhbGJlcnMiLCJleHAiOjE3MDUxNzMzOTMsImlzX2JvdCI6bnVsbCwiaXNfbWFzdGVyIjpudWxsLCJyZWFsX25hbWUiOm51bGwsInVzZXJfaWQiOjU4ODYwMDQ5NjMzNjQ0MTM0NH0.p3xIkXqwL0truxpqg40dJYs-aWIYWaf90Lpq-7Wo2As")
        .body(template)
        .send()?;

    if !response.status().is_success() {
        return Err(Box::new(RequestError {
            msg: String::from("Failed to retrieve league details."),
            status: response.status(),
            body: response.text()?,
        }));
    }

    let initialize: Initialize = response.json::<Initialize>()?;

    for league in initialize.data.my_leagues.iter() {
        // TODO: parameterize season
        if league.name == "core.fantasy.football.league" && league.season == "2023" {
            return Ok(league.league_id.clone());
        }
    }
    panic!("Could not find league ID!")
}

#[derive(Debug, Deserialize)]
pub struct PlayerStats {
    player_id: String,
    stats: HashMap<String, f32>,
}

#[derive(Debug, Clone)]
pub struct RequestError {
    body: String,
    status: StatusCode,
    msg: String,
}

impl Display for RequestError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}. Status: {}, Request Body: {}",
            self.msg, self.status, self.body
        )
    }
}

impl Error for RequestError {}

pub fn get_player_stats(season: u16) -> Result<Vec<PlayerStats>, Box<dyn Error>> {
    println!("Getting player stats for {season}");

    let url_string = format!("https://api.sleeper.com/stats/nfl/{}?season_type=regular&position[]=DEF&position[]=K&position[]=QB&position[]=RB&position[]=TE&position[]=WR&order_by=pts_2qb", season);

    let response = reqwest::blocking::get(url_string)?;

    if !response.status().is_success() {
        return Err(Box::new(RequestError {
            msg: String::from("Failed to retrieve stats for season {season}."),
            status: response.status(),
            body: response.text()?,
        }));
    }

    let player_stats: Vec<PlayerStats> = response.json::<Vec<PlayerStats>>().unwrap();
    Ok(player_stats)
}

#[derive(Debug, Deserialize)]
struct Lineage {
    season: String,
    scoring_settings: HashMap<String, f32>,
}
#[derive(Debug, Deserialize)]
struct InnerData {
    lineage: Vec<Lineage>,
}
#[derive(Debug, Deserialize)]
struct InnerMetadata {
    data: InnerData,
}
#[derive(Debug, Deserialize)]
struct Data {
    metadata: InnerMetadata,
}
#[derive(Debug, Deserialize)]
struct Metadata {
    data: Data,
}

pub fn get_league_scoring_settings(
    league_id: String,
    season: u16,
) -> Result<HashMap<String, f32>, Box<dyn Error>> {
    println!("Retrieving scoring settings");
    let client = reqwest::blocking::Client::new();
    // TODO: don't use hard-coded league-id - should be able to get from "initialize_app"
    // This API call can be seen when loading the initial league page at sleeper.com.
    let template = r#"{
  "operationName": "metadata",
  "variables":{},
  "query":"query metadata {\n        metadata(type: \"league_history\", key: \"918974195273412608\"){\n          key\n          type\n          data\n        }\n}\n"
}"#;

    let response = client
        .post("https://sleeper.com/graphql")
        .header(ACCEPT, "application/json")
        .header(CONTENT_TYPE, "application/json")
        .body(template)
        .send()?;

    if !response.status().is_success() {
        return Err(Box::new(RequestError {
            msg: String::from("Failed to retrieve league metadata."),
            status: response.status(),
            body: response.text()?,
        }));
    }

    let league_metadata: Metadata = response.json::<Metadata>().unwrap();
    for lineage in league_metadata.data.metadata.data.lineage.iter() {
        if lineage.season == season.to_string() {
            return Ok(lineage.scoring_settings.clone());
        }
    }

    // TODO: error
    Ok(HashMap::new())
}

#[derive(Debug, Clone, Deserialize)]
pub struct LeagueUser {
    display_name: String,
    user_id: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LeaguePlayer {
    // TODO: figure out which of these actually needs Option
    first_name: Option<String>,
    last_name: Option<String>,
    player_id: Option<String>,
    position: Option<String>,
    team: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LeagueRoster {
    owner_id: String,
    player_map: HashMap<String, LeaguePlayer>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LeagueDetailsData {
    league_rosters: Vec<LeagueRoster>,
    league_users: Vec<LeagueUser>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LeagueDetails {
    data: LeagueDetailsData,
}

pub fn get_league_detail() -> Result<LeagueDetails, Box<dyn Error>> {
    println!("Retrieving league details (teams, rosters)");
    let client = reqwest::blocking::Client::new();

    // This API call can be seen when loading the initial league page at sleeper.com.
    // TODO: using 'player_map' may eliminate the need to get the full player list
    let template = r#"{
  "operationName": "get_league_detail",
  "variables":{},
  "query":"query get_league_detail { league_rosters(league_id: \"918974195273412608\"){owner_id player_map} league_users(league_id: \"918974195273412608\"){display_name user_id} }"
}"#;

    let response = client
        .post("https://sleeper.com/graphql")
        .header(ACCEPT, "application/json")
        .header(CONTENT_TYPE, "application/json")
        .body(template)
        .send()?;

    if !response.status().is_success() {
        return Err(Box::new(RequestError {
            msg: String::from("Failed to retrieve league details."),
            status: response.status(),
            body: response.text()?,
        }));
    }

    let league_details: LeagueDetails = response.json::<LeagueDetails>()?;
    Ok(league_details)
}
