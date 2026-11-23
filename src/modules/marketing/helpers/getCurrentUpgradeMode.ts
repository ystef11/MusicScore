import { platform } from '@mu-native/common'

import { marketingConstants } from '../constants/marketingConstants'
import { type TCurrentSubscription, type TProductId } from '../types/marketingTypes'

const { plansForUpgrade, plansForUpgradeLite } = marketingConstants

type TCheckCurrentUpgradeMode = {
    typeUpgrade: 'ios-upgrade' | 'android-upgrade' | 'web-upgrade' | ''
    params: Record<string, string>
}

type TUpgradeMode = {
    isPro: boolean
    currentSubscriptionId: TProductId | ''
    currentSubscriptionLearnLiteInfo?: TCurrentSubscription | null
    isLearnLite?: boolean
    isPageWithoutUpgrade?: boolean
}

export const getCurrentUpgradeMode = ({
    isPro,
    currentSubscriptionId,
    isLearnLite,
    isPageWithoutUpgrade,
    currentSubscriptionLearnLiteInfo,
}: TUpgradeMode): TCheckCurrentUpgradeMode => {
    if (
        currentSubscriptionId &&
        isLearnLite &&
        currentSubscriptionLearnLiteInfo &&
        plansForUpgradeLite.includes(currentSubscriptionLearnLiteInfo?.productId)
    ) {
        return {
            typeUpgrade: platform.isIos
                ? marketingConstants.iosUpgrade
                : marketingConstants.androidUpgrade,
            params: { ui: 'upgrade_app', type: 'learning' },
        }
    }

    if (
        currentSubscriptionId &&
        isPro &&
        plansForUpgrade.includes(currentSubscriptionId) &&
        !isPageWithoutUpgrade
    ) {
        return {
            typeUpgrade: platform.isIos
                ? marketingConstants.iosUpgrade
                : marketingConstants.androidUpgrade,
            params: { ui: 'upgrade_app', type: 'official' },
        }
    }

    if (
        currentSubscriptionId &&
        isPro &&
        currentSubscriptionId === marketingConstants.oldAppInstallProductId &&
        !isPageWithoutUpgrade
    ) {
        return {
            typeUpgrade: '',
            params: { ui: 'buy_pro_plus', type: 'official' },
        }
    }

    if (
        currentSubscriptionId &&
        isPro &&
        !plansForUpgrade.includes(currentSubscriptionId) &&
        !isPageWithoutUpgrade
    ) {
        return {
            typeUpgrade: marketingConstants.webUpgrade,
            params: { ui: 'upgrade_other', type: 'official' },
        }
    }
    return { typeUpgrade: '', params: { ui: 'buy_pro_plus', type: 'official' } }
}
