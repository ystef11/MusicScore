import { platform } from '@mu-native/common'
import { TPlanTypeTourInstall } from '@mu-native/marketing'

import { subscriptionTourGroup } from '../constants.ts'

export const useGetSubscriptionGroup = (
    isActiveTourSwitcher: boolean,
): { subscriptionGroup: TPlanTypeTourInstall } => {
    const androidGroup = isActiveTourSwitcher
        ? subscriptionTourGroup.offScoreDoubt
        : subscriptionTourGroup.proDoubt
    const iosGroup = subscriptionTourGroup.offScoresGroup

    return {
        subscriptionGroup: platform.isIos ? iosGroup : androidGroup,
    }
}
