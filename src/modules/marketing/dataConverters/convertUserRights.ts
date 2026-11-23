import { platform } from '@mu-native/common'

import { type TCourseInfo } from '../../../App/Courses/coursesTypes'
import { type MSScoreT } from '../../../App/Model/MSScore'
import { type TAccessRight, TPaymentTypes } from '../types/marketingTypes'

type TUserRight = 'pro' | 'pro_plus' | 'learn' | 'one' | 'credit' | 'buy' | 'external'

const platformName = platform.isIos ? 'ios' : 'android'

const products = [
    `${platformName}_mu_pro`,
    `${platformName}_mu_off_scores`,
    `${platformName}_mu_edu_courses`,
]

const accessLevelsMap: Record<string, TUserRight> = {
    mu_pro: 'pro',
    mu_off_scores: 'pro_plus',
    mu_edu_courses: 'learn',
}

export enum rights {
    subscriptionExpired = -2,
    trialExpired = -1,
    none = 0,
    trial = 1,
    subscription = 2,
    lifetime = 3,
}

export const convertUserRights = (
    accesses: TAccessRight[],
    currentScore: MSScoreT | null,
    courseInfo: TCourseInfo | null,
) => {
    // A score bought on an external marketplace comes back as `isPurchased: true` with
    // `paymentType: 0` (MU took no money for it), so `paymentType` alone misses it and the
    // lifetime right would silently drop out of the event.
    const isExternalPurchase = Boolean(currentScore?.isPurchased && currentScore?.purchaseSource)

    if (currentScore?.paymentType || courseInfo?.payment_type || isExternalPurchase) {
        return {
            'user_rights.type': [
                ...(currentScore?.paymentType === TPaymentTypes.credit ? ['credit'] : []),
                ...(courseInfo?.payment_type === TPaymentTypes.credit ? ['credit'] : []),
                ...(currentScore?.paymentType === TPaymentTypes.oneTimePayment ? ['buy'] : []),
                ...(isExternalPurchase ? ['external'] : []),
            ],
            'user_rights.value': [rights.lifetime],
        }
    }

    const userRights = accesses.reduce<TUserRights>(
        (acc, current) => {
            if (!products.includes(current.serviceName)) {
                return acc
            }

            const level = current.serviceName.substring(platformName.length + 1)
            if (!Object.hasOwn(accessLevelsMap, level)) {
                return acc
            }

            const accessLevel = accessLevelsMap[level]
            if (accessLevel) acc['user_rights.type'].push(accessLevel)

            let value: number
            if (current.lifetime) {
                value = rights.lifetime
            } else if (current.valid) {
                value = current.trial ? rights.trial : rights.subscription
            } else {
                value = current.trial ? rights.trialExpired : rights.subscriptionExpired
            }

            if (value) acc['user_rights.value'].push(value)
            return acc
        },
        {
            'user_rights.type': [],
            'user_rights.value': [],
        },
    )

    return userRights
}

export type TUserRights = {
    'user_rights.type': string[]
    'user_rights.value': rights[]
}
