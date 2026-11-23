import { JSX, memo } from 'react'
import { StyleSheet, Text, TextStyle } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { AppText, colors, layout, layoutHelpers, replacerText, style } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

/* eslint-disable import/no-relative-packages */
import { type TPlanType } from '../../types/marketingTypes'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    blueTitle: style.text({
        fontWeight: 'bold',
        color: colors.proPlusColor,
        textTransform: 'uppercase',
        fontSize: getResponsiveSizeExtended(24),
    }),
    plus: style.text({
        fontSize: getResponsiveSizeExtended(28),
    }),
    heading: style.text({
        fontWeight: '600',
        fontSize: getResponsiveSizeExtended(24),
        lineHeight: getResponsiveSizeExtended(32),
        color: colors.text900,
        textAlign: 'center',
        alignSelf: 'center',
        maxWidth: platform.isTablet ? 500 : layout.fullScreenWidth - 2 * 16,
        letterSpacing: 0.05,
        paddingTop: getResponsiveSizeExtended(8),
    }),
})

const PLAN_PLACEHOLDER = '\u0000'
const [upgradeTitleBefore = '', upgradeTitleAfter = ''] = translate(
    'native.marketing.landing.upgrade_to_plan',
    { plan: PLAN_PLACEHOLDER },
).split(PLAN_PLACEHOLDER)

const getTitlesProUser: Record<TPlanType, JSX.Element | null> = {
    learning: (
        <AppText
            adaptiveSize
            rawText={replacerText({
                text: translate('native.screen_no_landing.subscription_start', {
                    subscriptionType: '[bl]Learn[/bl]',
                }),
            })}
            style={styles.heading}
        />
    ),
    learningLite: (
        <AppText
            adaptiveSize
            rawText={replacerText({
                text: translate('native.screen_no_landing.subscription_start', {
                    subscriptionType: '[bl]Learn Lite[/bl]',
                }),
            })}
            style={styles.heading}
        />
    ),
    pro: null,
    ebook: null,
    offScores: (
        <AppText adaptiveSize style={styles.heading}>
            {upgradeTitleBefore}
            <Text style={styles.blueTitle}>
                {translate('native.screen_tour.scores_pro')}
                <Text style={styles.plus}>+</Text>
            </Text>
            {upgradeTitleAfter}
        </AppText>
    ),
}

const getTitlesWithoutProUserExp: Record<TPlanType, string> = {
    offScores: '[bl]PRO+[/bl]',
    learning: '[bl]Learn[/bl]',
    learningLite: '[bl]Learn Lite[/bl]',
    pro: '[bl]PRO[/bl]',
    ebook: '[bl]Books[/bl]',
}

type TLandingTitleProps = {
    isUpgradeMode?: boolean
    currentSubscriptionsGroup: TPlanType
    customStyle?: TextStyle
}

const LandingTitlesComponent = ({
    isUpgradeMode = false,
    currentSubscriptionsGroup,
    customStyle = {},
}: TLandingTitleProps) => (
    <Animated.View layout={LinearTransition.duration(300)}>
        {isUpgradeMode ? (
            getTitlesProUser[currentSubscriptionsGroup]
        ) : (
            <AppText
                adaptiveSize
                style={[styles.heading, customStyle]}
                rawText={replacerText({
                    text: translate('native.screen_no_landing.subscription_start', {
                        subscriptionType:
                            getTitlesWithoutProUserExp[currentSubscriptionsGroup] || '',
                    }),
                })}
            />
        )}
    </Animated.View>
)

export default memo(LandingTitlesComponent)
