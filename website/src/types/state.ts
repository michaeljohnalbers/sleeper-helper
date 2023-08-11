import {PlayerData, TeamData} from "./keeper_data";

export class PlayerState {
    adjusted_points_scored: number;
    draft_round_cost_string: string;
    kept: boolean;
    playerData : PlayerData;  // TODO: consider inheritance
    points_scored_string: string;

    constructor(playerData : PlayerData) {
        this.adjusted_points_scored = 0;
        this.draft_round_cost_string = playerData.draft_round_cost.toString();
        this.kept = false;
        this.playerData = playerData;
        this.points_scored_string = playerData.total_points.toString();
    };
}

export class TeamState {
    players: PlayerState[];
    total_points: number;
    total_points_class: string;

    constructor(teamData : TeamData) {
        this.players = teamData.players.map(player => new PlayerState(player));
        this.total_points = 0;
        this.total_points_class = "plain_text";
    }
}
