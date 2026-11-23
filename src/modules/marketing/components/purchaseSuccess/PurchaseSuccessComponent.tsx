import { memo, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { brandColors, colors } from '@mu-native/ds'

import { PurchaseSuccessBadgeComponent } from './components/PurchaseSuccessBadgeComponent'
import { PurchaseSuccessLogoAnimation } from './components/PurchaseSuccessLogoAnimation'
import { PurchaseSuccessPlanComponent } from './components/PurchaseSuccessPlanComponent'
import { PurchaseSuccessWavesComponent } from './components/PurchaseSuccessWavesComponent'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: brandColors.splash,
    },
    closeIcon: {
        tintColor: colors.white,
    },
    closeIconBg: {
        backgroundColor: brandColors.transparent,
    },
})

type TPurchaseSuccessComponentProps = {
    onClose: () => void
}

export const PurchaseSuccessComponent = memo(({ onClose }: TPurchaseSuccessComponentProps) => {
    const [isLogoAnimationFinished, setIsLogoAnimationFinished] = useState(false)

    const onLogoAnimationFinish = useCallback(() => setIsLogoAnimationFinished(true), [])

    return (
        <View style={styles.container}>
            {isLogoAnimationFinished && <PurchaseSuccessWavesComponent />}
            <PurchaseSuccessLogoAnimation onFinish={onLogoAnimationFinish} />
            {isLogoAnimationFinished && (
                <>
                    <PurchaseSuccessBadgeComponent />
                    <PurchaseSuccessPlanComponent onClose={onClose} />
                </>
            )}
        </View>
    )
})
