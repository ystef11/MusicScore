import React, { useEffect } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'

import {
    colors,
    FadeAnimationComponent,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
    OnboardingTitleComponent,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import {
    reportTourUpdateStep,
    TOUR_TEXT_SUBTITLE,
    TOUR_TEXT_TITLE,
} from '../../constants/tourUpdateConstants'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: layout.fullScreenWidth,
        paddingBottom: getResponsiveSizeExtended(24),
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    imageWrapper: {
        flex: 1,
        width: '100%',
        maxHeight: layout.imageMaxHeight,
        marginBottom: getResponsiveSizeExtended(20),
    },
    imagePhoto: {
        height: '100%',
        width: '100%',
        alignSelf: 'flex-start',
    },
})

const TourRateAppComponent = ({ onClose }: { onClose: () => void }) => {
    useEffect(() => {
        reportTourUpdateStep('review')
    }, [])

    return (
        <FadeAnimationComponent>
            <View style={styles.container}>
                <View style={styles.imageWrapper}>
                    <Image
                        style={styles.imagePhoto}
                        source={icons.tourUpdateRateApp}
                        resizeMode="cover"
                    />
                </View>
                <ScrollView style={globalStyles.flex1FullWidth}>
                    <OnboardingTitleComponent
                        title={translate(TOUR_TEXT_TITLE[3])}
                        subTitle={translate(TOUR_TEXT_SUBTITLE[3])}
                    />
                </ScrollView>
            </View>
        </FadeAnimationComponent>
    )
}

export default React.memo(TourRateAppComponent)
