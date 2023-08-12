import React from "react";
import Text from "./Text";
import {PlayerState} from "../types/state";

export default function PlayerRow({playerState, keepCallback}:
                                      {playerState: PlayerState, keepCallback: ()=>void}) {
    let player = playerState.playerData;
    let playerName = player.name
    if (player.position !== "DEF") {
        playerName += " (" + player.team + ")"
    }
    return(
        <>
            <tr>
                <td>
                    <Text text={playerName} className="plain_text" />
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
