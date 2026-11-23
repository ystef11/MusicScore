import React, { useCallback } from 'react'
import { Linking, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { platform } from '@mu-native/common'
import { AppText, brandColors, globalStyles, layout, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { marketingConstants, subscriptionsGroup } from '../../constants/marketingConstants'
import type { TStockLandingPlanType } from '../../types/marketingTypes'

const styles = StyleSheet.create({
    benefitTextContainer: {
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'center',
        paddingBottom: layout.marginSm,
    },
    bottomContainerPrivacyLinks: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: layoutHelpers.getResponsiveSizeExtended(16),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(100),
    },
    borderStyle: { borderBottomWidth: 1, borderColor: brandColors.contentPrimary },
    horizontalPadding: { paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(4) },
})

type TLinkButton = {
    onPress: () => void
    text: string
}

const LinkButtonElement = ({ onPress, text }: TLinkButton) => (
    <View style={styles.borderStyle}>
        <AppText
            brandColor="contentPrimary"
            adaptiveSize
            font="f13w400"
            onPress={onPress}
            rawText={text}
        />
    </View>
)

type TBillingInfoComponent = {
    currentSubscriptionsGroup?: TStockLandingPlanType
    customStyles?: StyleProp<ViewStyle>
    compactFooter?: boolean
}

const BillingInfoComponent = ({
    currentSubscriptionsGroup,
    customStyles,
    compactFooter = false,
}: TBillingInfoComponent) => {
    const goToTerms = useCallback(async () => {
        const canOpenLink = await Linking.canOpenURL(marketingConstants.termsLink)

        if (canOpenLink) {
            Linking.openURL(marketingConstants.termsLink)
        }
    }, [])

    const goToPolicy = useCallback(async () => {
        const canOpenLink = await Linking.canOpenURL(marketingConstants.privacyLink)

        if (canOpenLink) {
            Linking.openURL(marketingConstants.privacyLink)
        }
    }, [])

    return (
        <View style={[styles.benefitTextContainer, customStyles]}>
            <AppText
                font="f11w400"
                adaptiveSize
                brandColor="contentSecondary"
                rawText={translate('native.billing_info_text_cancel')}
            />
            {platform.isIos && (
                <AppText
                    font="f11w400"
                    adaptiveSize
                    brandColor="contentSecondary"
                    textAlign="justify"
                >
                    {translate('native.billing_info_text')}
                </AppText>
            )}
            <AppText
                font="f11w400"
                adaptiveSize
                brandColor="contentSecondary"
                textAlign="justify"
                rawText={
                    currentSubscriptionsGroup && !currentSubscriptionsGroup.includes('learning')
                        ? translate(
                              currentSubscriptionsGroup === 'premium'
                                  ? 'native.marketing.billing_info.includes_plan'
                                  : 'native.marketing.billing_info.includes_plan_and_course',
                              { plan: subscriptionsGroup[currentSubscriptionsGroup] },
                          )
                        : ''
                }
            />

            <View style={[styles.bottomContainerPrivacyLinks, compactFooter && globalStyles.pb12]}>
                <LinkButtonElement
                    text={translate('native.terms_of_service')}
                    onPress={goToTerms}
                />
                <AppText rawText="&" adaptiveSize font="f13w400" style={styles.horizontalPadding} />
                <LinkButtonElement text={translate('native.privacy_policy')} onPress={goToPolicy} />
            </View>
        </View>
    )
}

export default React.memo(BillingInfoComponent)
