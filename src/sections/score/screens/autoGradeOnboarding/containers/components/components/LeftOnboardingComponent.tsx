import { StyleSheet, View } from 'react-native'

import { colors } from '@mu-native/ds'

import { type TPropsChildren } from '../../../types/autoGradeOnboardingScreenAppTypes'

const styles = StyleSheet.create({
    onboardingLeftContainer: {
        width: '50%',
        backgroundColor: colors.brandColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export const LeftOnboardingComponent = ({ children }: TPropsChildren) => (
    <View style={styles.onboardingLeftContainer}>{children}</View>
)
