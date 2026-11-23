import { memo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { AppText, brandColors, globalStyles, Icon, layoutHelpers, MuseButton } from '@mu-native/ds'
import { TIdCard } from '@mu-native/gift-checklist'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'
import { lock } from '@mu-native/icons/lock'
import { translate } from '@mu-native/locale'

const styles = StyleSheet.create({
    dayLabelBefore: { marginRight: layoutHelpers.getResponsiveSizeExtended(4) },
    lockIcon: {
        position: 'absolute',
        right: layoutHelpers.getResponsiveSizeExtended(20),
    },
    iconPosition: {
        position: 'absolute',
        right: 4,
        top: 4,
    },
    cardContainer: {
        width: '100%',
        height: layoutHelpers.getResponsiveSizeExtended(80),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(12),
        borderColor: brandColors.backgroundInactive,
        justifyContent: 'center',
    },
    hidden: { overflow: 'hidden' },
    buttonWrapper: {
        position: 'absolute',
        right: layoutHelpers.getResponsiveSizeExtended(20),
        alignSelf: 'center',
    },
    flexEnd: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
})

const indexTasksColor = {
    0: brandColors.accentPrimary,
    1: brandColors.colorViolet600,
    2: brandColors.colorViolet650,
    3: brandColors.colorViolet700,
    4: brandColors.colorViolet750,
    5: brandColors.colorViolet800,
    6: brandColors.colorViolet850,
} as const

type TTaskCardComponentProps = {
    isCompleted: boolean
    isActive: boolean
    index: number
    title: string
    isPlayRiveAnimation: boolean
    onPress: (id: TIdCard, isActive: boolean, index: number) => void
    id: TIdCard
}

const DAY_NUMBER_PLACEHOLDER = '\u0000'

const getDayLabelParts = () => {
    const [before = '', after = ''] = translate('native.marketing.gift_checklist.day_number', {
        number: DAY_NUMBER_PLACEHOLDER,
    }).split(DAY_NUMBER_PLACEHOLDER)

    return { dayLabelBefore: before.trim(), dayLabelAfter: after.trim() }
}

export const TaskCardComponent = memo(
    ({
        isCompleted,
        id,
        isActive,
        index,
        onPress,
        title,
    }: TTaskCardComponentProps) => {
        const { dayLabelBefore, dayLabelAfter } = getDayLabelParts()

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPress(id, isActive, index)}
                style={styles.hidden}
            >
                <View
                    style={[
                        styles.cardContainer,
                        {
                            backgroundColor: isCompleted
                                ? indexTasksColor[index as keyof typeof indexTasksColor]
                                : brandColors.backgroundDefault,
                            borderWidth: isCompleted ? 0 : 1,
                        },
                    ]}
                >
                    {!isCompleted && !isActive && (
                        <Icon
                            source={lock}
                            tint={brandColors.contentPrimary}
                            style={styles.lockIcon}
                        />
                    )}
                    {isCompleted && (
                        <Icon source={checkmarkCircle} size={16} style={styles.iconPosition} />
                    )}
                    {isCompleted && (
                        <AppText
                            adaptiveSize
                            font="f24w600"
                            textAlign="center"
                            brandColor="backgroundDefault"
                            rawText={title}
                        />
                    )}
                    {!isCompleted && (
                        <View style={styles.flexEnd}>
                            {!!dayLabelBefore && (
                                <AppText
                                    adaptiveSize
                                    font="f17w400"
                                    brandColor="contentPrimary"
                                    rawText={dayLabelBefore}
                                    lineHeight={31}
                                    style={styles.dayLabelBefore}
                                />
                            )}
                            <AppText
                                adaptiveSize
                                font="f56w400Accent"
                                brandColor="contentPrimary"
                                rawText={`${index + 1}`}
                            />
                            {!!dayLabelAfter && (
                                <AppText
                                    adaptiveSize
                                    font="f17w400"
                                    brandColor="contentPrimary"
                                    rawText={dayLabelAfter}
                                    lineHeight={31}
                                    style={globalStyles.ml4}
                                />
                            )}
                        </View>
                    )}
                    {isActive && !isCompleted && (
                        <View style={styles.buttonWrapper}>
                            <MuseButton
                                onPress={() => onPress(id, true, index)}
                                type="secondary"
                                title={translate('native.marketing.gift_checklist.tap_to_open')}
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        )
    },
)
