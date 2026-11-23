import { useIsNewAppConcept } from '@mu-native/ab'

import ScreenLibrary from '../../../../../App/Library/ScreenLibrary'

import { LibraryScreen } from './LibraryScreen'

// Both branches report from inside. Do not wrap here as well: the two would share the global
// `tracker-Library-*` marks and whichever finished first would win.
export const LibraryRootScreen = () => {
    const isNewConcept = useIsNewAppConcept()

    return isNewConcept ? <LibraryScreen /> : <ScreenLibrary />
}
