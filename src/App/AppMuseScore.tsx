import React, { useCallback, useEffect } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'
import * as RNFS from '@dr.pogodin/react-native-fs'

import { authStoreChunk } from '@mu-native/auth'
import { platform } from '@mu-native/common'
import { DebugButtonContainer } from '@mu-native/debug'
import { CheckDynamicContentContainer } from '@mu-native/dynamic-decor'
import { billingThunks, marketingStorage, marketingStoreChunk, } from '@mu-native/marketing'
import { offlineScoresStoreChunk } from '@mu-native/offlineScores'
import { loadTourAnswerThunk } from '@mu-native/quiz'
import { scoreThunks } from '@mu-native/score'
import { Orientation } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'
import { AppNavigator } from '../src/navigation/appNavigator/AppNavigator'

import StoragePermissionModal from './Components/StoragePermissionModal/StoragePermissionModal.tsx'
import ProcessingModal from './Elements/ProcessingModal'
import { exists, mkdir } from './Services/FilesProvider.ts'
import { isIOS } from './Utils/Platform'
import Spotlight from './Utils/Spotlight'

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

const checkCachedScoresDirectory = async () => {
    const cachedScoresDirectory = `${RNFS.TemporaryDirectoryPath}/Cached`
    const isExists = await exists(cachedScoresDirectory)

    if (!isExists) {
        await mkdir(cachedScoresDirectory)
    }
}

const useSpotlight = () => {
    const actions = useActions({
        handleOpenScoreDeepLink: scoreThunks.handleOpenDeepLinkURL,
    })

    useEffect(() => {
        if (isIOS) {
            const handleSpotlightItem = (uniqueIdentifier: string | undefined) => {
                if (uniqueIdentifier) {
                    actions.handleOpenScoreDeepLink(uniqueIdentifier)
                }
            }
            Spotlight.getInitialSpotlightItem().then(handleSpotlightItem)
            const spotlightListener =
                Spotlight?.addOnSpotlightItemOpenEventListener?.(handleSpotlightItem)
            return () => {
                spotlightListener.remove()
            }
        }
        return () => null
    }, [])
}

const useOnAppLaunch = () => {
    const actions = useActions({
        handleOpenScoreDeepLink: scoreThunks.handleOpenDeepLinkURL,
        setCustomLaunchInfo: marketingStoreChunk.actions.setCustomLaunchInfo,
        updateQuizData: loadTourAnswerThunk,
        setAuthModalVisible: authStoreChunk.actions.setIsVisible,
    })

    const checkStartMode = useCallback(() => {
        actions.setCustomLaunchInfo({})
    }, [])

    const loadTourAnswers = () => {
        if (marketingStorage.get('tourInstallshown')) actions.updateQuizData()
    }

    useSpotlight()

    const asyncActionsOnLaunch = async () => {
        await checkCachedScoresDirectory()
    }

    useEffect(() => {

        actions.setAuthModalVisible(false)

        checkStartMode()

        if (!platform.isTablet) Orientation.lockToPortrait()

        loadTourAnswers()

        asyncActionsOnLaunch()
    }, [])

}

const AppMuseScore = () => {
    const [fileProcessingState] = useValues([offlineScoresStoreChunk.props.getFileProcessingState])

    useOnAppLaunch()

    const isProcessing = fileProcessingState.progress > 0

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <AppNavigator />
            {isProcessing && <ProcessingModal />}

            <DebugButtonContainer />
            <CheckDynamicContentContainer />
            <StoragePermissionModal />

        </View>
    )
}

export default AppMuseScore
