import { memo, useEffect, useRef } from 'react'
import {
    Keyboard,
    StyleSheet,
    TextInput,
    type TextInputInstance,
    TouchableWithoutFeedback,
    View,
} from 'react-native'

import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    colors,
    globalStyles,
    layout,
    layoutHelpers,
    replacerText,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
        paddingHorizontal: layout.marginMd,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    subtitle: {
        marginBottom: layoutHelpers.getResponsiveSizeExtended(24),
    },
    textInput: {
        borderWidth: layoutHelpers.getResponsiveSizeExtended(1),
        borderRadius: layoutHelpers.getResponsiveSizeExtended(24),
        borderColor: brandColors.contentPrimary,
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(12),
        fontSize: layoutHelpers.getResponsiveSizeExtended(18),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(21),
        height: layoutHelpers.getResponsiveSizeExtended(44),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(16),
    },
})

const TourInputName = () => {
    const { setIsVisible, setUserName } = useActions({
        setIsVisible: authStoreChunk.actions.setIsVisible,
        setUserName: quizStoreChunk.actions.setUserName,
    })

    const [isAuth, userName] = useValues([getIsAuthorized, quizStoreChunk.props.getUserName])

    const inputRef = useRef<TextInputInstance>(null)

    useEffect(() => {
        setTimeout(() => {
            inputRef?.current?.focus?.()
        }, 1000)
    }, [])

    const onSignInPress = () => {
        if (Keyboard.isVisible()) Keyboard.dismiss()

        setIsVisible(true)
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <Animated.View
                entering={FadeIn.duration(600).delay(500)}
                exiting={FadeOut.duration(1000)}
                style={styles.container}
            >
                <AppText
                    font="f24w600"
                    adaptiveSize
                    textAlign="center"
                    style={globalStyles.mb4}
                    rawText={replacerText({
                        text: translate('native.marketing.lets_get_started'),
                    })}
                />
                <AppText
                    font="f16w400"
                    style={styles.subtitle}
                    textAlign="center"
                    adaptiveSize
                    rawText={translate('native.marketing.create_your_account')}
                />
                <TextInput
                    ref={inputRef}
                    value={userName}
                    onChangeText={setUserName}
                    autoComplete="name"
                    selectionColor={colors.text900}
                    placeholder={` ${translate('native.marketing.enter_your_name')}`}
                    placeholderTextColor={colors.gray100}
                    style={styles.textInput}
                    maxLength={20}
                />
                {!isAuth && (
                    <View>
                        <AppText font="f16w400" adaptiveSize textAlign="center">
                            {translate('native.screen_new_account.has_account')}{' '}
                            <AppText
                                onPress={onSignInPress}
                                font="f16w400"
                                adaptiveSize
                                decorationLine="underline"
                                rawText={translate('native.settings_screen.login_button')}
                            />
                        </AppText>
                    </View>
                )}
            </Animated.View>
        </TouchableWithoutFeedback>
    )
}

export default memo(TourInputName)
