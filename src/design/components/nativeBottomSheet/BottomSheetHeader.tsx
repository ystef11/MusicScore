import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { layout } from '../../constants/layout'
import { brandColors } from '../../constants/new/brandColors'
import { AppText } from '../AppText/AppText'

type TProps = {
    readonly title?: string
    readonly align?: 'center' | 'left'
    readonly testID?: string
}

export const BottomSheetHeader = memo((props: TProps) => {
    return (
        <View style={styles.container} nativeID="BottomSheetHeader" testID={props.testID}>
            <View
                style={[styles.handle, { backgroundColor: brandColors.contentTertiary }]}
                nativeID="BottomSheetHeader-handle"
            />
            {!!props.title && (
                <AppText
                    nativeID="BottomSheetHeader-title"
                    rawText={props.title}
                    oldColor="text900"
                    font="f16w500"
                    textAlign={props.align === 'left' ? undefined : 'center'}
                    style={styles.title}
                />
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
        width: '100%',
        paddingHorizontal: layout.baseMarginFromEdges,
        alignSelf: 'center',
    },

    title: {
        width: '100%',
    },

    handle: {
        height: 5,
        borderRadius: 5 / 2,
        width: 36,
        marginTop: 8,
        marginBottom: 14,
        alignSelf: 'center',
    },
})
