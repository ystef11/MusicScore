import { memo, useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { AppText, brandColors, globalStyles, Icon, layoutHelpers } from '@mu-native/ds'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'
import { translate } from '@mu-native/locale'
import { BuyButton, PaymentLayerCloseBlockComponent } from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'

import reportEvent from '../../../../App/Utils/Analytics.ts'

const styles = StyleSheet.create({
    uploadPhotosContainer: {
        paddingTop: layoutHelpers.getResponsiveSizeExtended(80),
        width: '100%',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(120),
    },
    photosContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: layoutHelpers.getResponsiveSizeExtended(12),
        alignSelf: 'center',
        justifyContent: 'center',
    },
})

export const OmrSuccessUploadContainer = memo(() => {
    const { popToTop } = useAppNavigation()

    const goBackPress = () => {
        popToTop()
    }

    useEffect(() => {
        reportEvent('Temp Upload Step Show', {
            value: 'files_sent',
        })
    }, [])

    return (
        <View style={globalStyles.flex1FullWidthCenterPadding}>
            <PaymentLayerCloseBlockComponent
                onClose={goBackPress}
                containerStyle={globalStyles.fullWidth}
            />
            <ScrollView
                style={globalStyles.flex1FullWidth}
                contentContainerStyle={styles.uploadPhotosContainer}
                showsVerticalScrollIndicator={false}
            >
                <Icon
                    source={checkmarkCircle}
                    tint={brandColors.statusSuccess}
                    size={layoutHelpers.getResponsiveSizeExtended(72)}
                    style={[globalStyles.alignItemsCenter, globalStyles.mb32]}
                />
                <AppText
                    adaptiveSize
                    font="f44w400Accent"
                    rawText={translate('native.screen_omr.success_file_sent_title')}
                    style={globalStyles.mb32}
                    textAlign="center"
                />
                <AppText
                    adaptiveSize
                    font="f17w400"
                    rawText={translate('native.screen_omr.success_take_some_time')}
                    style={globalStyles.mb32}
                />
                <AppText
                    adaptiveSize
                    font="f17w400"
                    rawText={translate('native.screen_omr.success_will_notify')}
                />
            </ScrollView>
            <BuyButton
                onBuyPress={goBackPress}
                buttonText={translate('native.actions.okay')}
                customStyleContainer={globalStyles.zeroHorizontalPadding}
            />
        </View>
    )
})
