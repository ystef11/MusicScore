import { memo, useState } from 'react'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { AppText, globalStyles, BrandsThemeFontKey } from '@mu-native/ds'

type TProps = {
    title: string
    textAlign?: 'center' | 'left'
    readonly numberOfLines?: number
    readonly onLinesCalculated?: (linesCount: number) => void
}

export const ScoreDetailsTitle = memo((props: TProps) => {
    const [font, setFont] = useState<BrandsThemeFontKey>('f44w400Accent')
    return (
        <AppText
            font={font}
            style={props.textAlign === 'center' ? undefined : globalStyles.flex1}
            rawText={props.title}
            lineHeight={undefined}
            numberOfLines={props.numberOfLines ?? 2}
            textAlign={props.textAlign}
            testID={scoreTestIds.scoreDetailsTitle}
            onTextLayout={e => {
                props.onLinesCalculated?.(e.nativeEvent.lines.length)
                if (e.nativeEvent.lines.length >= 2 && font === 'f44w400Accent') {
                    setFont('f32w400Accent')
                }
            }}
        />
    )
})
ScoreDetailsTitle.displayName = 'ScoreDetailsTitle'
