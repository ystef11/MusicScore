import React, { useEffect } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { tourTestIds } from '@mu/mu-mobile-test-id'
import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    colors,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { BenefitsComponent, BuyButton, marketingStoreChunk } from '@mu-native/marketing'
import { getAgeId } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../../App/Utils/Analytics'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    featuresContainer: {
        flex: 1,
        position: 'absolute',
        alignSelf: 'center',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        zIndex: 1000,
    },
    featuresWrapper: {
        width: '100%',
        flex: 1,
        paddingVertical: getResponsiveSizeExtended(24),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        maxWidth: layout.maxWidthTabletContainer,
    },
    featureImage: {
        width: '100%',
        height: platform.isTablet ? 220 : 240,
        borderRadius: platform.isTablet ? 20 : 0,
        marginTop: platform.isTablet ? 48 : 0,
        maxWidth: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
    },
    rebrandButtonStyle: {
        borderRadius: 30,
        backgroundColor: brandColors.additionalDefault,
        borderColor: brandColors.additionalDefault,
    },
})

type TTrialModalComponentProps = {
    onNextStep: () => void
    isShowFeaturesModal: boolean
    isStudent: boolean
}

const studentAgeTextById = {
    1015: translate('native.screen_tour.student_text_1'),
    1018: translate('native.screen_tour.student_text_2'),
}

const FeaturesModalComponent = ({
    onNextStep,
    isShowFeaturesModal,
    isStudent,
}: TTrialModalComponentProps) => {
    const actions = useActions({
        setIsStudentAge: marketingStoreChunk.actions.setIsStudentAge,
    })
    const [ageId] = useValues([getAgeId])

    useEffect(() => {
        if (isShowFeaturesModal) reportEvent(MetricaEvents.TOUR_INTERMEDIATE_SCREEN_VIEW)

        if (isStudent && isShowFeaturesModal) actions.setIsStudentAge(true)
    }, [isShowFeaturesModal])

    if (!isShowFeaturesModal) return null

    return (
        <Animated.View
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(300)}
            style={styles.featuresContainer}
        >
            <Image
                source={platform.isTablet ? icons.noteFeatureImageTablet : icons.noteFeatureImage}
                style={styles.featureImage}
            />
            <View style={styles.featuresWrapper}>
                <AppText
                    textAlign="center"
                    adaptiveSize
                    font="f24w600"
                    rawText={
                        isStudent
                            ? studentAgeTextById[ageId]
                            : translate('native.screen_tour.achieve_goals')
                    }
                    style={isStudent ? globalStyles.mb8 : globalStyles.mb24}
                />
                {isStudent && (
                    <AppText
                        textAlign="center"
                        adaptiveSize
                        font="f17w400"
                        style={globalStyles.mb24}
                        rawText={translate('native.screen_tour.support_program_text')}
                    />
                )}
                <BenefitsComponent />
            </View>
            <BuyButton
                testID={tourTestIds.buttons.featuresContinue}
                customButtonStyle={styles.rebrandButtonStyle}
                buttonText={translate('native.marketing.continue')}
                onBuyPress={onNextStep}
            />
        </Animated.View>
    )
}

export default React.memo(FeaturesModalComponent)
