import { useLayoutEffect } from 'react'

import { translate } from '@mu-native/locale'
import { useAppNavigation } from '@mu-native/navigation'

import { NavHeader } from '../../App/Components/NavHeader/NavHeader.tsx'

import { ShazamArtistFallbackView } from './components/ShazamArtistFallbackView.tsx'
import { ShazamErrorView } from './components/ShazamErrorView.tsx'
import { ShazamListeningView } from './components/ShazamListeningView.tsx'
import { ShazamMatchedView } from './components/ShazamMatchedView.tsx'
import { ShazamNoMatchView } from './components/ShazamNoMatchView.tsx'
import { ShazamNoScoresView } from './components/ShazamNoScoresView.tsx'
import { useShazamSession } from './useShazamSession.ts'

export const ShazamResultsScreen = () => {
    const navigation = useAppNavigation()
    const { state, mode, restart } = useShazamSession()

    const isFullScreen =
        state.kind === 'listening' || state.kind === 'matching' || state.kind === 'matched'

    useLayoutEffect(() => {
        if (isFullScreen) {
            navigation.setOptions({ headerShown: false })
        } else {
            navigation.setOptions({
                headerShown: true,
                // eslint-disable-next-line react/no-unstable-nested-components
                header: () => (
                    <NavHeader
                        headerTitle={translate('native.identify_song_button_title')}
                        noNotifications
                    />
                ),
            })
        }
    }, [navigation, isFullScreen])

    const goBack = () => navigation.goBack()

    switch (state.kind) {
        case 'listening':
            return <ShazamListeningView phase={state.phase} onClose={goBack} />
        case 'matching':
            return <ShazamListeningView phase="matching" onClose={goBack} />
        case 'matched':
            if (mode === 'artist') {
                return <ShazamArtistFallbackView match={state.match} onBackPress={goBack} />
            }
            if (mode === 'empty') {
                return <ShazamNoScoresView match={state.match} onBackPress={goBack} />
            }
            return <ShazamMatchedView match={state.match} onBackPress={goBack} />
        case 'no-match':
            return <ShazamNoMatchView onTryAgain={restart} />
        case 'error':
            return <ShazamErrorView message={state.message} onBackPress={goBack} />
        default:
            return null
    }
}
