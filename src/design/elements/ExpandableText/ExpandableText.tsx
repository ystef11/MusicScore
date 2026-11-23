import React, { useState } from 'react'
import { StyleProp, Text, TextStyle } from 'react-native'

interface Props {
    text: string
    numberOfLines: number
    moreLabel?: string
    badgeStyle?: StyleProp<TextStyle>
    textStyle?: StyleProp<TextStyle>
    alwaysShowBadge?: boolean
}

export const ExpandableText: React.FC<Props> = ({
    text,
    numberOfLines,
    moreLabel = '...more',
    badgeStyle,
    textStyle,
    alwaysShowBadge,
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showMore, setShowMore] = useState(false)
    const [displayedText, setDisplayedText] = useState<string | null>(null)
    const [measured, setMeasured] = useState(false)

    const handleTextLayout = (e: any) => {
        if (measured) return
        setMeasured(true)

        const { lines } = e.nativeEvent

        if (!isExpanded && lines.length > numberOfLines) {
            setShowMore(true)

            const visibleLines = lines.slice(0, numberOfLines)
            const lastLine = visibleLines[visibleLines.length - 1].text

            // Обрезаем по словам, чтобы moreLabel влезло
            const words = lastLine.trim().split(' ')
            let trimmedLast = ''
            for (let i = 0; i < words.length; i++) {
                const withWord = trimmedLast + (trimmedLast ? ' ' : '') + words[i]
                if ((withWord + moreLabel).length <= lastLine.length) {
                    trimmedLast = withWord
                } else {
                    break
                }
            }

            const combined = visibleLines
                .slice(0, numberOfLines - 1)
                .map((l: { text: string }) => l.text)
                .join('')

            setDisplayedText(combined + trimmedLast)
        } else {
            // текст помещается полностью, ничего не обрезаем
            setDisplayedText(text)
        }
    }

    const measuredText = !isExpanded ? (
        <Text style={textStyle}>
            {displayedText}
            {(showMore || alwaysShowBadge) && (
                <Text
                    onPress={alwaysShowBadge ? undefined : () => setIsExpanded(true)}
                    style={badgeStyle}
                >
                    {' '}
                    {moreLabel}
                </Text>
            )}
        </Text>
    ) : (
        <Text style={textStyle}>{text}</Text>
    )

    return (
        <>
            {!measured ? (
                <Text style={textStyle} onTextLayout={handleTextLayout}>
                    {text}
                </Text>
            ) : (
                measuredText
            )}
        </>
    )
}
