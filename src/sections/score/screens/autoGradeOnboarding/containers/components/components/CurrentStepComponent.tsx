import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { layoutHelpers, colors, design, AppText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { OnboardingSteps } from '../../../types/autoGradeOnboardingScreenAppTypes'

const styles = StyleSheet.create({
    stepTitle: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(17),
        fontFamily: design.fontFamilyMuseSansRegular,
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(8),
    },
    padding: {
        width: '100%',
        borderTopWidth: 1,
        borderColor: colors.text900,
    },
})

export const CurrentStepComponent = memo(
    ({ step, total }: { step: OnboardingSteps; total: number }) => {
        if (step >= OnboardingSteps.SixthStep) return null
        return (
            <View>
                <View style={styles.padding}>
                    <AppText
                        style={styles.stepTitle}
                        rawText={translate('native.practice_mode.onboarding.step_counter', {
                            step: String(step),
                            total: String(total),
                        })}
                    />
                </View>
            </View>
        )
    },
)
