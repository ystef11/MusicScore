import { memo, useEffect, useRef, useState } from 'react'
import {
    Image,
    Keyboard,
    Platform,
    StyleSheet,
    TextInput,
    type TextInputInstance,
    View,
} from 'react-native'

import { authStoreChunk } from '@mu-native/auth'
import {
    AppText,
    brandColors,
    brandFontsStyles,
    CommonTouchable,
    Icon,
    layout,
} from '@mu-native/ds'
import { closeCompact } from '@mu-native/icons/closeCompact'
import { send } from '@mu-native/icons/send'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../../constants/scoreAnalytic'
import reportEvent from '../../../Utils/Analytics'
import { useCurrentScore } from '@mu-native/score-screen'
import { replyComment } from '../commentActionsAsync'

import { TReplyTo } from './ScreenComments'

type TProps = {
    replyTo: TReplyTo | null
    onClearReplyTo: () => void
}

export const NewCommentInput = memo(({ replyTo, onClearReplyTo }: TProps) => {
    const [isSending, setSending] = useState(false)
    const score = useCurrentScore()
    const [currentUser] = useValues([authStoreChunk.props.getUser])
    const actions = useActions({ submit: replyComment })
    const inputRef = useRef<TextInputInstance>(null)

    const [focused, setFocused] = useState(false)
    const [commentText, setCommentText] = useState('')

    useEffect(() => {
        if (replyTo) {
            inputRef.current?.focus()
        }
    }, [replyTo])

    const onFocus = () => {
        reportEvent(MetricaEvents.SCORE_COMMENT_FIELD_CLICK, getScoreMetaEvent(score))
        setFocused(true)
    }
    const onBlur = () => {
        setFocused(false)
    }

    const onSubmit = async () => {
        reportEvent(MetricaEvents.SCORE_COMMENT_CLICK, getScoreMetaEvent(score))
        const text = commentText.trim()
        if (!text) return
        setSending(true)
        setCommentText('')
        await actions.submit(text, replyTo?.id)
        setSending(false)
        Keyboard.dismiss()
        onClearReplyTo()
    }

    if (!currentUser) return null

    return (
        <>
            {replyTo !== null && (
                <View style={styles.replyToWrapper}>
                    <AppText
                        brandColor="contentSecondary"
                        font="f13w400"
                        rawText={translate('native.reply_to', { replied: replyTo.name })}
                    />
                    <CommonTouchable onPress={onClearReplyTo} hitSlop={8}>
                        <Icon source={closeCompact} size={16} tint={brandColors.contentPrimary} />
                    </CommonTouchable>
                </View>
            )}
            <View style={styles.inputContainer}>
                {!!currentUser.avatar && (
                    <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
                )}
                <TextInput
                    ref={inputRef}
                    onChangeText={setCommentText}
                    multiline
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={commentText}
                    placeholder={translate('native.add_comment')}
                    style={styles.input}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onSubmitEditing={onSubmit}
                />
                {focused && (
                    <CommonTouchable
                        onPress={isSending ? undefined : onSubmit}
                        style={styles.button}
                    >
                        <Icon
                            source={send}
                            tint={
                                commentText.length > 0
                                    ? brandColors.contentPrimary
                                    : brandColors.contentInactive
                            }
                        />
                    </CommonTouchable>
                )}
            </View>
        </>
    )
})

const styles = StyleSheet.create({
    inputContainer: {
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

    replyToWrapper: {
        backgroundColor: brandColors.backgroundHighlight,
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 44,
        paddingHorizontal: layout.baseMarginFromEdges,
        alignItems: 'center',
        borderTopColor: brandColors.strokeDefault,
        borderBottomColor: brandColors.strokeDefault,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },

    button: {
        height: 44,
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
