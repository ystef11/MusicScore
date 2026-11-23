import { useEffect } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { authStoreChunk } from '@mu-native/auth'
import { platform, useDidUpdate } from '@mu-native/common'
import {
    BaseScreenTourView,
    colors,
    icons,
    layout,
    layoutHelpers,
    MuseButton,
    OnboardingTitleComponent,
    useAppSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { resetToLearnTab } from '@mu-native/marketing'
import { useAppNavigation, useAppRoute } from '@mu-native/navigation'
import { pushNotificationsStoreChunk, pushNotificationsThunks } from '@mu-native/pushNotifications'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents'
import { getFullScreenWidth } from '../../constants/styles'
import reportEvent from '../../Utils/Analytics'
import { isTablet } from '../../Utils/Platform'

type NotificationViewProps = {
    onAllowPress: () => void
    onNotNowPress: () => void
}

const NotificationViewComponent = ({ onAllowPress, onNotNowPress }: NotificationViewProps) => {
    const inset = useAppSafeArea({ bottom: 20 })

    return (
        <BaseScreenTourView>
            <View style={styles.container}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={
                            isTablet
                                ? icons.pushNotificationIllustrationTablet
                                : icons.pushNotificationIllustration
                        }
                        resizeMode="contain"
                        style={styles.imagePhoto}
                    />
                </View>

                <OnboardingTitleComponent
                    title={translate('native.screen_notifications.title')}
                    subTitle={translate('native.screen_notifications.description')}
                    contentStyle={styles.title}
                />
            </View>

            <MuseButton
                title={translate('native.screen_notifications.allow')}
                onPress={onAllowPress}
                style={styles.primaryButton}
            />
            <MuseButton
                type="tertiaryUnderlined"
                title={translate('native.screen_notifications.dismiss')}
                onPress={onNotNowPress}
                style={{ marginBottom: inset.bottom }}
            />
        </BaseScreenTourView>
    )
}

export const ScreenNotificationsContainer = () => {
    const { replace } = useAppNavigation()
    const { isOpenLearnTab } = useAppRoute<{ isOpenLearnTab?: boolean }>()
    const [notificationsEnabled] = useValues([
        pushNotificationsStoreChunk.props.getPermissionGranted,
    ])

    const actions = useActions({
        setIsVisible: authStoreChunk.actions.setIsVisible,
        requestPushPermissionThunk: pushNotificationsThunks.requestPushPermissionThunk,
    })

    useEffect(() => {
        reportEvent(MetricaEvents.TOUR_NOTIFICATIONS_VIEW)
    }, [])

    const close = () => {
        reportEvent(MetricaEvents.TOUR_NOTIFICATIONS_NO_CLICK)

        // эксп 8348: купившим Learn в туре открываем Learn таб вместо дефолтного
        if (isOpenLearnTab) {
            resetToLearnTab()
            return
        }

        replace('App')
    }

    useDidUpdate(() => {
        if (notificationsEnabled) close()
    }, [notificationsEnabled])

    const enableNotifications = async () => {
        reportEvent(MetricaEvents.TOUR_NOTIFICATIONS_ALLOW_CLICK)
        const granted = (await actions.requestPushPermissionThunk()) as unknown as boolean

        reportEvent(MetricaEvents.DAILY_REMINDERS, {
            value: 'notifications',
            'params.key': ['allowed'],
            'params.str_value': [''],
            'params.value': [granted ? 1 : 0],
        })
    }

    return <NotificationViewComponent onAllowPress={enableNotifications} onNotNowPress={close} />
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(25),
        alignItems: 'center',
        backgroundColor: colors.white,
    },

    imageWrapper: {
        flex: 1,
        overflow: 'hidden',
        width: '100%',
        maxHeight: layout.imageMaxHeight,
        backgroundColor: colors.tourUpdateBg,
        justifyContent: 'center',
    },

    imagePhoto: {
        width: '100%',
        aspectRatio: platform.isTablet ? 1 : 1338 / 1648,
    },

    primaryButton: {
        width: getFullScreenWidth() - 64,
        maxWidth: 422,
    },

    title: {
        maxWidth: 422,
        paddingTop: 30,
        width: getFullScreenWidth() - 64,
        paddingHorizontal: 0,
    },
})
