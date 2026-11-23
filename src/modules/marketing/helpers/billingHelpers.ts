import { platform } from '@mu-native/common'

import { marketingConstants } from '../constants/marketingConstants'

const getAccessRightsByPlatform = () => {
    if (platform.isAndroid) {
        return marketingConstants.accessRights.android
    }

    if (platform.isIos) {
        return marketingConstants.accessRights.ios
    }

    return null
}

const getAccessPlusRightsByPlatform = () => {
    if (platform.isAndroid) {
        return marketingConstants.accessRights.androidPlus
    }

    if (platform.isIos) {
        return marketingConstants.accessRights.iosPlus
    }

    return null
}

const getAccessLearningRightsByPlatform = () => {
    if (platform.isAndroid) {
        return marketingConstants.accessRights.androidLearning
    }

    if (platform.isIos) {
        return marketingConstants.accessRights.iosLearning
    }

    return null
}

const getAccessLearningLiteRightsByPlatform = () => {
    if (platform.isAndroid) {
        return marketingConstants.accessRights.androidLearningLite
    }

    if (platform.isIos) {
        return marketingConstants.accessRights.iosLearningLite
    }

    return null
}

const getAccessEbookRightsByPlatform = () => {
    if (platform.isAndroid) {
        return marketingConstants.accessRights.androidEbook
    }

    if (platform.isIos) {
        return marketingConstants.accessRights.iosEbook
    }

    return null
}

const getAccessAutoGradeLiteRightsByPlatform = () => {
    if (platform.isAndroid) {
        return marketingConstants.accessRights.androidAutoGrade
    }

    if (platform.isIos) {
        return marketingConstants.accessRights.iosAutoGrade
    }

    return null
}

const getAccessPremiumRightsByPlatform = () =>
    platform.isIos
        ? marketingConstants.accessRights.iosPremium
        : marketingConstants.accessRights.androidPremium

export const billingHelpers = {
    getAccessRightsByPlatform,
    getAccessPlusRightsByPlatform,
    getAccessLearningRightsByPlatform,
    getAccessLearningLiteRightsByPlatform,
    getAccessEbookRightsByPlatform,
    getAccessAutoGradeLiteRightsByPlatform,
    getAccessPremiumRightsByPlatform,
}
