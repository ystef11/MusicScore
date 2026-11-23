import { memo } from 'react'
import { FlatList, StyleSheet } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { NativeBottomSheet, SheetTitle, staticSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { getCurrentScoreParts, TScorePart } from '@mu-native/score'
import { useValues } from '@ug/store'

import { MixerSettingPartItem } from './MixerSettingPartItem.tsx'

const styles = StyleSheet.create({
    container: {
        paddingTop: 12,
    },
})

const renderMixerBlock = ({ item, index }: { item: TScorePart; index: number }) => {
    return <MixerSettingPartItem item={item} index={index} />
}

const MixerSettingsTab = memo(() => {
    const [parts] = useValues([getCurrentScoreParts])

    return (
        <>
            <SheetTitle
                title={translate('native.screens_titles.mixer_screen')}
                titleTestID={scoreTestIds.scoreSheetTitle}
            />
            <FlatList
                data={parts}
                renderItem={renderMixerBlock}
                contentContainerStyle={[
                    styles.container,
                    { paddingBottom: staticSafeArea().bottomWithAndroid },
                ]}
            />
        </>
    )
})

export const MixerSettingsSheet = memo(
    ({ maxWidth, centerOnTablet }: { maxWidth?: number; centerOnTablet?: boolean }) => {
        return (
            <NativeBottomSheet
                title=""
                name="mixerSheet"
                maxWidth={maxWidth}
                centerOnTablet={centerOnTablet}
            >
                <MixerSettingsTab />
            </NativeBottomSheet>
        )
    },
)
