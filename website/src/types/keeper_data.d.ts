/**
 * Mirrors the types in scraper/src/model.rs.
 */

export interface Cap {
    points: number
}

export interface Metadata {
    player_data_pull_date: string;
    player_rankings_gen_date: string;
    notes: string;
}

export interface Owner {
    user_name: string
}

export interface PlayerData {
    active: boolean;
    draft_round_cost: number;
    kept: boolean;
    name: string;
    position: string;
    team: string;
    total_points: number;
}

export interface TeamData {
    owner: Owner;
    players: PlayerData[];
}
export interface KeeperData {
    cap: Cap;
    metadata: Metadata;
    roster_size: number;
    teams: TeamData[];
}
