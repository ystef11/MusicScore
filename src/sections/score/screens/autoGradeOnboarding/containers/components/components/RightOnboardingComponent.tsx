import { StyleSheet, type DimensionValue, View, ViewStyle } from 'react-native'

import { colors, layoutHelpers } from '@mu-native/ds'

import type { TPropsChildren } from '../../../types/autoGradeOnboardingScreenAppTypes'

const styles = StyleSheet.create({
    onboardingRightContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        paddingRight: layoutHelpers.getResponsiveSizeExtended(48),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(32),
    },
})

type TRightOnboardingComponent = {
    backgroundColor?: string
    paddingLeft?: number
    width?: DimensionValue
    style?: ViewStyle
}

export const RightOnboardingComponent = ({
    children,
    backgroundColor = colors.white,
    paddingLeft = layoutHelpers.getResponsiveSizeExtended(48),
    width = '50%',
    style,
}: TPropsChildren & TRightOnboardingComponent) => (
    <View style={[styles.onboardingRightContainer, style, { backgroundColor, paddingLeft, width }]}>
        {children}
    </View>
)
