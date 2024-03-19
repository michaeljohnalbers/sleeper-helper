import React from 'react';
import {KeeperData} from "../../types/keeper_data";
import {Box} from "@mui/material";
import Team from "./Team";

export default function Season({season, keeperData}: {season: string, keeperData : KeeperData}) {

    let teams = keeperData.teams.map(
        (teamData) => {
            return(<Team teamData={teamData} metadata={keeperData.metadata} cap={keeperData.cap}/>)});

    return(
        <>
            <Box>
                {teams}
            </Box>
        </>
    );
}