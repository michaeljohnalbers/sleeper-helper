use crate::errors::{GeneralError, RequestError};
use reqwest::blocking::Response;
use reqwest::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use serde::Deserialize;
use std::cmp::Ordering;
use std::collections::HashMap;
use std::error::Error;
use std::ops::Sub;
use std::path::Path;
use std::time::{Duration, SystemTime};

// TODO: include final league order

pub struct Sleeper {
    client: reqwest::blocking::Client,
    jwt: String,
    pub roster_details: Vec<RosterDetails>,
    pub roster_size: i32,
    year: i32,
}

#[derive(Clone, Debug)]
pub struct PlayerDetails {
    pub active: bool,
    pub name: String,
    pub position: String,
    pub points_scored: i32,
    pub team: String,
    pub yahoo_id: i32,
}

#[derive(Clone, Debug)]
pub struct RosterDetails {
    pub owner: String,
    owner_id: String,
    pub players: Vec<PlayerDetails>,
}

impl Sleeper {
    pub fn new(jwt: String, year: i32) -> Result<Sleeper, Box<dyn Error>> {
        let mut sleeper = Sleeper {
            client: reqwest::blocking::Client::new(),
            jwt,
            roster_details: vec![],
            roster_size: 0,
            year,
        };
        let players_ids = Sleeper::get_player_ids()?;

        let league_ids = sleeper.get_league_ids()?;
        let league_id = league_ids.0;
        let league_details = sleeper.get_league_detail(&league_id)?;
        let all_player_stats = sleeper.get_player_stats()?;
        let league_settings = sleeper.get_league_settings(league_id)?;
        sleeper.roster_size = league_settings.roster_size;
        let unknown = String::from("Unknown");
        for user in league_details.data.league_users.iter() {
            let mut roster_details = RosterDetails {
                players: vec![],
                owner: user.display_name.clone(),
                owner_id: user.user_id.clone(),
            };

            fn is_active(status: Option<String>) -> bool {
                if status.unwrap_or(String::from("Inactive")).to_lowercase() == "active" {
                    true
                } else {
                    false
                }
            }

            for roster in league_details.data.league_rosters.iter() {
                if roster.owner_id == roster_details.owner_id {
                    for (player_id, player) in &roster.player_map {
                        let points_scored = calc_player_points_scored(
                            player_id,
                            &all_player_stats,
                            &league_settings.previous_year_scoring_settings,
                        )?;

                        let player_ids_opt = players_ids.get(player_id);
                        let player_ids;
                        match player_ids_opt {
                            Some(id) => {
                                player_ids = id;
                            }
                            None => {
                                return Err(Box::new(GeneralError::from_string(format!(
                                    "No player ids found for {}",
                                    player_id
                                ))));
                            }
                        }

                        let player_detail = PlayerDetails {
                            active: is_active(player.status.clone()),
                            name: format!(
                                "{} {}",
                                player.first_name.clone().unwrap_or(unknown.clone()),
                                player.last_name.clone().unwrap_or(unknown.clone())
                            ),
                            position: player.position.clone().unwrap_or(unknown.clone()),
                            points_scored,
                            team: player.team.clone().unwrap_or("N/A".to_string()),
                            yahoo_id: player_ids.yahoo_id.clone().unwrap_or(-1),
                        };
                        roster_details.players.push(player_detail);
                    }
                    roster_details.players.sort_by(|a, b| {
                        // Ensure that player ordering will always be the same between runs of this code.
                        match b.points_scored.cmp(&a.points_scored) {
                            Ordering::Equal => a.name.cmp(&b.name),
                            v => v,
                        }
                    });
                }
            }

            sleeper.roster_details.push(roster_details);
        }
        sleeper.roster_details.sort_by(|a, b| a.owner.cmp(&b.owner));
        Ok(sleeper)
    }
}

fn calc_player_points_scored(
    player_id: &String,
    all_player_stats: &Vec<SleeperPlayerStats>,
    scoring_settings: &HashMap<String, f32>,
) -> Result<i32, Box<dyn Error>> {
    for player_stats in all_player_stats.iter() {
        if player_stats.player_id == *player_id {
            let mut points_scored = 0.0;

            for (setting, setting_value) in scoring_settings {
                let stat_value = player_stats.stats.get(setting.as_str());
                if let Some(v) = stat_value {
                    points_scored += v * setting_value;
                }
            }
            return Ok(points_scored.round() as i32);
        }
    }

    Err(Box::new(GeneralError::from_str(
        "No stats found for player {player_id}!",
    )))
}

impl Sleeper {
    /// Convenience function to return an error in the case of an HTTP error. On error, the
    /// response body is consumed and an error with details returned. If there is no error,
    /// and empty success is returned.
    /// # Arguments
    /// * `response` - response to check
    /// * `description` - description of the HTTP call being checked
    fn check_http_error(response: Response, description: &str) -> Result<Response, Box<dyn Error>> {
        if !response.status().is_success() {
            return Err(Box::new(RequestError {
                msg: String::from(description),
                status: response.status(),
                body: response.text()?,
            }));
        }
        Ok(response)
    }

    fn graphql_request(
        &self,
        query: String,
        failure_description: &str,
    ) -> Result<Response, Box<dyn Error>> {
        let response = self
            .client
            .post("https://sleeper.com/graphql")
            .header(ACCEPT, "application/json")
            .header(CONTENT_TYPE, "application/json")
            .header(AUTHORIZATION, self.jwt.as_str())
            .body(query)
            .send()?;

        Self::check_http_error(response, failure_description)
    }
}

#[derive(Debug, Clone, Deserialize)]
struct PlayerIds {
    yahoo_id: Option<i32>,
}

impl Sleeper {
    fn get_player_ids() -> Result<HashMap<String, PlayerIds>, Box<dyn Error>> {
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
            let response = reqwest::blocking::get("https://api.sleeper.app/v1/players/nfl")?;
            player_json = response.text()?;
            std::fs::write(players_file, player_json.clone())?;
        } else {
            player_json = std::fs::read_to_string(players_file)?;
        }

        let players: HashMap<String, PlayerIds> = serde_json::from_str(player_json.as_str())?;
        Ok(players)
    }
}

#[derive(Deserialize, Debug, Clone)]
struct InitializeLeague {
    league_id: String,
    name: String,
    previous_league_id: Option<String>,
    season: String,
}

#[derive(Deserialize, Debug, Clone)]
struct InitializeData {
    my_leagues: Vec<InitializeLeague>,
}

#[derive(Deserialize, Debug, Clone)]
struct Initialize {
    data: InitializeData,
}

impl Sleeper {
    pub fn get_league_ids(&self) -> Result<(String, Option<String>), Box<dyn Error>> {
        // This API call can be seen when loading the app (just https://sleeper.com) the first time, or after a refresh.
        let query = r#"{
  "operationName": "initialize_app",
  "variables":{},
  "query":"query initialize_app { my_leagues(exclude_archived: false) {league_id name previous_league_id season status} }"
}"#;

        let response =
            self.graphql_request(query.to_string(), "Failed to retrieve league details.")?;

        let initialize: Initialize = response.json::<Initialize>()?;

        for league in initialize.data.my_leagues.iter() {
            if league.name == "core.fantasy.football.league"
                && league.season == self.year.to_string()
            {
                return Ok((league.league_id.clone(), league.previous_league_id.clone()));
            }
        }

        Err(Box::new(GeneralError::from_string(format!(
            "Could not find league id for {}",
            self.year
        ))))
    }
}

#[derive(Debug, Deserialize)]
pub struct SleeperPlayerStats {
    player_id: String,
    stats: HashMap<String, f32>,
}

impl Sleeper {
    fn get_player_stats(&self) -> Result<Vec<SleeperPlayerStats>, Box<dyn Error>> {
        let previous_year = self.year - 1;
        let url_string = format!("https://api.sleeper.com/stats/nfl/{}?season_type=regular&position[]=DEF&position[]=K&position[]=QB&position[]=RB&position[]=TE&position[]=WR&order_by=pts_2qb", previous_year);

        let response = reqwest::blocking::get(url_string)?;

        let response = Self::check_http_error(
            response,
            format!("Failed to retrieve stats for season {}.", self.year).as_str(),
        )?;

        let player_stats: Vec<SleeperPlayerStats> = response.json::<Vec<SleeperPlayerStats>>()?;
        Ok(player_stats)
    }
}

#[derive(Debug, Deserialize)]
struct Lineage {
    roster_positions: Vec<String>,
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

struct LeagueSettings {
    previous_year_scoring_settings: HashMap<String, f32>,
    roster_size: i32,
}

impl Sleeper {
    fn get_league_settings(&self, league_id: String) -> Result<LeagueSettings, Box<dyn Error>> {
        // This API call can be seen when loading the initial league page at sleeper.com.
        let prefix = r#"{
  "operationName": "metadata",
  "variables":{},
  "query":"query metadata {metadata(type: \"league_history\", key: \""#;
        let last = r#"\"){ data }}"
}"#;

        let query = format!("{}{}{}", prefix, league_id, last);

        let response = self.graphql_request(query, "Failed to retrieve league metadata.")?;

        let mut league_settings = LeagueSettings {
            previous_year_scoring_settings: HashMap::new(),
            roster_size: 0,
        };

        let previous_year = self.year - 1;
        let league_metadata: Metadata = response.json::<Metadata>().unwrap();
        for lineage in league_metadata.data.metadata.data.lineage.iter() {
            if lineage.season == self.year.to_string() {
                league_settings.roster_size = lineage.roster_positions.len() as i32;
            }
            if lineage.season == previous_year.to_string() {
                league_settings.previous_year_scoring_settings = lineage.scoring_settings.clone();
            }
        }

        if 0 == league_settings.roster_size
            || league_settings.previous_year_scoring_settings.len() == 0
        {
            return Err(Box::new(GeneralError::from_str(
                "No league lineage found for {previous_year} or {self.year}.",
            )));
        }

        Ok(league_settings)
    }
}
#[derive(Debug, Clone, Deserialize)]
struct SleeperLeagueUser {
    display_name: String,
    user_id: String,
}

#[derive(Debug, Clone, Deserialize)]
struct SleeperLeaguePlayer {
    first_name: Option<String>,
    last_name: Option<String>,
    position: Option<String>,
    status: Option<String>,
    team: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
struct SleeperLeagueRoster {
    owner_id: String,
    player_map: HashMap<String, SleeperLeaguePlayer>,
}

#[derive(Debug, Clone, Deserialize)]
struct SleeperLeagueDetailsData {
    league_rosters: Vec<SleeperLeagueRoster>,
    league_users: Vec<SleeperLeagueUser>,
}

#[derive(Debug, Clone, Deserialize)]
struct SleeperLeagueDetails {
    data: SleeperLeagueDetailsData,
}

impl Sleeper {
    fn get_league_detail(
        &self,
        league_id: &String,
    ) -> Result<SleeperLeagueDetails, Box<dyn Error>> {
        // This API call can be seen when loading the initial league page at sleeper.com.
        let prefix = r#"{
  "operationName": "get_league_detail",
  "variables":{},
  "query":"query get_league_detail { league_rosters(league_id: \""#;
        let middle = r#"\"){owner_id player_map} league_users(league_id: \""#;
        let end = r#"\"){display_name user_id} }"
}"#;
        let query = format!("{}{}{}{}{}", prefix, *league_id, middle, *league_id, end);

        let response = self.graphql_request(query, "Failed to retrieve league details.")?;

        let league_details: SleeperLeagueDetails = response.json::<SleeperLeagueDetails>()?;
        Ok(league_details)
    }
}
