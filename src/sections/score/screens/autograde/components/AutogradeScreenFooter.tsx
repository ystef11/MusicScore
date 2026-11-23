import { StyleSheet } from 'react-native'

import { SafeAreaView } from '@mu-native/ds'

import { AutogradePlayButton } from './AutogradePlayButton.tsx'
import { AutogradeRecordingButton } from './AutogradeRecordingButton.tsx'
import { AutogradeTimeline } from './AutogradeTimeline.tsx'

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 12,
    },
})

export const AutogradeScreenFooter = () => {
    return (
        <SafeAreaView style={styles.container} edges={['right']}>
            <AutogradePlayButton />
            <AutogradeTimeline />
            <AutogradeRecordingButton />
        </SafeAreaView>
    )
}
