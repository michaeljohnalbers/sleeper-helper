import React, {useState} from "react";
import {
    autoPlacement,
    autoUpdate,
    flip, FloatingFocusManager,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole
} from "@floating-ui/react";

export default function PlayerName({playerName, className, stats, statsKeys}:
                                       {playerName: string, className: string, stats: Record<string, any>,
                                           statsKeys: Record<string, string>}) {
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

    let statRows : React.JSX.Element[] = []
    // TODO: sort keys
    for (const statAlias in stats) {
        const statValue = stats[statAlias]
        statRows.push(<tr>
            <td>{statsKeys[statAlias]}</td>
            <td>{statValue}</td>
        </tr>);
    }

    return(
        <>
            <span ref={refs.setReference} className={className} {...getReferenceProps()}>{playerName}</span>
            {isOpen && (
                <FloatingFocusManager context={context} modal={false}>
                    <div ref={refs.setFloating} style={floatingStyles} id={"playerStatsPopover"} {...getFloatingProps()}>
                        <table>
                            <thead>
                            <tr>
                                <td colSpan={2}>Player Stats</td>
                            </tr>
                            </thead>
                            <tbody>
                            {statRows}
                            </tbody>
                        </table>
                    </div>
                </FloatingFocusManager>
            )}
        </>
    );
}