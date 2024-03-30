import React from 'react';
import {KeeperData} from "../../types/keeper_data";
import {Box, Typography} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
//import Grid from '@mui/material/Grid';
import Team from "./Team";

export default function Season({keeperData}: {keeperData : KeeperData}) {

    let gridTeams = keeperData.teams.map(
        (teamData) => {
            return(
                <Box id={teamData.owner.user_name}>
                    <Team teamData={teamData} metadata={keeperData.metadata} cap={keeperData.cap}/>
                </Box>
            )});

    return(
        <>
            <Box id={"season-box"}>
            <Grid id={"teams-grid"} container>
                {gridTeams}
            </Grid>
            <Box id={"season-footer"}>
                <Typography variant={"subtitle2"}>Player data gathered on {keeperData.metadata.player_data_pull_date}</Typography>
                <Typography variant={"subtitle2"}>Player round cost last updated on {keeperData.metadata.player_rankings_gen_date}</Typography>
            </Box>
           </Box>
        </>
    );
}