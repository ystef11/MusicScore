import { memo } from 'react'
import { Image, ImageURISource, StyleSheet, View } from 'react-native'

import {
    colors,
    FadeAnimationComponent,
    layoutHelpers,
    OnboardingTitleComponent,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import Button from '../../../../../../App/Elements/NewButton'
import { OnboardingSteps } from '../../types/autoGradeOnboardingScreenAppTypes'

import { CurrentStepComponent } from './components/CurrentStepComponent'
import { LeftOnboardingComponent } from './components/LeftOnboardingComponent'
import { RightOnboardingComponent } from './components/RightOnboardingComponent'

const styles = StyleSheet.create({
    secondStepContainer: { flexDirection: 'row', height: '100%', width: '100%' },
    imageAutoGrade: {
        width: layoutHelpers.normalizeSize(300),
        height: layoutHelpers.normalizeSize(300),
        marginBottom: layoutHelpers.normalizeSize(32),
    },
    titleFirstStep: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(24),
        fontWeight: '500',
        color: colors.text900,
        textAlign: 'center',
        maxWidth: '90%',
        marginBottom: layoutHelpers.normalizeSize(32),
    },
    subTitleFirstStep: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
        fontWeight: '500',
        color: colors.text900,
        textAlign: 'center',
    },
    imageLeftOnboarding: {
        height: '100%',
        width: '100%',
    },
    imageLeftOnboardingB: {
        height: '92%',
        width: '92%',
        marginRight: -layoutHelpers.getResponsiveSizeExtended(80),
    },
    imageFifthItemOnboarding: {
        width: '100%',
        height: '100%',
        maxHeight: 380,
        maxWidth: 380,
        marginRight: 0,
    },
    imageLastItemOnboarding: {
        width: '104%',
        height: '104%',
        marginRight: 0,
    },
    backgroundButtonColor: {
        borderWidth: 0,
        borderRadius: 22,
        backgroundColor: colors.brandColor,
    },
})

type Props = {
    step: OnboardingSteps
    onNext: (step: OnboardingSteps) => void
    title: string
    subtitle: string
    stepLabel?: number
    totalStepsLabel: number
    buttonTitle?: string
    image: ImageURISource
}

export const AutoGradeContentStepComponent = memo(
    ({ step, onNext, title, subtitle, stepLabel, totalStepsLabel, buttonTitle, image }: Props) => {
        return (
            <FadeAnimationComponent>
                <View style={styles.secondStepContainer}>
                    <LeftOnboardingComponent>
                        <Image
                            resizeMode={step < OnboardingSteps.FifthStep ? 'contain' : 'cover'}
                            source={image}
                            style={
                                step < OnboardingSteps.FifthStep
                                    ? styles.imageLeftOnboardingB
                                    : styles.imageLeftOnboarding
                            }
                        />
                    </LeftOnboardingComponent>
                    <RightOnboardingComponent>
                        <View>
                            {!!stepLabel && (
                                <CurrentStepComponent step={stepLabel} total={totalStepsLabel} />
                            )}
                            <OnboardingTitleComponent
                                title={title}
                                subTitle={subtitle}
                                contentStyle={{
                                    width: undefined,
                                    paddingHorizontal: undefined,
                                    alignSelf: undefined,
                                }}
                            />
                        </View>
                        <Button
                            style={styles.backgroundButtonColor}
                            text={buttonTitle ?? translate('native.screen_new_account.continue')}
                            onPress={() => onNext(step)}
                        />
                    </RightOnboardingComponent>
                </View>
            </FadeAnimationComponent>
        )
    },
)
