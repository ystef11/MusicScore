import React from 'react'
import { StyleSheet, type ViewInstance } from 'react-native'

import { brandColors, CommonTouchable, Icon, IconSource } from '@mu-native/ds'

type TProps = {
    readonly icon?: IconSource
    readonly onPress: () => void
    readonly selected?: boolean
    readonly isEnabled?: boolean
    readonly testID?: string
    tint?: string
    background?: string
    /**
     * When provided, the selected state is rendered as a border of this color
     * (keeping the normal icon tint) instead of the default accent-tinted icon.
     */
    selectedBorderColor?: string
}

export const ScoreControlButton = React.forwardRef<ViewInstance, TProps>((props: TProps, ref) => {
    const showBorder = props.selected && !!props.selectedBorderColor
    const iconTint =
        props.selected && !props.selectedBorderColor ? brandColors.accentSecondary : props.tint
    return (
        <CommonTouchable
            ref={ref as any}
            testID={props.testID}
            isHapticEnabled
            onPress={props.isEnabled ? props.onPress : undefined}
            style={[
                { opacity: props.isEnabled ? 1 : 0.7, backgroundColor: props.background },
                styles.button,
                showBorder && { borderWidth: 1, borderColor: props.selectedBorderColor },
            ]}
        >
            {!!props.icon && <Icon source={props.icon} tint={iconTint} />}
        </CommonTouchable>
    )
})

const styles = StyleSheet.create({
    button: {
        width: 44,
        height: 44,
        alignItems: 'center',
        borderRadius: 100,
        justifyContent: 'center',
    },
})
