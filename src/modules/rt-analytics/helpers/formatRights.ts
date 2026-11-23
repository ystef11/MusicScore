import { platform } from '@mu-native/common'
import { TAccessRight } from '@mu-native/marketing'

export function formatRights(userRights: TAccessRight[]) {
    if (!userRights) {
        return '0'
    }
    const rights = userRights.find(
        item => item.serviceName === `${platform.isIos ? 'ios' : 'android'}_mu_pro`,
    )
    if (!rights) {
        return '0'
    }

    const lifetime = rights?.lifetime || 0
    const trial = rights?.trial || 0
    const valid = rights?.valid || 0

    if (lifetime === 1) {
        return '3'
    }

    if (valid) {
        return trial === 1 ? '1' : '2'
    }

    return trial === 1 ? '-1' : '-2'
}
