import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppText, CommonTouchable, layout } from '@mu-native/ds'

type TProps = {
    title: string
    subtitle?: string
    onPress: () => void
    testID?: string
}

export const RecentSearchRow = memo(({ title, subtitle, onPress, testID }: TProps) => (
    <CommonTouchable onPress={onPress} style={styles.container} testID={testID}>
        <AppText font="f17w500" rawText={title} numberOfLines={1} />
        {subtitle ? (
            <AppText
                font="f13w400"
                brandColor="contentSecondary"
                rawText={subtitle}
                numberOfLines={1}
                style={styles.subtitle}
            />
        ) : null}
    </CommonTouchable>
))

const styles = StyleSheet.create({
    container: {
        paddingVertical: layout.marginXm,
    },
    subtitle: {
        marginTop: 2,
    },
})
