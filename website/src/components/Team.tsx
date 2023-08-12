import React, {useState} from "react";
import {TeamData} from "../types/keeper_data";
import {PlayerState, TeamState} from "../types/state";
import PlayerRow from "./PlayerRow";
import Text, {TextDiv} from "./Text";

import {VisibilityMap} from "../types/misc";

let arrow = "->";
export default function Team({teamData, salaryCap, rosterSize, visibilityMap}:
                                 {teamData: TeamData, salaryCap : number, rosterSize: number, visibilityMap: VisibilityMap}) {
    const [teamState, setTeamState] = useState(new TeamState(teamData))

    function keepCallback(playerIndex: number) {
        let newTeamState: TeamState = JSON.parse(JSON.stringify(teamState)); // TODO: change to https://lodash.com/docs/4.17.15#cloneDeep
        newTeamState.players[playerIndex].kept = ! newTeamState.players[playerIndex].kept;
        update(newTeamState, salaryCap, rosterSize);
        setTeamState(newTeamState);
    }

    function clearAllCallback() {
        let newTeamState : TeamState = JSON.parse(JSON.stringify(teamState)); // TODO: change to https://lodash.com/docs/4.17.15#cloneDeep
        newTeamState.players.forEach((player) => player.kept = false);
        update(newTeamState, salaryCap, rosterSize);
        setTeamState(newTeamState);
    }

    let playerRows : React.JSX.Element[] = []
    teamState.players
        .filter(playerState => visibilityMap.get(playerState.playerData.position))
        .forEach((playerState, index) => {
        playerRows.push(<PlayerRow key={playerState.playerData.name} playerState={playerState} keepCallback={()=>keepCallback(index)}/>);
    });

    return(
        <>
            <div className="team">
                <table className="teamTable">
                    <thead>
                    <tr className="owner">
                        <th colSpan={5}>{teamData.owner.user_name}</th>
                    </tr>
                    <tr className="playerHeader">
                        <th scope="col">Player</th>
                        <th scope="col">Position</th>
                        <th scope="col">Points</th>
                        <th scope="col">Round</th>
                        <th scope="col">Keep?</th>
                    </tr>
                    </thead>
                    <tbody>
                    {playerRows}
                    </tbody>
                    <tfoot>
                    <tr>
                        <th scope="row" colSpan={2}>Total Points</th>
                        <td><Text text={teamState.total_points.toString()} className={teamState.total_points_class} /></td>
                        <td></td>
                        <td><button onClick={clearAllCallback}>Clear All</button></td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        </>
    )
}

/**
 * Update state based off which players are keepers. Keeper state must be set before calling this function.
 */
function update(teamState: TeamState, salaryCap: number, rosterSize: number) {
    /*
     There is a lot of looping over the same data (player list) in the functions below. However, the player lists
     are never going to be more than maybe 20 players, so the repetition shouldn't slow things down noticeably.
     And keeping the various adjustments discrete makes the code much easier to read.
    */
    updateCost(teamState);
    updateTotalPoints(teamState, salaryCap);
    updateRoundCost(teamState, rosterSize);
}

/**
 * Update cap cost for each player
 * For each player kept with the same round cost, except the first, adjust the points cost by 25% * X, where
 * X is the number of players kept in that round. For example, suppose all the following players
 * are kept
 *   Player 1, 100 pts, round 3 -> 100 pts
 *   Player 2,  70 pts, round 3 -> 75 * 1.25 = 94 pts
 *   Player 3,  60 pts, round 3 -> 60 * 1.50 = 90 pts
 *   Player 4,  50 pts, round 4 -> 50 pts
 */
function updateCost(teamState: TeamState) {
    for (let ii = 0; ii < teamState.players.length; ++ii) {
        let playerState = teamState.players[ii];
        let point_cost_string = playerState.playerData.total_points.toString();
        if (playerState.kept) {
            let multiplier = 1.0;
            // Since the player list is sorted by draft round cost, look at all the players above the
            // currently selected player and check for the same original round cost.
            for (let jj = ii - 1; jj >= 0; --jj) {
                const player_before = teamState.players[jj];
                if (player_before.kept && player_before.playerData.draft_round_cost === playerState.playerData.draft_round_cost) {
                    multiplier += 0.25;
                }
            }
            playerState.adjusted_points_scored = Math.round(multiplier * playerState.playerData.total_points);
            point_cost_string += "->" + playerState.adjusted_points_scored.toString();
        }
        playerState.points_scored_string = point_cost_string;
    }
}

function updateRoundCost(teamState: TeamState, rosterSize: number) {
    let round_taken = new Array(rosterSize).fill(false);
    for (const p of teamState.players) {
        let round_cost_string = p.playerData.draft_round_cost.toString();
        if (p.kept) {
            let modified_round = -1;

            for (let ii = 0; ii < round_taken.length; ++ii) {
                if (false === round_taken[ii] && (ii+1) >= p.playerData.draft_round_cost) {
                    modified_round = ii + 1;
                    round_taken[ii] = true;
                    break;
                }
            }

            // No spot was found, this likely means the player is a late round keeper and
            // we need to find an earlier spot to allocate to them.
            if (-1 === modified_round) {
                for (let ii = round_taken.length-1; ii >= 0; --ii) {
                    if (false === round_taken[ii]) {
                        modified_round = ii + 1;
                        round_taken[ii] = true;
                        break;
                    }
                }
            }

            round_cost_string += "->" + modified_round.toString();
        }
        p.draft_round_cost_string = round_cost_string;
    }
}

/**
 * Update overall points for keepers
 */
function updateTotalPoints(teamState: TeamState, salaryCap: number) {
    teamState.total_points = 0;
    teamState.players
        .filter(player => player.kept)
        .forEach((player : PlayerState) => {
            teamState.total_points += player.adjusted_points_scored;
        });

    teamState.total_points_class = (teamState.total_points <= salaryCap) ? "plain_text" : "error_text";
}