import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { authTestIds } from '@mu/mu-mobile-test-id'
import { AppText, AppToast } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

type TProps = {
    onPress: () => void
    disabled?: boolean
    /** A letter went out — show the sent line instead of the link; tapping now dismisses. */
    isLinkSent: boolean
    /** Distance from the screen bottom (safe area + tab bar handled by the caller). */
    bottomOffset: number
}

/**
 * Sticky "verify your email" toast (MUP-13968) on the shared AppToast shell.
 * Unlike the imperative AlertNotifications host it is declarative: it stays
 * until the backend reports the address verified. Tapping it sends the
 * verification link and swaps the action line to "link sent"; that
 * confirmation is an ordinary dismissible toast — a tap closes it.
 */
export const EmailVerificationToast = memo(
    ({ onPress, disabled, isLinkSent, bottomOffset }: TProps) => (
        <AppToast
            offset={bottomOffset}
            onPress={onPress}
            disabled={disabled}
            testID={authTestIds.emailVerification.toast}
        >
            <View style={styles.titleContainer}>
                <AppText
                    brandColor="exceptionInverseDark"
                    adaptiveSize
                    font="f17w400"
                    rawText={translate('native.email_verification.toast_title')}
                    numberOfLines={3}
                />
                {isLinkSent ? (
                    <AppText
                        brandColor="exceptionInverseDark"
                        adaptiveSize
                        font="f17w400"
                        rawText={translate('native.email_verification.link_sent_toast')}
                        numberOfLines={1}
                    />
                ) : (
                    <AppText
                        brandColor="exceptionInverseDark"
                        adaptiveSize
                        font="f17w400"
                        decorationLine="underline"
                        rawText={translate('native.email_verification.toast_action')}
                        numberOfLines={1}
                    />
                )}
            </View>
        </AppToast>
    ),
)

const styles = StyleSheet.create({
    titleContainer: {
        flex: 1,
    },
})
