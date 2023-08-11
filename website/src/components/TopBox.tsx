import React from "react";
import Text, {TextDiv} from "./Text";
import {Cap} from "../types/keeper_data";

/**
 * Page header
 * @param year current year
 * @param cap "salary cap" information
 * @constructor
 */
export default function TopBox({year, cap}: {year: number, cap: Cap}) {
    let season = year.toString() + " Season"
    let capPoints = cap.points.toString() + " points"
    return(
        <>
            <div className="topBox">
                <TextDiv text={season} className="season" />
                <Text text="Keeper Limits" className="keeper_limit_header" />
                <ul>
                    <li><Text text={capPoints} className="plain_text" /></li>
                </ul>
            </div>
        </>
    )
}