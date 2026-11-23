import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors, CommonTouchable, layoutHelpers, style, BrandAppLoader } from '@mu-native/ds'

import { COLOR_WHITE, MARGIN_XM, MARGIN_XS } from '../../constants/styles'

const styles = StyleSheet.create({
    newContainer: {
        paddingBottom: 24,
        backgroundColor: COLOR_WHITE,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingRight: MARGIN_XM,
    },
    newTitle: {
        color: colors.text900,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: MARGIN_XS,
    },
    newText: {
        color: colors.gray500,
        fontSize: 12,
        lineHeight: 16,
    },
    cornerTitleWrapper: style.view({
        paddingLeft: layoutHelpers.getResponsiveSizeExtended(2),
    }),
    cornerTitle: style.text({
        color: colors.green500,
    }),
})

type Props = {
    title: string
    text?: string | null
    cornerTitle?: string
    children?: React.ReactNode
    onPress?: () => void
    testID?: string
    isLoading?: boolean
}

const ProfileSettingsListItem = ({
    title = '',
    cornerTitle = '',
    text,
    children,
    onPress,
    testID,
    isLoading,
}: Props) => (
    <CommonTouchable
        testID={testID}
        style={styles.newContainer}
        activeOpacity={1}
        onPress={onPress}
    >
        <View style={styles.innerContainer}>
            <Text style={styles.newTitle}>
                {title}
                {!!cornerTitle && (
                    <View style={styles.cornerTitleWrapper}>
                        <Text style={styles.cornerTitle}>{cornerTitle}</Text>
                    </View>
                )}
            </Text>
            {text && <Text style={styles.newText}>{text}</Text>}
        </View>
        {isLoading && <BrandAppLoader size="s" />}
        {!isLoading && children && (
            <View pointerEvents={onPress ? 'none' : 'auto'}>{children}</View>
        )}
    </CommonTouchable>
)

export default ProfileSettingsListItem
