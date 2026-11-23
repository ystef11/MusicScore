import React, { Ref } from 'react'
import { Image, StyleSheet, TextInput, type TextInputInstance, View } from 'react-native'

import { coursesTestIds } from '@mu/mu-mobile-test-id'
import {
    colors,
    CommonTouchable,
    icons,
    KeyboardSpacer,
    layout,
    LinearGradient,
    style,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'

type ICommentInputProps = {
    value: string
    inputRef: ((ref: any) => void) | Ref<TextInputInstance>
    onChangeText: (value: string) => void
    onSubmit: () => void
    onFocus: () => void
}

const CommentInput = ({ inputRef, value, onChangeText, onSubmit, onFocus }: ICommentInputProps) => {
    return (
        <View style={styles.wrapper}>
            <LinearGradient style={styles.blur} colors={['rgba(255, 255, 255, 0)', '#FFF']} />
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <TextInput
                        testID={coursesTestIds.courseDetails.commentsInput}
                        ref={inputRef}
                        value={value}
                        style={styles.input}
                        onChangeText={onChangeText}
                        onSubmitEditing={onSubmit}
                        placeholder={translate('native.screen_comments.write_comment')}
                        placeholderTextColor={colors.silverDeep}
                        returnKeyType="send"
                        clearButtonMode="always"
                        disableFullscreenUI
                        underlineColorAndroid="transparent"
                        onFocus={onFocus}
                    />
                    <CommonTouchable
                        onPress={onSubmit}
                        disabled={!value}
                        style={styles.iconContainer}
                    >
                        <Image
                            source={icons.sendIcon}
                            style={styles.sendIcon}
                            resizeMode="contain"
                        />
                    </CommonTouchable>
                </View>
            </View>
            <KeyboardSpacer />
        </View>
    )
}

export default React.memo(CommentInput)

const styles = StyleSheet.create({
    wrapper: style.view({
        width: '100%',
        position: 'absolute',
        bottom: 0,
    }),
    container: style.view({
        alignSelf: 'stretch',
        backgroundColor: colors.white,
    }),
    inputContainer: style.view({
        margin: 20,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 0.5,
        backgroundColor: colors.white,
        borderColor: colors.gray500,
    }),
    input: style.text({
        color: colors.text900,
        paddingHorizontal: layout.marginMd,
        paddingVertical: 8,
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    }),
    sendIcon: style.image({
        tintColor: colors.blue600,
        width: 20,
        height: 20,
    }),
    blur: style.view({
        width: '100%',
        height: 48,
    }),
    iconContainer: style.image({
        marginRight: layout.marginXm / 2,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    }),
})
