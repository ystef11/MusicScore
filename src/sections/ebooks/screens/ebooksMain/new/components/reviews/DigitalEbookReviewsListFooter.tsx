import { memo, useState } from 'react'
import { Image, Keyboard, Platform, StyleSheet, TextInput, View } from 'react-native'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { getStoreValue } from '@mu-native/common'
import {
    brandColors,
    brandFontsStyles,
    CommonTouchable,
    Icon,
    KeyboardSpacer,
    layout,
    staticSafeArea,
} from '@mu-native/ds'
import { send as sendIcon } from '@mu-native/icons/send'
import { translate } from '@mu-native/locale'
import { useActions } from '@ug/store'

import { digitalEbooksThunk } from '../../api/digitalEbooksThunk.ts'
import { useEbookPaywall } from '../../hooks/useEbookPaywall.ts'
import { useDigitalEbookReviewsChunk } from '../../stores/DigitalEbookReviewsStore.ts'

export const DigitalEbookReviewsListFooter = memo(() => {
    const bottomSafeArea = staticSafeArea().bottom
    const [text, setText] = useState('')
    const [isSending, setSending] = useState(false)
    const chunk = useDigitalEbookReviewsChunk()
    const { presentPreReview, isFullAccess } = useEbookPaywall()
    const actions = useActions({
        createReview: digitalEbooksThunk.createReview,
        presentAuth: authStoreChunk.actions.presentAuthModal,
    })

    const userAvatar = getStoreValue(authStoreChunk.props.getUser).avatar

    const onCreatePress = () => {
        if (isSending) return
        if (!isFullAccess) {
            presentPreReview()
            return
        }

        const send = async () => {
            try {
                setSending(true)
                await actions.createReview(getStoreValue(chunk.props.getEbookId), text, chunk)
                setText('')
                Keyboard.dismiss()
            } finally {
                setSending(false)
            }
        }

        if (!getStoreValue(getIsAuthorized)) {
            actions.presentAuth(send)
        } else {
            send()
        }
    }

    return (
        <>
            <View style={styles.base}>
                {!!userAvatar && <Image source={{ uri: userAvatar }} style={styles.avatar} />}
                <TextInput
                    onChangeText={setText}
                    multiline
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={text}
                    placeholder={translate('native.add_comment')}
                    style={styles.input}
                />
                <CommonTouchable
                    onPress={isSending ? undefined : onCreatePress}
                    style={styles.button}
                >
                    <Icon
                        source={sendIcon}
                        tint={
                            text.length > 0
                                ? brandColors.contentPrimary
                                : brandColors.contentInactive
                        }
                    />
                </CommonTouchable>
            </View>
            <KeyboardSpacer
                openedSpacing={8}
                defaultBottomSpacing={Platform.OS === 'ios' ? bottomSafeArea : 8}
            />
        </>
    )
})

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingTop: 8,
        paddingHorizontal: layout.baseMarginFromEdges,
        backgroundColor: brandColors.backgroundDefault,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: brandColors.strokeDefault,
    },

    input: {
        minHeight: 44,
        maxHeight: 150,
        borderWidth: 1,
        flex: 1,
        borderRadius: 2,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'android' ? 0 : 12,
        marginHorizontal: 12,
        borderColor: brandColors.colorBackgroundDisabled,
        ...brandFontsStyles.f15w400,
    },

    button: {
        height: 44,
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
})
