import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, Icon, layoutHelpers } from '@mu-native/ds'
import { cancelCircle } from '@mu-native/icons/cancelCircle'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'

import type { TCurrentSubscription } from '../../../../types/marketingTypes'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    benefit: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: getResponsiveSizeExtended(12),
    },
    text: {
        flex: 1,
        marginLeft: getResponsiveSizeExtended(12),
    },
})

type TPurchaseSuccessBenefitsComponentProps = {
    featureList: TCurrentSubscription['featureList']
}

export const PurchaseSuccessBenefitsComponent = memo(
    ({ featureList }: TPurchaseSuccessBenefitsComponentProps) => (
        <>
            {featureList.map(({ title, isDisabled }) => (
                <View key={title} style={styles.benefit}>
                    <Icon
                        source={isDisabled ? cancelCircle : checkmarkCircle}
                        size={20}
                        tint={
                            isDisabled
                                ? brandColors.contentInactive
                                : brandColors.exceptionConstantLight
                        }
                    />
                    <AppText
                        adaptiveSize
                        font="f15w400"
                        brandColor={isDisabled ? 'contentInactive' : 'exceptionConstantLight'}
                        rawText={title}
                        style={styles.text}
                    />
                </View>
            ))}
        </>
    ),
)
