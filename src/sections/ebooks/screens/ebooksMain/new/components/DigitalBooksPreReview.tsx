import { memo } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { platform } from '@mu-native/common'
import {
    colors,
    icons,
    layout,
    layoutHelpers,
    MuseButton,
    OnboardingTitleComponent,
    RootViewScreenComponent,
    RootViewTabletLayoutComponent,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useAppNavigation, useNavHeader } from '@mu-native/navigation'
import { useIsLandscape } from '@mu-native/system'

import { useEbookPaywall } from '../hooks/useEbookPaywall'

const styles = StyleSheet.create({
    absoluteFullWidth: { position: 'absolute', width: '100%', height: '100%' },
    container: {
        flex: 1,
        width: '100%',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(24),
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    imageWrapper: {
        flex: 1,
        overflow: 'hidden',
        width: '100%',
        maxHeight: layoutHelpers.getResponsiveSizeExtended(420),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(32),
    },
    imageWrapperLandscape: {
        maxHeight: layoutHelpers.getResponsiveSizeExtended(250),
    },
    imagePhoto: {
        height: '100%',
        width: '100%',
        alignSelf: 'flex-start',
    },
    textContainer: {
        flex: 0.5,
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(20),
    },
    mb10: { marginBottom: layoutHelpers.getResponsiveSizeExtended(10) },
    buttonContainer: {
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        paddingHorizontal: platform.isTablet ? 0 : layoutHelpers.getResponsiveSizeExtended(32),
    },
    paddingCustom: {
        paddingHorizontal: platform.isTablet ? 0 : layoutHelpers.getResponsiveSizeExtended(32),
    },
})
export const DigitalBooksPreReview = memo(() => {
    const navigation = useAppNavigation()
    const { presentPaywall } = useEbookPaywall()

    const isLandscape = useIsLandscape()

    useNavHeader('', false, undefined, false)

    return (
        <View style={styles.absoluteFullWidth}>
            <RootViewScreenComponent>
                <RootViewTabletLayoutComponent>
                    <View style={styles.container}>
                        <View
                            style={[
                                styles.imageWrapper,
                                isLandscape && styles.imageWrapperLandscape,
                            ]}
                        >
                            <Image
                                style={styles.imagePhoto}
                                source={icons.verifiedReviewImage}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <OnboardingTitleComponent
                                contentStyle={styles.paddingCustom}
                                title={translate('native.ebooks.verified_title')}
                                subTitle={translate('native.ebooks.verified_sub_title')}
                            />
                            <View style={styles.buttonContainer}>
                                <MuseButton
                                    title={translate('native.ebooks.get_access_songbook')}
                                    onPress={presentPaywall}
                                    style={styles.mb10}
                                />
                                <MuseButton
                                    title={translate('native.screen_notifications.dismiss')}
                                    onPress={navigation.goBack}
                                    type="tertiaryUnderlined"
                                    size="small"
                                />
                            </View>
                        </View>
                    </View>
                </RootViewTabletLayoutComponent>
            </RootViewScreenComponent>
        </View>
    )
})
