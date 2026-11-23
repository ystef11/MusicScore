import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { omrTestIds } from '@mu/mu-mobile-test-id'
import { layoutHelpers, MuseButton } from '@mu-native/ds'
import { chevronDown } from '@mu-native/icons/chevronDown'

const styles = StyleSheet.create({
    closeButtonCircle: {
        position: 'absolute',
        left: layoutHelpers.getResponsiveSizeExtended(20),
        top: layoutHelpers.getResponsiveSizeExtended(60),
        transform: [{ rotateZ: '90deg' }],
    },
    zIndex1: {
        zIndex: 1,
    },
})

export const CloseLayerCircle = memo(({ goBack }: { goBack: () => void }) => (
    <MuseButton
        testID={omrTestIds.camera.closeButton}
        style={styles.closeButtonCircle}
        type="secondary"
        startIcon={chevronDown}
        onPress={goBack}
    />
))
