import { memo, useEffect } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { dismissFittedPresented } from 'react-native-sheet2'

import { omrTestIds } from '@mu/mu-mobile-test-id'
import {
    AppText,
    brandColors,
    globalStyles,
    Icon,
    icons,
    layoutHelpers,
    staticSafeArea,
    MuseButton,
} from '@mu-native/ds'
import { cancelCircle } from '@mu-native/icons/cancelCircle'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'
import { translate } from '@mu-native/locale'
import { NavigationService, Screen } from '@mu-native/navigation'

import reportEvent from '../../../../App/Utils/Analytics.ts'

const styles = StyleSheet.create({
    imageScoreRulesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: layoutHelpers.getResponsiveSizeExtended(16),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(32),
    },
    scoreImageStyle: {
        width: layoutHelpers.getResponsiveSizeExtended(160),
        maxWidth: layoutHelpers.getResponsiveSizeExtended(160),
        height: layoutHelpers.getResponsiveSizeExtended(240),
    },
    instructionTextContainer: {
        justifyContent: 'center',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(12),
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        backgroundColor: brandColors.contentPrimary,
        width: layoutHelpers.getResponsiveSizeExtended(4),
        height: layoutHelpers.getResponsiveSizeExtended(4),
        borderRadius: 50,
    },
    ruleBlockStyle: {
        gap: layoutHelpers.getResponsiveSizeExtended(4),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(24),
        paddingLeft: layoutHelpers.getResponsiveSizeExtended(8),
    },
    rulesPhotoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
})

export const OmrPhotoRulesComponent = memo(() => {
    const onPressScanNow = () => {
        dismissFittedPresented()
        NavigationService.navigate(Screen.screenOmrMain)
    }

    useEffect(() => {
        reportEvent('Temp Upload Step Show', { value: 'scan_tutorial' })
    }, [])

    const instructionsData = [
        translate('native.screen_omr.tip_keep_page_in_frame'),
        translate('native.screen_omr.tip_hold_steady'),
        translate('native.screen_omr.tip_one_page_per_photo'),
        translate('native.screen_omr.tip_shoot_straight_down'),
    ]

    return (
        <>
            <AppText
                testID={omrTestIds.photoRules.title}
                rawText={translate('native.screen_omr.how_to_scan_title')}
                textAlign="center"
                adaptiveSize
                font="f44w400Accent"
                style={globalStyles.mb24}
            />
            <View style={styles.imageScoreRulesContainer}>
                <View>
                    <View
                        testID={omrTestIds.photoRules.incorrectExample}
                        style={styles.instructionTextContainer}
                    >
                        <Icon source={cancelCircle} tint={brandColors.statusError} />
                        <AppText
                            rawText={translate('native.screen_omr.incorrect')}
                            adaptiveSize
                            font="f20w600"
                            brandColor="statusError"
                            style={globalStyles.ml8}
                        />
                    </View>
                    <Image source={icons.scoreScanFail} style={styles.scoreImageStyle} />
                </View>
                <View>
                    <View
                        testID={omrTestIds.photoRules.correctExample}
                        style={styles.instructionTextContainer}
                    >
                        <Icon source={checkmarkCircle} tint={brandColors.statusSuccess} />
                        <AppText
                            rawText={translate('native.screen_omr.correct')}
                            adaptiveSize
                            font="f20w600"
                            brandColor="statusSuccess"
                            textAlign="center"
                            style={globalStyles.ml8}
                        />
                    </View>
                    <Image source={icons.scoreScanSuccess} style={styles.scoreImageStyle} />
                </View>
            </View>
            <AppText
                testID={omrTestIds.photoRules.generalTipsTitle}
                adaptiveSize
                font="f20w600"
                rawText={translate('native.screen_omr.general_tips')}
                style={globalStyles.mb8}
            />
            <View style={styles.ruleBlockStyle}>
                {instructionsData.map((item, index) => (
                    <View key={index} style={styles.rulesPhotoContainer}>
                        <View style={styles.dot} />
                        <AppText
                            adaptiveSize
                            rawText={item}
                            font="f17w400"
                            style={globalStyles.ml8}
                        />
                    </View>
                ))}
            </View>
            <MuseButton
                testID={omrTestIds.photoRules.takePhotoButton}
                title={translate('native.screen_omr.take_photo')}
                onPress={onPressScanNow}
                style={{ marginBottom: staticSafeArea().bottomWithAndroid }}
            />
        </>
    )
})
