import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { PerformanceScreen, TrackedScreen } from '@mu-native/performance'
import { useValues } from '@ug/store'

import { ProfileScreenContainer } from '../../../../App/profileScreens/profileScreen/ProfileScreenContainer'

import { useLoadProfileScreenStore } from './store/useLoadProfileScreenStore'

export const ProfileScreen = () => {
    useLoadProfileScreenStore()
    // Signed out there is nothing to load: a static sign-in block, automatic path
    const [isAuthorized, userProfile] = useValues([
        getIsAuthorized,
        authStoreChunk.props.getUserProfile,
    ])

    return (
        <TrackedScreen
            screenName={PerformanceScreen.profile}
            interactive={isAuthorized ? !!userProfile : undefined}
        >
            <ProfileScreenContainer />
        </TrackedScreen>
    )
}

export { profileScreenStoreChunk } from './store/profileScreenStoreChunk.ts'
