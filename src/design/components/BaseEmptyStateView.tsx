import React from 'react'
import { StyleSheet, View } from 'react-native'

import { globalStyles, layout, staticSafeArea } from '../constants/layout'
import { brandColors } from '../constants/new/brandColors.ts'
import { MuseButton } from '../elements/buttons/MuseButton.tsx'
import { CommonTouchable } from '../elements/CommonTouchable.tsx'

import { AppText } from './AppText/AppText'
import Icon, { type IconSource } from './Icon/Icon'

interface Props {
    title: string
    description: string
    icon: IconSource
    primaryButton?: {
        title: string
        onPress: () => void
    }

    footerSecondaryButton?: {
        title: string
        onPress: () => void
    }
}

export const BaseEmptyStateView: React.FC<Props> = props => {
    return (
        <View style={styles.base}>
            <Icon source={props.icon} size={40} tint={brandColors.contentPrimary} />
            <AppText
                textAlign="center"
                rawText={props.title}
                font="f20w600"
                style={globalStyles.mt16}
            />
            <AppText
                textAlign="center"
                rawText={props.description}
                brandColor="contentSecondary"
                font="f17w400"
                style={globalStyles.mt2}
            />
            {!!props.primaryButton && (
                <MuseButton
                    title={props.primaryButton.title}
                    onPress={props.primaryButton.onPress}
                    style={globalStyles.mt16}
                />
            )}

            {!!props.footerSecondaryButton && (
                <CommonTouchable
                    style={styles.bottomButton}
                    onPress={props.footerSecondaryButton.onPress}
                >
                    <AppText
                        font="f15w400"
                        rawText={props.footerSecondaryButton.title}
                        style={styles.underline}
                    />
                </CommonTouchable>
            )}
        </View>
    )
}
BaseEmptyStateView.displayName = 'BaseEmptyStateView'

const styles = StyleSheet.create({
    base: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layout.baseMarginFromEdges,
    },

    bottomButton: {
        position: 'absolute',
        bottom: staticSafeArea().bottom + 16,
    },

    underline: {
        textDecorationLine: 'underline',
    },
})
