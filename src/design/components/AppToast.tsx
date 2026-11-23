import { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { platform } from '@mu-native/common/constants/platform'

import { layout } from '../constants/layout'
import { brandColors } from '../constants/new/brandColors.ts'

type TProps = {
    /** Which screen edge the toast is pinned to. */
    position?: 'top' | 'bottom'
    /** Distance from that edge — the caller owns safe-area / tab-bar math. */
    offset: number
    onPress?: () => void
    disabled?: boolean
    testID?: string
    children: ReactNode
}

export const AppToast = ({
    position = 'bottom',
    offset,
    onPress,
    disabled,
    testID,
    children,
}: TProps) => (
    <View
        style={[styles.container, position === 'top' ? { top: offset } : { bottom: offset }]}
        pointerEvents="box-none"
    >
        <Pressable style={styles.toast} onPress={onPress} disabled={disabled} testID={testID}>
            {children}
        </Pressable>
    </View>
)

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        marginHorizontal: layout.marginSm,
        zIndex: 10000,
    },
    toast: {
        minHeight: 48,
        backgroundColor: brandColors.exceptionInverseLight,
        paddingVertical: layout.marginSm,
        flexDirection: 'row',
        maxWidth: platform.isTablet ? layout.maxWidthTabletContainer : undefined,
        alignItems: 'center',
        borderRadius: 1,
        paddingHorizontal: layout.marginXm,
        gap: layout.marginXm,
    },
})
