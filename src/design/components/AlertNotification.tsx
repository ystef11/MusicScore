import { memo, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import FastImage from '@d11/react-native-fast-image'
import { platform } from '@mu-native/common/constants/platform'
import { translate } from '@mu-native/locale/i18n'

import { layout } from '../constants/layout'
import { brandColors } from '../constants/new/brandColors.ts'
import { MuseButton } from '../elements/buttons/MuseButton.tsx'

import { AppText } from './AppText/AppText'
import { AppToast } from './AppToast.tsx'
import Icon, { type IconSource } from './Icon/Icon'

type AlertParams = {
    expiresIn?: number
    title?: string
    text?: string
    /** Optional leading vector icon, rendered in the toast text color. */
    icon?: IconSource
    /** Optional leading image thumbnail (uri). Takes precedence over `icon`. */
    image?: string
    action?: () => void
    actionTitle?: string
    position?: 'top' | 'bottom'
    margin?: number
}

const ICON_SIZE = 24
const IMAGE_SIZE = 36

let localShowNotification: (params: AlertParams) => void

export function showAlertNotification(params: AlertParams) {
    localShowNotification?.(params)
}

const styles = StyleSheet.create({
    image: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 1,
        overflow: 'hidden',
    },
    titleContainer: {
        flex: 1,
    },
    button: {
        paddingRight: 0,
    },
})

export const AlertNotifications = memo(
    ({ bottomOffset = 0, fixedMargin }: { bottomOffset?: number; fixedMargin?: number }) => {
        const insets = useSafeAreaInsets()
        const [isVisible, setVisible] = useState(false)
        const [alertData, setAlertData] = useState<AlertParams | undefined>()

        useEffect(() => {
            // Restore the previous host on unmount so nested hosts behave as a stack.
            const previous = localShowNotification
            let timer: ReturnType<typeof setTimeout> | undefined
            localShowNotification = params => {
                if (timer) clearTimeout(timer)
                const expiresIn = params.action ? params.expiresIn : (params.expiresIn ?? 3000)
                if (expiresIn) {
                    timer = setTimeout(() => {
                        setVisible(false)
                        setAlertData(undefined)
                    }, expiresIn)
                }
                setAlertData(params)
                setVisible(true)
            }
            return () => {
                if (timer) clearTimeout(timer)
                localShowNotification = previous
            }
        }, [])

        if (!isVisible) return null
        if (!alertData) return null

        // `fixedMargin` overrides the per-call `margin` so all toasts share one offset.
        let margin: number = platform.isTablet ? layout.marginXl : layout.marginXm
        if (alertData?.margin) margin += alertData?.margin ?? 0
        if (fixedMargin !== undefined) margin = fixedMargin
        const closeAlert = () => {
            setVisible(false)
            setAlertData(undefined)
        }

        const onPress = () => {
            alertData?.action?.()
            closeAlert()
        }

        const positionFromTop = alertData?.position === 'top'

        return (
            <AppToast
                position={positionFromTop ? 'top' : 'bottom'}
                offset={
                    positionFromTop ? insets.top + margin : insets.bottom + margin + bottomOffset
                }
                onPress={closeAlert}
            >
                {!!alertData.image && (
                    <FastImage style={styles.image} source={{ uri: alertData.image }} />
                )}
                {!alertData.image && !!alertData.icon && (
                    <Icon
                        source={alertData.icon}
                        size={ICON_SIZE}
                        tint={brandColors.exceptionInverseDark}
                    />
                )}
                <View style={styles.titleContainer}>
                    {!!alertData.title && (
                        <AppText
                            brandColor="exceptionInverseDark"
                            adaptiveSize
                            font="f17w400"
                            rawText={alertData.title}
                            numberOfLines={4}
                        />
                    )}
                    {!!alertData.text && (
                        <AppText
                            brandColor="exceptionInverseDark"
                            adaptiveSize
                            font="f17w400"
                            rawText={alertData.text}
                            numberOfLines={3}
                        />
                    )}
                </View>

                {!!alertData.action && (
                    <MuseButton
                        style={styles.button}
                        type="tertiaryUnderlined"
                        title={alertData.actionTitle || translate('native.actions.okay')}
                        titleTransform={alertData.actionTitle ? undefined : 'uppercase'}
                        onPress={onPress}
                        titleColor="exceptionInverseDark"
                    />
                )}
            </AppToast>
        )
    },
)
