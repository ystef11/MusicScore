import React from 'react'

import { InitStoreChunksContainer } from './containers/setup/InitStoreChunksContainer'
import { SetupApiContainer } from './containers/setup/SetupApiContainer'
import { SetupAuthTokenContainer } from './containers/setup/SetupAuthTokenContainer'
import { LoadKoreanFontContainer } from './containers/setup/LoadKoreanFontContainer'

const AppSetupContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <LoadKoreanFontContainer />
            <InitStoreChunksContainer>
                <SetupApiContainer>
                    <SetupAuthTokenContainer>{children}</SetupAuthTokenContainer>
                </SetupApiContainer>
            </InitStoreChunksContainer>
        </>
    )
}

export default AppSetupContainer
