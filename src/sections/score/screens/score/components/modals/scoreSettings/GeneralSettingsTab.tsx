import { memo } from 'react'
import { ScrollView } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { Divider, NativeBottomSheet, SheetTitle, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { HQSoundSection } from './HQSoundSection'
import KeyboardSection from './KeyboardSection.tsx'
import PageLayoutSection from './PageLayoutSection'
import {
    MixerSettingsRow,
    PracticeModeSettingsRow,
    ZoomSettingsRow,
} from './ScoreSettingsActionRows'
import { TranspositionSection } from './TranspositionSection'

type TProps = {
    isPDF: boolean
    /**
     * Hides the transposition section. Used by the new Score Play View, which
     * exposes transposition through its own dedicated sheet (MUP-13932). The
     * legacy player keeps it inside the general settings sheet.
     */
    hideTransposition?: boolean
    /**
     * Hides the keyboard section. Used by the new Score Play View, which drops
     * the keyboard toggle from settings for the experiment (MUP-13932). The
     * legacy player keeps it inside the general settings sheet.
     */
    hideKeyboard?: boolean
    /**
     * Shows the Zoom / Practice mode / Mixer rows of the new Score Play View
     * settings sheet (MUP-13932). The legacy player exposes these as toolbar
     * buttons instead, so it keeps them out of the settings sheet.
     */
    showScoreActions?: boolean
}

const GeneralSettingsTab = memo(
    ({ isPDF, hideTransposition, hideKeyboard, showScoreActions }: TProps) => {
        const inset = useAppSafeArea({ bottom: 32 })

        return (
            <ScrollView contentContainerStyle={{ paddingBottom: inset.bottom }}>
                <PageLayoutSection />
                {!!showScoreActions && !isPDF && (
                    <>
                        <Divider />
                        <ZoomSettingsRow />
                    </>
                )}
                {!isPDF && (
                    <>
                        <Divider />
                        <HQSoundSection />
                        {!hideKeyboard && <KeyboardSection />}
                        {!!showScoreActions && (
                            <>
                                <Divider />
                                <PracticeModeSettingsRow />
                                <Divider />
                                <MixerSettingsRow />
                            </>
                        )}
                        {!hideTransposition && (
                            <>
                                <Divider />
                                <TranspositionSection />
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        )
    },
)

export const GeneralSettingsSheet = memo(
    ({
        isPDF,
        hideTransposition,
        hideKeyboard,
        showScoreActions,
        maxWidth,
        centerOnTablet,
    }: TProps & { maxWidth?: number; centerOnTablet?: boolean }) => {
        return (
            <NativeBottomSheet
                name="scoreSettingsSheet"
                maxWidth={maxWidth}
                centerOnTablet={centerOnTablet}
            >
                <SheetTitle
                    title={
                        isPDF
                            ? translate('native.score.display_settings')
                            : translate('native.key_words.settings')
                    }
                    titleTestID={scoreTestIds.scoreSheetTitle}
                />
                <GeneralSettingsTab
                    isPDF={isPDF}
                    hideTransposition={hideTransposition}
                    hideKeyboard={hideKeyboard}
                    showScoreActions={showScoreActions}
                />
            </NativeBottomSheet>
        )
    },
)
