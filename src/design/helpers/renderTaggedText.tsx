import { cloneElement, Fragment, ReactElement, ReactNode } from 'react'

type TTagElements = Record<string, ReactElement>

const TAG_REGEXP = /\[(\w+)\]([\s\S]*?)\[\/\1\]/

/**
 * Splits a translated message on `[tag]…[/tag]` markup and renders each tagged part as a copy of
 * `elements[tag]` with the part as its children, so one complete sentence can carry a nested
 * pressable or coloured fragment. Tags without an element keep their plain content.
 */
export const renderTaggedText = (message: string, elements: TTagElements): ReactNode[] => {
    // split() with two capture groups yields [text, tag, content, text, tag, content, …, text]
    const pieces = message.split(new RegExp(TAG_REGEXP, 'g'))
    return pieces.flatMap((piece, index): ReactNode[] => {
        const position = index % 3
        if (position === 0) return piece ? [piece] : []
        if (position === 1) return []
        const tag = pieces[index - 1]
        const element = elements[tag]
        const key = `${tag}-${index}`
        return [
            element ? (
                cloneElement(element, { key }, piece)
            ) : (
                <Fragment key={key}>{piece}</Fragment>
            ),
        ]
    })
}
