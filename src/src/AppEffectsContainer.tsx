import React from 'react'
import { AppUpdateController } from '../App/Services/AppUpdates'

import { CheckActiveDecorContainer } from '@mu-native/dynamic-decor'

import { PushNotificationProvider } from '@mu-native/pushNotifications'
import { AppStateContainer, OrientationContainer } from '@mu-native/system'

import { AuthChangeContainer } from './containers/auth/AuthChangeContainer'
import { CheckMarketingLogicContainer } from './containers/marketing/CheckMarketingLogic'
import { CheckRightsContainer } from './containers/marketing/CheckRightsContainer'
import { PreloadDecorContainer } from './containers/marketing/PreloadDecorContainer'
import { UpdateRightsContainer } from './containers/marketing/UpdateRightsContainer'
import { DailyRemindersEffectsContainer } from './containers/setup/DailyRemindersEffectsContainer'
import { InitPlayerContainer } from './containers/setup/InitPlayerContainer.tsx'
import { NetInfoWrapper } from './containers/setup/NetInfoContainer'

const AppEffectsContainer = () => {
    return (
        <>
            <CheckMarketingLogicContainer />
            <UpdateRightsContainer />
            <AuthChangeContainer />
            <AppStateContainer />
            <OrientationContainer />
            <NetInfoWrapper />



            <CheckRightsContainer />

            <CheckActiveDecorContainer />
            <PreloadDecorContainer />

            <PushNotificationProvider />
            {/* <CheckOmrScanningContainer /> */}
            <DailyRemindersEffectsContainer />
            <InitPlayerContainer />
            <AppUpdateController />

        </>
    )
}

export default React.memo(AppEffectsContainer)
