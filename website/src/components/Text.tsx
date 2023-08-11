import React from "react";

/**
 * Inline bit of text with the given class.
 * @param text text
 * @param className CSS class name
 */
export default function Text({text, className}: {text: string, className: string}) {
    return(
        <>
            <span className={className}>{text}</span>
        </>
    )
}

/**
 * Block bit of text with the given class.
 * @param text
 * @param className
 * @constructor
 */
export function TextDiv({text, className}: {text: string, className: string}) {
    return(
        <>
            <div className={className}>{text}</div>
        </>
    )
}