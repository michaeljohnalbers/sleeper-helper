use serde::{Deserialize, Serialize};

/// The cap cost for keepers.
#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct Cap {
    points: u16,
}

impl Cap {
    pub fn new(points: u16) -> Cap {
        Cap { points }
    }
}

/// Models the owner of an individual team.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Owner {
    user_name: String,
}

impl Owner {
    pub fn new(user_name: &str) -> Owner {
        Owner {
            user_name: user_name.to_string(),
        }
    }
}

/// An individual player with basic information for determining keeper status.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    active: bool,
    draft_round_cost: i32,
    kept: bool,
    name: String,
    position: String,
    team: String,
    total_points: i32,
}

impl Player {
    pub fn new(name: &str, active: bool, position: &str, team: &str, total_points: i32) -> Player {
        Player {
            active,
            draft_round_cost: 0,
            kept: false,
            name: name.to_string(),
            position: position.to_string(),
            team: team.to_string(),
            total_points,
        }
    }

    pub fn set_draft_round_cost(&mut self, draft_round_cost: i32) {
        self.draft_round_cost = draft_round_cost;
    }

    pub fn set_kept(&mut self, kept: bool) {
        self.kept = kept;
    }
}

/// A single team in the league.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Team {
    owner: Owner,
    players: Vec<Player>,
}

impl Team {
    pub fn new(owner: Owner) -> Team {
        Team {
            owner,
            players: vec![],
        }
    }

    pub fn add_player(&mut self, player: Player) {
        self.players.push(player);
    }
}

/// A single season for the league.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Season {
    cap: Cap,
    teams: Vec<Team>,
}

impl Season {
    pub fn new(cap: Cap) -> Season {
        Season { cap, teams: vec![] }
    }

    pub fn add_team(&mut self, team: Team) {
        self.teams.push(team);
    }
}
