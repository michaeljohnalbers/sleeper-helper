use crate::errors::{GeneralError, RequestError};
use reqwest::blocking::Response;
use reqwest::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use serde::Deserialize;
use std::collections::HashMap;
use std::error::Error;

// TODO: include final league order

// TODO: maybe just get data for all seasons?

pub struct Sleeper {
    client: reqwest::blocking::Client,
    jwt: String,
    pub roster_details: Vec<RosterDetails>,
    year: i32,
}

#[derive(Clone, Debug)]
pub struct PlayerDetails {
    pub active: bool,
    pub name: String,
    pub position: String,
    pub points_scored: i32,
    pub team: String,
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
            year,
            roster_details: vec![],
        };
        let league_ids = sleeper.get_league_ids()?;
        let league_id = league_ids.0;
        let previous_league_id = league_ids.1.unwrap();
        println!("League id: {league_id}, previous id: {previous_league_id}");
        let league_details = sleeper.get_league_detail()?;
        let all_player_stats = sleeper.get_player_stats()?;
        let scoring_settings = sleeper.get_league_scoring_settings(league_id)?;
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
                            &scoring_settings,
                        )?;

                        let player_detail = PlayerDetails {
                            active: is_active(player.status.clone()),
                            name: format!(
                                "{} {}",
                                player.first_name.clone().unwrap_or(unknown.clone()),
                                player.last_name.clone().unwrap_or(unknown.clone())
                            ),
                            position: player.position.clone().unwrap_or(unknown.clone()),
                            points_scored,
                            team: player.team.clone().unwrap_or(unknown.clone()),
                        };
                        roster_details.players.push(player_detail);
                    }
                    roster_details
                        .players
                        .sort_by(|a, b| b.points_scored.cmp(&a.points_scored));
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
        println!("Retrieving league Ids...");

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
        println!("Getting player stats for {previous_year}...");

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

impl Sleeper {
    pub fn get_league_scoring_settings(
        &self,
        league_id: String,
    ) -> Result<HashMap<String, f32>, Box<dyn Error>> {
        println!("Retrieving scoring settings...");

        // This API call can be seen when loading the initial league page at sleeper.com.
        let prefix = r#"{
  "operationName": "metadata",
  "variables":{},
  "query":"query metadata {metadata(type: \"league_history\", key: \""#;
        let last = r#"\"){ data }}"
}"#;

        let query = format!("{}{}{}", prefix, league_id, last);

        let response = self.graphql_request(query, "Failed to retrieve league metadata.")?;

        let previous_year = self.year - 1;
        let league_metadata: Metadata = response.json::<Metadata>().unwrap();
        for lineage in league_metadata.data.metadata.data.lineage.iter() {
            if lineage.season == previous_year.to_string() {
                return Ok(lineage.scoring_settings.clone());
            }
        }

        Err(Box::new(GeneralError::from_str(
            "No league lineage found for {previous_year}.",
        )))
    }
}
#[derive(Debug, Clone, Deserialize)]
struct SleeperLeagueUser {
    display_name: String,
    user_id: String,
}

#[derive(Debug, Clone, Deserialize)]
struct SleeperLeaguePlayer {
    // TODO: figure out which of these actually needs Option
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
    fn get_league_detail(&self) -> Result<SleeperLeagueDetails, Box<dyn Error>> {
        println!("Retrieving league details (teams, rosters)...");

        // This API call can be seen when loading the initial league page at sleeper.com.
        let prefix = r#"{
  "operationName": "get_league_detail",
  "variables":{},
  "query":"query get_league_detail { league_rosters(league_id: \""#;
        let middle = r#"\"){owner_id player_map} league_users(league_id: \""#;
        let end = r#"\"){display_name user_id} }"
}"#;
        let query = format!(
            "{}{}{}{}{}",
            prefix, "918974195273412608", middle, "918974195273412608", end
        );

        let response = self.graphql_request(query, "Failed to retrieve league details.")?;

        let league_details: SleeperLeagueDetails = response.json::<SleeperLeagueDetails>()?;
        Ok(league_details)
    }
}
