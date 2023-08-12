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
    const [visibleState, setVisibleState] = useState(visibilityMap)
    let positionsArray: string[] = [];
    visibilityMap.forEach((_: boolean, key: string)=>positionsArray.push(key));

    function visibleCallback(position: string) {
        let newVisibilityState = new Map(visibleState);
        let visible = newVisibilityState.get(position);
        newVisibilityState.set(position, ! visible);
        setVisibleState(newVisibilityState);
    }

    const year = new Date().getFullYear()
    const yearIndex = year.toString() as keyof typeof keeper_data;
    const season = keeper_data[yearIndex]

    const teamList= season.teams.map(team =>
        <Team key={team.owner.user_name} teamData={team} salaryCap={season.cap.points} rosterSize={season.roster_size} visibilityMap={visibleState}/>
    );

    return(
        <>
            <div className="app">
                <TopBox year={year} cap={season.cap} visibilityMap={visibleState} callback={visibleCallback} />
                <div className="teams">
                    {teamList}
                </div>
                <TextDiv text={"Player data gathered on " + season.metadata.player_data_pull_date} className="footnote" />
                <TextDiv text={"Player round cost last updated on " + season.metadata.player_rankings_gen_date} className="footnote" />
                <TextDiv text={season.metadata.notes} className="footnote" />
            </div>
        </>
    )
}
