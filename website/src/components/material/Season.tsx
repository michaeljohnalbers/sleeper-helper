import React, {useState} from 'react';
import {KeeperData} from "../../types/keeper_data";
import {Box} from "@mui/material";
import Team from "./Team";

export default function Season({season, keeperData}: {season: string, keeperData : KeeperData}) {

    let teams = keeperData.teams.map(
        (teamData) => {return(<Team teamData={teamData} metadata={keeperData.metadata}/>)});

    return(
        <>
            <div>Hey, look, we're in season {season} {keeperData.metadata.player_data_pull_date}</div>
            <Box>
                {teams}
            </Box>
        </>
    );
}