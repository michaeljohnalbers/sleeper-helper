import React from 'react';
import {Alert, AlertColor} from "@mui/material";

export default function TeamTableFooter({totalPoints, cap}: {totalPoints: number, cap: number}) {
    const pointsLeft = cap - totalPoints
    let severityVal: AlertColor = (totalPoints <= cap) ? "success" : "error";
    return(
        <>
            <Alert severity={severityVal}>Total Points: {totalPoints} ({pointsLeft})</Alert>
        </>
    );
}
