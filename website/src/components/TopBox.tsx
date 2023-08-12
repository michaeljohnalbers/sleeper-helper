import React from "react";
import Text, {TextDiv} from "./Text";
import {Cap} from "../types/keeper_data";
import {VisibilityMap} from "../types/misc";

export default function TopBox({year, cap, visibilityMap, callback}:
{year: number, cap: Cap, visibilityMap: VisibilityMap, callback: (position: string)=>void}) {
    let season = year.toString() + " Season"
    let capPoints = cap.points.toString() + " points"

    let positionButtons : React.JSX.Element[] = [];
    visibilityMap.forEach((visible: boolean, position: string) => {
        let text = <Text text={position} className={visible ? 'plain_text' : 'strike'} />
        positionButtons.push(<button key={position} className="position_button" onClick={() => callback(position)}>{text}</button>);
    });

    return(
        <>
            <div>
                <TextDiv text={season} className="plain_text" />
                <Text text="Keeper Limits" className="plain_text" />
                <ul>
                    <li><Text text={capPoints} className="plain_text" /></li>
                </ul>
                <div>
                    <Text text="Show/Hide" className="plain_text" />
                    {positionButtons}
                </div>
            </div>
        </>
    )
}