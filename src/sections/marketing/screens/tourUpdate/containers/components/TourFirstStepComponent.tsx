import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    DividerComponent,
    FadeAnimationComponent,
    globalStyles,
    icons,
    layoutHelpers,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    textPosition: { bottom: getResponsiveSizeExtended(4), position: 'absolute' },
    imageBg: {
        width: '100%',
        height: platform.isTablet ? '400%' : '250%',
        position: 'absolute',
        transform: [{ translateY: -getResponsiveSizeExtended(1000) }],
    },
    contentTextContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        minHeight: '44%',
        backgroundColor: brandColors.backgroundDefault,
        padding: layoutHelpers.getResponsiveSizeExtended(20),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(40),
    },
    maxTitleWidth: { maxWidth: '84%' },
})

const TourFirstStepComponent = () => {
    return (
        <FadeAnimationComponent>
            <View style={styles.container}>
                <Image resizeMode="contain" source={icons.tourFirstStep} style={styles.imageBg} />
                <View style={styles.contentTextContainer}>
                    <DividerComponent isShowOrTitle={false} />
                    <AppText
                        font="f44w400Accent"
                        textAlign="left"
                        brandColor="contentPrimary"
                        rawText={translate(
                            'native.marketing.tour_update.introducing_scores_to_screen',
                        )}
                        style={[globalStyles.mb16, styles.maxTitleWidth]}
                    />
                    <DividerComponent isShowOrTitle={false} />
                    <AppText
                        font="f17w400"
                        textAlign="left"
                        brandColor="contentPrimary"
                        rawText={translate('native.marketing.tour_update.omr_feature_description')}
                        style={globalStyles.mb12}
                    />
                </View>
                <AppText
                    font="f14w400"
                    textAlign="center"
                    style={styles.textPosition}
                    brandColor="backgroundDefault"
                />
            </View>
        </FadeAnimationComponent>
    )
}

export default React.memo(TourFirstStepComponent)
