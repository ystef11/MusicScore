import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { brandColors, globalStyles } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { BuyButton, openSubscriptionManagement } from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'

import { openUrl } from '../../../../../../App/Utils/Linking.ts'

const styles = StyleSheet.create({
    bottomContainer: {
        width: '100%',
        height: 16,
        backgroundColor: brandColors.backgroundInactive,
    },
    bgColorInActive: {
        backgroundColor: brandColors.backgroundInactive,
    },
    customButtonStyle: {
        borderRadius: 50,
        backgroundColor: brandColors.actionSecondaryDefault,
    },
    customButtonText: {
        color: brandColors.contentPrimary,
    },
})
export const BottomSettingsComponent = memo(
    ({
        userId,
        productId,
        isAppStoreSubscription,
    }: {
        userId: number | null
        productId: string
        isAppStoreSubscription: boolean
    }) => {
        const { goBack } = useAppNavigation()

        const onNavigateToCancelSubscription = () => {
            if (isAppStoreSubscription) {
                openSubscriptionManagement(productId)
                goBack()
                return
            }
            if (userId) {
                openUrl(`https://musescore.com/user/${userId}/subscription?from=profile_menu`)
                goBack()
            }
        }

        return (
            <>
                <View style={styles.bottomContainer} />
                <View style={[styles.bgColorInActive, globalStyles.flex1FullWidth]}>
                    {(isAppStoreSubscription || !!userId) && (
                        <BuyButton
                            customButtonStyle={styles.customButtonStyle}
                            customButtonTextStyle={styles.customButtonText}
                            customStyleContainer={styles.bgColorInActive}
                            buttonText={translate('native.manage.subscription')}
                            onBuyPress={onNavigateToCancelSubscription}
                        />
                    )}
                </View>
            </>
        )
    },
)
