import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, layout, SvgAsset } from '@mu-native/ds'
import { THub } from '@mu-native/hub-common'
import { translate } from '@mu-native/locale'

import { getHubIcon, HubIconKey } from '../../../constants/expHubsIcons'
import Utils from '../../../Utils/Utils'

type HubCardProps = {
    hub: THub
    onButtonPress: () => void
}

const getCounterList = (scores: number, subscribers: number | undefined) => {
    return [
        {
            value: subscribers,
            description: translate('native.screen_hub.followers'),
        },
        { value: scores, description: translate('native.screen_hub.scores') },
    ]
}

export const HubCard = memo(({ hub, onButtonPress }: HubCardProps) => {
    const hubIcon: HubIconKey = hub.imageBase
    const iconSource = getHubIcon(hubIcon, 'B')
    if (!hub.stat) return null
    const counterList = getCounterList(hub.stat.scores_count, hub.stat.followers_count) || []

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                {typeof iconSource === 'string' && (
                    <SvgAsset type={iconSource} style={styles.hubIcon} />
                )}

                <View style={styles.counterContainer2}>
                    <AppText rawText={hub.title} font="f15w500" />
                    <AppText
                        font="f13w400"
                        brandColor="contentSecondary"
                        style={styles.subtitle}
                        rawText={`${counterList
                            .map(s => `${Utils.formatNumber(s.value ?? 0)} ${s.description}`)
                            .join(', ')}`}
                    />
                </View>
            </View>

            <CommonTouchable
                onPress={onButtonPress}
                style={hub.subscribed ? styles.unfollowButton2 : styles.followButton2}
            >
                <AppText
                    font="f15w500"
                    brandColor={hub.subscribed ? 'contentPrimary' : 'backgroundDefault'}
                    rawText={translate(
                        hub.subscribed ? 'native.user.unfollow' : 'native.user.follow',
                    )}
                />
            </CommonTouchable>
        </View>
    )
})
const hubIconSize = 52

export const styles = StyleSheet.create({
    container: {
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingTop: 12,
    },
    counterContainer2: {
        flex: 1,
        justifyContent: 'center',
        marginStart: 12,
    },

    hubIcon: {
        width: hubIconSize,
        height: hubIconSize,
        borderRadius: hubIconSize / 2,
    },

    followButton2: {
        backgroundColor: brandColors.accentPrimary,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 28,
    },

    unfollowButton2: {
        backgroundColor: brandColors.backgroundInactive,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 28,
    },

    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: 48,
    },

    subtitle: {
        marginTop: 4,
    },
})
