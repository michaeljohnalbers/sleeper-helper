import React, {useState} from 'react';
import {KeeperData} from "../../types/keeper_data";

export default function Season({season, keeperData}: {season: string, keeperData : KeeperData}) {
    return(
        <>
            <div>Hey, look, we're in season {season} {keeperData.metadata.player_data_pull_date}</div>
        </>
    );
}