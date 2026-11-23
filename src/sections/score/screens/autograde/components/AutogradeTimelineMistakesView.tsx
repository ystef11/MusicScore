import { ColorValue, StyleSheet, View } from 'react-native'

import { brandColors } from '@mu-native/ds'
import { useValues } from '@ug/store'

import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'
import { AutogradeDetailedResults, AutogradeState } from '../types/autogradeScreenAppTypes.ts'

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        flexDirection: 'row',
        backgroundColor: brandColors.backgroundDefault,
    },
    segment: {
        position: 'absolute',
        paddingHorizontal: 1,
        height: '100%',
    },
    color: {
        borderRadius: 4,
        height: '100%',
    },
})

const MistakePoints = {
    PITCH_WRONG: 10,
    NOTE_MISSED: 8,
    REST_MISSED: 5,
    ONSET_LATE: 3,
    ONSET_EARLY: 3,
    OFFSET_EARLY: 2,
    OFFSET_LATE: 1,
}

type TMistakesSegment = {
    left: number
    width: number
    color: ColorValue
}

const fillGaps = (segments: TMistakesSegment[], maxWidth: number) => {
    if (!segments.length) return []
    const color = brandColors.contentPrimary
    const segmentsWithGaps = segments.reduce((acc, currentSegment, index, arr) => {
        const newAcc = acc.concat(currentSegment)

        if (index < arr.length - 1) {
            const nextSegment = arr[index + 1]
            const gapStart = currentSegment.left + currentSegment.width
            const gapEnd = nextSegment.left

            if (gapEnd > gapStart) {
                return newAcc.concat({ left: gapStart, width: gapEnd - gapStart, color })
            }
        }

        return newAcc
    }, [] as TMistakesSegment[])

    const { left: firstSegmentStart } = segments[0]

    if (firstSegmentStart > 0) {
        const firstSegment = { left: 0, width: firstSegmentStart, color }
        segmentsWithGaps.unshift(firstSegment)
    }

    const lastSegment = segments[segments.length - 1]
    const lastSegmentEnd = lastSegment.left + lastSegment.width

    if (lastSegmentEnd < maxWidth) {
        segmentsWithGaps.push({ left: lastSegmentEnd, width: maxWidth - lastSegmentEnd, color })
    }

    return segmentsWithGaps
}

export const AutogradeTimelineMistakesView = ({ maxWidth }: { maxWidth: number }) => {
    const [state, duration, detailedResults] = useValues([
        autogradeScreenStoreChunk.props.getState,
        autogradeScreenStoreChunk.props.getDuration,
        autogradeScreenStoreChunk.props.getDetailedResults,
    ])

    const minWidth = 12
    const minDuration = (minWidth / maxWidth) * duration

    const groupedMistakes = detailedResults?.reduce((segments, mistake) => {
        if (segments.length === 0) {
            const segment = [mistake]
            return [segment]
        }

        const lastSegment = segments[segments.length - 1]
        const lastMistake = lastSegment[lastSegment.length - 1]
        const lastPosition = lastMistake.start + lastMistake.duration

        if (mistake.start - lastPosition < minDuration) {
            lastSegment.push(mistake)
            return segments
        }

        const nextSegment = [mistake]
        return [...segments, nextSegment]
    }, [] as AutogradeDetailedResults[])

    const mistakeSegments = groupedMistakes?.map(group => {
        const { start } = group[0]
        const lastSegment = group[group.length - 1]
        const end = lastSegment.start + lastSegment.duration

        const left = (start / duration) * maxWidth
        const width = ((end - start) / duration) * maxWidth
        const points = group.reduce((total, result) => {
            const mistake = result.mistakes[0]
            const point = MistakePoints[mistake] ?? 0
            return total + point
        }, 0)
        const color = points >= 6 ? 'rgb(255, 53, 66)' : 'rgb(255, 147, 24)'
        return {
            left,
            width: Math.max(6, width),
            color,
        } as TMistakesSegment
    })
    const segments = mistakeSegments ? fillGaps(mistakeSegments, maxWidth) : null

    return (
        <>
            {segments && !!maxWidth && !!duration && state === AutogradeState.Reviewing && (
                <View style={styles.container}>
                    {segments.map(({ left, width, color }) => (
                        <View
                            key={left}
                            style={[
                                styles.segment,
                                {
                                    left,
                                    width,
                                },
                            ]}
                        >
                            <View style={[styles.color, { backgroundColor: color }]} />
                        </View>
                    ))}
                </View>
            )}
        </>
    )
}
