import React, {useState} from 'react';
import keeper_data from '../../keeper_data.json'
import {AppBar, Box, IconButton, Menu, MenuItem, Toolbar, Typography} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Season from "./Season";

export default function App() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [selectedYear, setSelectedYear ] = useState(getInitialYear());

    const pickSeason = (season: string ) => {
        setSelectedYear(season);
        handleClose();
    }

    let yearMenuItems : React.JSX.Element[] = [];
    Object.keys(keeper_data).sort().reverse().forEach((year) => {
        yearMenuItems.push(
            <MenuItem key={year} onClick={()=>{pickSeason(year)}}>{year}</MenuItem>);
    });

    return(
        <>
            <Box sx={{flexGrow: 1}}>
                <AppBar position={"static"}>
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            sx={{ mr: 2 }}
                            onClick={handleMenu}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu id="menu-appbar"
                              anchorEl={anchorEl}
                              keepMounted
                              open={Boolean(anchorEl)}
                              onClose={handleClose}>
                            {yearMenuItems}
                        </Menu>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Sleeper Helper
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Season season={selectedYear} keeperData={keeper_data[selectedYear as keyof typeof keeper_data]} />
            </Box>
        </>
    );
}


/**
 * Find the first year with data. This is to make sure the site works after a year rolls over, but
 * new data hasn't been generated.
 * @return most recent year with data in keeper_data
 */
function getInitialYear() : string {
    let year = new Date().getFullYear() + 1;
    let yearIndex;
    do {
        year--;
        yearIndex = year.toString()
    } while (! (yearIndex in keeper_data));

    return yearIndex;
}