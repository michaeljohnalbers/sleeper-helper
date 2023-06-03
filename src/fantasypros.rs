use reqwest::header::ACCEPT;
use serde::Deserialize;
use std::error::Error;

#[derive(Deserialize)]
pub struct PlayerRank {
    pub player_id: i32,
    pub player_name: String,
    pub player_team_id: String,
    pub player_position_id: String,
    pub player_yahoo_id: String,
    pub rank_ecr: u32,
}

#[derive(Deserialize)]
pub struct PlayerRankings {
    pub players: Vec<PlayerRank>,
    pub last_updated: String,
}

pub struct FantasyPros {
    pub overall_rankings: PlayerRankings,
    pub superflex_rankings: PlayerRankings,
}

impl FantasyPros {
    pub fn new(api_key: String, year: i32) -> Result<FantasyPros, Box<dyn Error>> {
        // Superflex doesn't include D/ST or K
        let superflex_rankings = FantasyPros::get_ranks(&api_key, year, "OP")?;
        let overall_rankings = FantasyPros::get_ranks(&api_key, year, "ALL")?;
        Ok(FantasyPros {
            overall_rankings,
            superflex_rankings,
        })
    }
}

impl FantasyPros {
    fn get_ranks(
        api_key: &String,
        year: i32,
        position: &str,
    ) -> Result<PlayerRankings, Box<dyn Error>> {
        let url = format!("https://api.fantasypros.com/v2/json/nfl/{}/consensus-rankings?type=draft&scoring=PPR&position={}&week=0&experts=available", year, position);

        let client = reqwest::blocking::Client::new();

        let request = client
            .get(url)
            .header(ACCEPT, "application/json")
            .header("x-api-key", api_key);
        let response = request.send()?;

        // println!("FantasyPros:\n{}", response.text().unwrap());
        // Ok(PlayerRankings {
        //     players: vec![],
        //     last_updated: "".to_string(),
        // })

        let player_rankings = response.json::<PlayerRankings>()?;
        Ok(player_rankings)
    }
}
