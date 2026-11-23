import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppText, CommonTouchable, globalStyles } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useAppNavigation } from '@mu-native/navigation'

const styles = StyleSheet.create({
    underLineText: {
        textDecorationLine: 'underline',
    },
})
export const ViewAllPlansComponent = memo(() => {
    const { navigate } = useAppNavigation()

    const onPressAllPlans = () => {
        navigate('pricingLandingScreenId')
    }

    return (
        <CommonTouchable style={globalStyles.paddingVertical12} onPress={onPressAllPlans}>
            <AppText
                textAlign="center"
                adaptiveSize
                font="f15w600"
                style={styles.underLineText}
                rawText={translate('native.viewAllPlans')}
            />
        </CommonTouchable>
    )
})
