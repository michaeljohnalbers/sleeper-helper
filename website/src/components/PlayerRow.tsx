import React from "react";
import PlayerName from "./PlayerName";
import Text from "./Text";
import {PlayerState} from "../types/state";

export default function PlayerRow({playerState, playerStatsKeys, keepCallback}:
                                      {playerState: PlayerState, playerStatsKeys: Record<string, string>,
                                          keepCallback: ()=>void}) {
    let player = playerState.playerData;
    let playerName = player.name
    if (player.position !== "DEF") {
        playerName += " (" + player.team + ")"
    }
    return(
        <>
            <tr>
                <td>
                    <PlayerName playerName={playerName} className="plain_text" stats={player.stats}
                                statsKeys={playerStatsKeys}/>
                </td>
                <td>
                    <Text text={player.position} className="plain_text" />
                </td>
                <td className="points">
                    <Text text={playerState.points_scored_string} className="plain_text" />
                </td>
                <td>
                    <Text text={playerState.draft_round_cost_string} className="plain_text" />
                </td>
                <td>
                    <span><input type="checkbox" onChange={keepCallback} checked={playerState.kept}></input></span>
                </td>
            </tr>
        </>
    )
}
