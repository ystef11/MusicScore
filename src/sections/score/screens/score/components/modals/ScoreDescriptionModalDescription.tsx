import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { brandColors, brandFontsStyles, colors, Divider, ExpandableText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { useCurrentScore } from '../../hooks/useCurrentScore.ts'

export const ScoreDescriptionModalDescription = memo(() => {
    const score = useCurrentScore()

    if (!score) return null
    if (!score.description) return null

    return (
        <>
            <ExpandableText
                text={score.description.replaceAll(/\r\n/g, '\n')}
                textStyle={styles.newDescription}
                numberOfLines={7}
                badgeStyle={styles.newViewAllBadge}
                moreLabel={translate('native.artists.read_more')}
            />
            <Divider style={styles.divider} />
        </>
    )
})
ScoreDescriptionModalDescription.displayName = 'ScoreDescriptionModalDescription'

const styles = StyleSheet.create({
    description: {
        color: colors.text900,
    },

    newDescription: {
        color: brandColors.backgroundInverse,
        ...brandFontsStyles.f15w400,
    },

    divider: {
        marginVertical: 16,
        marginHorizontal: 0,
    },

    viewAllBadge: {
        color: colors.link,
        top: 2,
        marginLeft: 4,
    },

    newViewAllBadge: {
        color: brandColors.accentPrimary,
        top: 2,
    },
})
