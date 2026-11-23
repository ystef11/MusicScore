import { memo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { AppText, brandColors, globalStyles, MuseButton, Slider } from '@mu-native/ds'
import { eye } from '@mu-native/icons/eye'
import { eyeClosed } from '@mu-native/icons/eyeClosed'
import { TScorePart } from '@mu-native/score'

import useMixerPartItemProps from '../../../hooks/useMixerPartItemProps'

export const MixerSettingPartItem = memo(({ item, index }: { item: TScorePart; index: number }) => {
    const {
        onChangeVisibility,
        onChangePlayability,
        volume,
        onChangeVolume,
        onVisibleLongPress,
        onPlayableLongPress,
        isVisible,
        isPlayable,
        allPlayable,
    } = useMixerPartItemProps(item)
    const previousValue = useRef(volume)
    const onToggleMute = () => {
        if (volume !== 0) {
            previousValue.current = volume
            onChangeVolume(0)
        } else {
            onChangeVolume(previousValue.current)
        }
    }
    return (
        <View style={styles.container}>
            <View style={styles.settingsWrapper}>
                <MuseButton
                    onPress={onChangeVisibility}
                    onLongPress={onVisibleLongPress}
                    type={isVisible ? 'secondary' : 'secondaryMultilayer'}
                    size="large"
                    startIcon={isVisible ? eye : eyeClosed}
                />
                <View style={styles.sliderWrapper}>
                    <AppText font="f17w400" rawText={item.partName} />
                    <Slider
                        maximumTrackTintColor={brandColors.colorBackgroundDisabled}
                        minimumTrackTintColor={brandColors.contentPrimary}
                        bubbleBackgroundColor={brandColors.contentPrimary}
                        style={globalStyles.fullWidth}
                        value={volume}
                        minimumValue={0}
                        maximumValue={1}
                        onSlidingComplete={onChangeVolume}
                    />
                </View>
                <View style={styles.buttonsWrapper}>
                    <MuseButton
                        type={isPlayable || allPlayable ? 'secondaryMultilayer' : 'secondary'}
                        title="S"
                        onPress={onChangePlayability}
                        onLongPress={onPlayableLongPress}
                        testID={scoreTestIds.scoreMixerPartSoloButton(index)}
                    />
                    <MuseButton
                        type={volume === 0 ? 'secondaryMultilayer' : 'secondary'}
                        title="M"
                        onPress={onToggleMute}
                    />
                </View>
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        height: 88,
        justifyContent: 'center',
    },
    settingsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 12,
    },

    sliderWrapper: {
        flex: 1,
    },
    icon: {
        width: 24,
        height: 24,
        margin: 10,
    },
    buttonsWrapper: {
        flexDirection: 'row',
        columnGap: 8,
    },
    button: {
        paddingLeft: 12,
        paddingRight: 12,
    },
})
