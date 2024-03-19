import React from 'react';
import {KeeperData} from "../../types/keeper_data";
import {Box, Typography} from "@mui/material";
import Team from "./Team";

export default function Season({keeperData}: {keeperData : KeeperData}) {

    let teams = keeperData.teams.map(
        (teamData) => {
            return(<Team teamData={teamData} metadata={keeperData.metadata} cap={keeperData.cap}/>)});

    return(
        <>
            <Box>
                {teams}
                <Typography variant={"subtitle2"}>Player data gathered on {keeperData.metadata.player_data_pull_date}</Typography>
                <Typography variant={"subtitle2"}>Player round cost last updated on {keeperData.metadata.player_rankings_gen_date}</Typography>
            </Box>
        </>
    );
}