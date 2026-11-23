import { useValues } from '@ug/store'
import { getIsAuthorized } from '@mu-native/auth'
import { useNetInfo } from '@mu-native/system'

export const NetInfoWrapper = () => {
    const [isAuthorized] = useValues([getIsAuthorized])

    useNetInfo(isAuthorized)

    return null
}
