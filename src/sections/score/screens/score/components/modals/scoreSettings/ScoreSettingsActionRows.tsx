import { memo } from 'react'
import { dismissFittedSheet } from 'react-native-sheet2'

import { usePracticeModeFeatureFlag } from '@mu-native/ab'
import {
    BrandBaseListCell,
    brandColors,
    Icon,
    IconSource,
    nativePresentFittedSheet,
} from '@mu-native/ds'
import { mixer } from '@mu-native/icons/mixer'
import { sparkles } from '@mu-native/icons/sparkles'
import { zoomIn } from '@mu-native/icons/zoomIn'
import { translate } from '@mu-native/locale'

import { useAutoGradeLogic } from '../../../hooks/useAutoGradeLogic'

const RightIcon = ({ source, size = 20 }: { source: IconSource; size?: number }) => (
    <Icon source={source} size={size} tint={brandColors.contentPrimary} />
)

// Presenting another sheet from inside the open settings sheet — dismiss it
// first so the sheets don't stack (mirrors HQSoundSection's pattern).
const openSheet = (name: 'zoomSheet' | 'mixerSheet') => {
    dismissFittedSheet('scoreSettingsSheet')
    nativePresentFittedSheet(name)
}

/** "Zoom" row — opens the note-size (zoom) sheet. */
export const ZoomSettingsRow = memo(() => (
    <BrandBaseListCell
        title={translate('native.score.settings.zoom')}
        rightComponent={<RightIcon source={zoomIn} />}
        onPress={() => openSheet('zoomSheet')}
    />
))
ZoomSettingsRow.displayName = 'ZoomSettingsRow'

/** "Mixer" row — opens the mixer sheet. */
export const MixerSettingsRow = memo(() => (
    <BrandBaseListCell
        title={translate('native.screens_titles.mixer_screen')}
        rightComponent={<RightIcon source={mixer} />}
        onPress={() => openSheet('mixerSheet')}
    />
))
MixerSettingsRow.displayName = 'MixerSettingsRow'

/** "Practice mode" row — navigates to autograde. Hidden unless the practice-mode
 * experiment is on or the user already has autograde rights. */
export const PracticeModeSettingsRow = memo(() => {
    const showFlag = usePracticeModeFeatureFlag()
    const { isAutoGradeRights, onNavigateAutoGradeScreen } = useAutoGradeLogic()

    if (!showFlag && !isAutoGradeRights) return null

    return (
        <BrandBaseListCell
            title={translate('native.score.settings.practice_mode')}
            rightComponent={<RightIcon source={sparkles} size={24} />}
            onPress={() => {
                dismissFittedSheet('scoreSettingsSheet')
                onNavigateAutoGradeScreen()
            }}
        />
    )
})
PracticeModeSettingsRow.displayName = 'PracticeModeSettingsRow'
