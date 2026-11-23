import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, globalStyles, layout, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const styles = StyleSheet.create({
    tourTrustTextContainer: {
        alignItems: 'center',
        paddingTop: layoutHelpers.getResponsiveSizeExtended(40),
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
    },
    tourTrustTextContainerLandscape: {
        paddingTop: layoutHelpers.getResponsiveSizeExtended(12),
    },
})

export const MuseTextComponent = memo(({ isLandscape = false }: { isLandscape?: boolean }) => {
    return (
        <View
            style={[
                styles.tourTrustTextContainer,
                isLandscape && styles.tourTrustTextContainerLandscape,
            ]}
        >
            <AppText
                font="f24w600"
                textAlign="center"
                brandColor="contentPrimary"
                rawText={translate('native.screen_tour.trusted')}
                style={globalStyles.mb8}
                adaptiveSize
            />
            <AppText
                font="f14w400"
                textAlign="center"
                brandColor="contentSecondary"
                adaptiveSize
                rawText={translate('native.screen_tour.happy')}
            />
        </View>
    )
})
