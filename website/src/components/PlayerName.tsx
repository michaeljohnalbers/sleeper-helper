import React, {useState} from "react";
import {
    autoUpdate,
    FloatingFocusManager,
    offset,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole
} from "@floating-ui/react";
import Text from "./Text";

export default function PlayerName({playerName, className, stats, statsKeys}:
                                       {playerName: string, className: string, stats: Record<string, any>,
                                           statsKeys: Record<string, string>}) {
    if (null == stats) {
        return plainPlayerName(playerName, className);
    } else {
        return playerNameWithStats(playerName, className, stats, statsKeys);
    }
}

function playerNameWithStats(playerName: string, className: string, stats: Record<string, any>, statsKeys: Record<string, string>) {
    const [isOpen, setIsOpen] = useState(false);

    const {refs, floatingStyles, context} = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [offset(10)],
        placement: "right",
        whileElementsMounted: autoUpdate,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);

    // Merge all the interactions into prop getters
    const {getReferenceProps, getFloatingProps} = useInteractions([
        click,
        dismiss,
        role,
    ]);

    let statRows: React.JSX.Element[] = []
    // Appears to sort keys by default
    for (const statAlias in stats) {
        const statValue = stats[statAlias]
        statRows.push(<tr key={statAlias}>
            <td>{statsKeys[statAlias]}</td>
            <td>{statValue}</td>
        </tr>);
    }
    const statsTable =
        <table className="playerStatsTable">
            <thead>
            <tr>
                <td colSpan={2}>Player Stats</td>
            </tr>
            </thead>
            <tbody>
            {statRows}
            </tbody>
        </table>

    return (
        <>
            <span ref={refs.setReference} className={className} {...getReferenceProps()} id={"playerName"}>{playerName}</span>
            {isOpen && (
                <FloatingFocusManager context={context} modal={false}>
                    <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
                        {statsTable}
                    </div>
                </FloatingFocusManager>
            )}
        </>
    );
}

function plainPlayerName(playerName: string, className: string) {
    return (
        <Text className={className} text={playerName} />
    );
}
