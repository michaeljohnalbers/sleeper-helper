import React from 'react';
import {Metadata} from "../../types/keeper_data";
import {Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";

export default function StatsTable({name, stats, metadata}: {name: string, stats: Record<string, any>, metadata: Metadata}) {
    let statRows: React.JSX.Element[] = []
    // Appears to sort keys by default
    for (const statAlias in stats) {
        const statValue = stats[statAlias]
        statRows.push(
            <TableRow key={statAlias}>
                <TableCell>{metadata.player_stats_keys[statAlias]}</TableCell>
                <TableCell>{statValue}</TableCell>
            </TableRow>);
    }

    return(
        <>
            <Table size="small" aria-label="Player Stats">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2} align={"center"}>{name} Stats</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {statRows}
                </TableBody>
            </Table>
        </>
    );
}