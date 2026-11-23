import { memo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import Animated, { SlideInDown } from 'react-native-reanimated'

import {
    AppText,
    brandColors,
    globalStyles,
    layout,
    layoutHelpers,
    MuseButton,
    useAppSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { usePurchaseSuccessPlan } from '../hooks/usePurchaseSuccessPlan'

import { PurchaseSuccessBenefitsComponent } from './components/PurchaseSuccessBenefitsComponent'
import { PurchaseSuccessBillingsComponent } from './components/PurchaseSuccessBillingsComponent'

const { getResponsiveSizeExtended } = layoutHelpers

const slideDuration = 500

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
        paddingHorizontal: getResponsiveSizeExtended(20),
        paddingBottom: getResponsiveSizeExtended(20),
    },
    title: {
        marginBottom: getResponsiveSizeExtended(24),
    },
    footer: {
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
        paddingHorizontal: getResponsiveSizeExtended(20),
        paddingTop: getResponsiveSizeExtended(12),
        borderTopWidth: 1,
        borderTopColor: brandColors.strokeDefault,
    },
})

type TPurchaseSuccessPlanComponentProps = {
    onClose: () => void
}

export const PurchaseSuccessPlanComponent = memo(
    ({ onClose }: TPurchaseSuccessPlanComponentProps) => {
        const insets = useAppSafeArea({ bottom: 20 })
        const { title, featureList, billings } = usePurchaseSuccessPlan()

        return (
            <Animated.View
                entering={SlideInDown.duration(slideDuration)}
                style={[styles.container, { paddingBottom: insets.bottom }]}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    <AppText
                        adaptiveSize
                        font="f44w400Accent"
                        brandColor="exceptionConstantLight"
                        rawText={translate('native.marketing.purchase_success.plan_unlocked', {
                            plan: title,
                        })}
                        style={styles.title}
                    />
                    <PurchaseSuccessBillingsComponent billings={billings} />
                    <PurchaseSuccessBenefitsComponent featureList={featureList} />
                </ScrollView>
                <View style={styles.footer}>
                    <MuseButton
                        title={translate('native.marketing.continue')}
                        onPress={onClose}
                        style={globalStyles.fullWidth}
                    />
                </View>
            </Animated.View>
        )
    },
)
