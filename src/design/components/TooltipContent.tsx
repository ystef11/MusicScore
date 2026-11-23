import { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { close as closeIcon } from '@mu-native/icons/close'

import { colors } from '../constants/colors'
import { brandColors } from '../constants/new/brandColors.ts'
import { MuseButton } from '../elements/buttons/MuseButton.tsx'
import { layoutHelpers } from '../helpers/layout'

import { AppText } from './AppText/AppText'
import Icon from './Icon/Icon'

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(16),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(16),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(4),
        width: layoutHelpers.getResponsiveSizeExtended(242),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
        fontWeight: '500',
        color: colors.white,
    },
    body: {
        paddingTop: layoutHelpers.getResponsiveSizeExtended(16),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(8),
    },
    bodyNoHeader: {
        paddingTop: 0,
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(12),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        flex: 1,
        fontSize: layoutHelpers.getResponsiveSizeExtended(14),
        color: brandColors.contentSecondary,
    },
    badge: {
        backgroundColor: brandColors.accentPrimary,
        borderRadius: 2,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    extraMargin: { marginBottom: 4 },
})

type TTooltipContentProps = {
    title?: string
    body: string
    buttonText?: string
    onButtonPress?: () => void
    onClose: () => void
    customContainerStyle?: ViewStyle
    currentStep?: number
    dataLength?: number
    badgeText?: string
    hideCloseButton?: boolean
}

const TooltipContent = ({
    title,
    body,
    dataLength,
    currentStep,
    buttonText,
    badgeText,
    onButtonPress,
    onClose,
    customContainerStyle,
    hideCloseButton,
}: TTooltipContentProps) => {
    const hasHeader = !!badgeText || !!title || !hideCloseButton
    return (
        <View style={[styles.container, !!customContainerStyle && customContainerStyle]}>
            {hasHeader && (
                <View style={styles.header}>
                    {!!badgeText && (
                        <View style={styles.badge}>
                            <AppText
                                textTransform="uppercase"
                                brandColor="backgroundDefault"
                                font="f12w600"
                                rawText={badgeText}
                            />
                        </View>
                    )}
                    {!badgeText && !!title && (
                        <AppText
                            font="f17w600"
                            brandColor="backgroundDefault"
                            adaptiveSize
                            rawText={title}
                        />
                    )}
                    {!hideCloseButton && (
                        <TouchableOpacity
                            testID={scoreTestIds.scoreOnboardingTooltipClose}
                            onPress={onClose}
                            hitSlop={8}
                        >
                            <Icon source={closeIcon} tint={brandColors.contentTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
            <View style={[styles.body, !hasHeader && styles.bodyNoHeader]}>
                {!!badgeText && !!title && (
                    <View style={styles.extraMargin}>
                        <Text style={styles.headerText}>{title}</Text>
                    </View>
                )}
                <AppText
                    font="f15w400"
                    adaptiveSize
                    brandColor="backgroundDefault"
                    rawText={body}
                />
            </View>
            {currentStep !== undefined && dataLength !== undefined && (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>{`${currentStep + 1}/${dataLength}`}</Text>
                    {!!buttonText && (
                        <MuseButton
                            type="tertiaryUnderlined"
                            title={buttonText}
                            onPress={onButtonPress}
                            titleColor="exceptionConstantLight"
                        />
                    )}
                </View>
            )}
        </View>
    )
}

export default memo(TooltipContent)
