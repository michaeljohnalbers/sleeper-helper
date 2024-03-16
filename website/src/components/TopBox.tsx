import React from "react";
import Text from "./Text";
import {Cap} from "../types/keeper_data";
import {VisibilityMap} from "../types/misc";

export default function TopBox({year, cap, visibilityMap, callback}:
{year: number, cap: Cap, visibilityMap: VisibilityMap, callback: (position: string)=>void}) {
    let season = year.toString() + " Season"
    let capPoints = cap.points.toString() + " points"

    let positionButtons : React.JSX.Element[] = [];
    visibilityMap.forEach((visible: boolean, position: string) => {
        let text = <Text text={position} className={visible ? 'plain_text' : 'strike'} />
        positionButtons.push(<td key={position}><button key={position} className="position_button"
                                                        onClick={() => callback(position)}>{text}</button></td>);
    });

    return(
        <>
            <div className="topBox">
                <h1>{season}</h1>
                <Text text={"Keeper Limits: " + capPoints} className="plain_text" />
                <table className="visibilityTable">
                    <tbody>
                    <tr>
                        <td><Text text="Show/Hide" className="plain_text" /></td>
                        {positionButtons}
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}