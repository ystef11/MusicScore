import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { translate } from '@mu-native/locale'

import { CommonTouchable } from '../elements/CommonTouchable'

import { AppText } from './AppText/AppText.tsx'

type TProps = {
    title: string
    onViewAllPress?: () => void
    viewAllLabel?: string
    style?: StyleProp<ViewStyle>
    testID?: string
}

export const SectionHeader = memo(
    ({
        title,
        onViewAllPress,
        viewAllLabel = translate('native.view.all'),
        style,
        testID,
    }: TProps) => {
        return (
            <View style={[styles.container, style]} testID={testID}>
                <AppText font="f24w600" rawText={title} numberOfLines={1} style={styles.title} />
                {!!onViewAllPress && (
                    <CommonTouchable
                        onPress={onViewAllPress}
                        hitSlop={12}
                        style={styles.viewAllButton}
                    >
                        <AppText
                            font="f15w500"
                            brandColor="contentSecondary"
                            rawText={viewAllLabel}
                        />
                    </CommonTouchable>
                )}
            </View>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        // Baseline (not center) alignment: the title and the "View all" label use
        // different font sizes, so centering their boxes leaves the smaller text
        // sitting visually above the title.
        alignItems: 'baseline',
    },
    title: {
        flex: 1,
    },
    viewAllButton: {
        paddingLeft: 12,
    },
})
