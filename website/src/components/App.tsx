import React, {useState} from 'react';
import keeper_data from '../keeper_data.json'
import Team from "./Team";
import TopBox from "./TopBox";
import {TextDiv} from "./Text";

export default function App() {
    let visibilityMap = new Map([
        ["QB", true],
        ["RB", true],
        ["WR", true],
        ["TE", true],
        ["K", true],
        ["DEF", true],
    ]);
    const [visible, setVisible] = useState(visibilityMap)

    const year = new Date().getFullYear()
    const yearIndex = year.toString() as keyof typeof keeper_data;
    const season = keeper_data[yearIndex]

    const teamList= season.teams.map(team =>
        <Team teamData={team} salaryCap={season.cap.points} rosterSize={season.roster_size}/>
    );

    return(
        <>
            <TopBox year={year} cap={season.cap} />
            <div>
                {teamList}
            </div>
            <TextDiv text={"Player data gathered on " + season.metadata.player_data_pull_date} className="footnote" />
            <TextDiv text={"Player round cost last updated on " + season.metadata.player_rankings_gen_date} className="footnote" />
            <TextDiv text={season.metadata.notes} className="footnote" />
        </>
    )
}
