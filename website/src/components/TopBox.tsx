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
            <div className="topBox">
                <TextDiv text={season} className="season" />
                <Text text="Keeper Limits" className="keeper_limit_header" />
                <ul>
                    <li><Text text={capPoints} className="plain_text" /></li>
                </ul>
                <div className="invisible_on_mobile">
                    <Text text="Show/Hide" className="plain_text" />
                    {positionButtons}
                </div>
            </div>
        </>
    )
}