import React, {ReactElement} from 'react';
import {Metadata, TeamData} from "../../types/keeper_data";
import {DataGrid, GridColDef, GridRowsProp} from "@mui/x-data-grid";
import {Popover, Typography} from "@mui/material";
import StatsTable from "./StatsTable";

export default function Team({teamData, metadata}:{teamData: TeamData, metadata: Metadata}) {
    const columns: GridColDef[] = [
        {field: "name", headerName: "Name"},
        {field: "position", headerName: "Position", maxWidth: 45},
        {field: "points", headerName: "Points", maxWidth: 45, type: "number"},
        {field: "round", headerName: "Round", maxWidth: 45, type: "number"},
    ];

    let rows: GridRowsProp = teamData.players.map((playerData, index)=> {
        let playerName = playerData.name;
        if (playerData.position !== "DEF") {
            playerName += " (" + playerData.team + ")"
        }
        return {id: index, name: playerName, position: playerData.position, points: playerData.total_points,
            round: playerData.draft_round_cost, stats: playerData.stats}
    })

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [statsTable, setStatsTable] = React.useState<ReactElement | null>(null);
    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        const field = event.currentTarget.dataset.field!;
        if (field === "name") {
            const id = event.currentTarget.parentElement!.dataset.id!;
            const playerRow = rows.find((r)=> r.id == id)!;
            if (playerRow.stats != null) {
                setStatsTable(<StatsTable name={playerRow.name} stats={playerRow.stats} metadata={metadata} />);
                setAnchorEl(event.currentTarget);
            }
        }
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return(
        <>
            <Typography variant="h5" align="center">{teamData.owner.user_name}</Typography>
            <DataGrid columns={columns} rows={rows}
                      checkboxSelection
                      columnHeaderHeight={35}
                      density="compact"
                      disableRowSelectionOnClick
                      hideFooterPagination={true}
                      slotProps={{
                          cell: {
                              onClick: handlePopoverOpen,
                          },
                      }}
            />
            { /*Modality of Popover sucks, but everything else is much better to use than Popper. */}
            <Popover open={open}
                     anchorEl={anchorEl}
                     onClose={handlePopoverClose}
                     anchorOrigin={{
                         vertical: 'center',
                         horizontal: 'right',
                     }}>
                {statsTable}
            </Popover>
        </>
    );
}
