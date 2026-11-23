import { Platform, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Video from 'react-native-video'

import { shazamTestIds } from '@mu/mu-mobile-test-id'
import { AppText, brandColors, CommonTouchable, Icon, LottieView } from '@mu-native/ds'
import { closeCompact } from '@mu-native/icons/closeCompact'
import { PlainLocaleKey, translate } from '@mu-native/locale'

const BACKGROUND_VIDEO_SOURCE =
    Platform.OS === 'ios'
        ? { uri: 'shazam_listening_bg.mp4' }
        : { uri: 'asset:/custom/shazam_listening_bg.mp4' }

export type ShazamListeningPhase = 'listening' | 'tough' | 'matching'

type Props = {
    phase: ShazamListeningPhase
    onClose: () => void
}

const COPY: Record<ShazamListeningPhase, { title: PlainLocaleKey; subtitle: PlainLocaleKey }> = {
    listening: {
        title: 'native.shazam.listening.title',
        subtitle: 'native.shazam.listening.subtitle',
    },
    tough: {
        title: 'native.shazam.listening.tough_title',
        subtitle: 'native.shazam.listening.tough_subtitle',
    },
    matching: {
        title: 'native.shazam.listening.matching_title',
        subtitle: 'native.shazam.listening.matching_subtitle',
    },
}

export const ShazamListeningView = ({ phase, onClose }: Props) => {
    const { title, subtitle } = COPY[phase]

    const titleBlock = (
        <View style={styles.titleBlock}>
            <AppText
                rawText={translate(title)}
                font="f44w400Accent"
                brandColor="exceptionConstantLight"
                textAlign="center"
                lineHeight={40}
            />
            <AppText
                rawText={translate(subtitle)}
                font="f15w400"
                brandColor="exceptionConstantLight"
                textAlign="center"
            />
        </View>
    )

    return (
        <View style={styles.container} testID={shazamTestIds.listening.screen}>
            <Video
                source={BACKGROUND_VIDEO_SOURCE}
                style={styles.backgroundVideo}
                repeat
                muted
                resizeMode="cover"
                playInBackground={false}
                disableFocus
            />
            <SafeAreaView style={styles.center} edges={['bottom']}>
                {titleBlock}
                <LottieView
                    style={styles.lottie}
                    source={require('@mu-native/ds/images/lottie/shazam_listening_wave.json')}
                    autoPlay
                    loop
                />
                {/* Invisible mirror so the lottie sits in the vertical center of the frame. */}
                <View
                    style={styles.titleBlockMirror}
                    aria-hidden
                    pointerEvents="none"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                >
                    {titleBlock}
                </View>
            </SafeAreaView>

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <CommonTouchable
                    onPress={onClose}
                    style={styles.closeButton}
                    testID={shazamTestIds.listening.closeButton}
                >
                    <Icon
                        source={closeCompact}
                        tint={brandColors.exceptionConstantLight}
                        size={20}
                    />
                </CommonTouchable>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.colorActionPrimaryDefault,
    },
    backgroundVideo: {
        ...StyleSheet.absoluteFill,
    },
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: brandColors.exceptionScrim,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    center: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        paddingHorizontal: 20,
    },
    titleBlock: {
        gap: 8,
        alignSelf: 'stretch',
    },
    titleBlockMirror: {
        opacity: 0,
        alignSelf: 'stretch',
    },
    lottie: {
        width: 240,
        height: 240,
    },
})
