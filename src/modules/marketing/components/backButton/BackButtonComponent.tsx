import { memo } from 'react'
import {
    Image,
    ImageStyle,
    LayoutChangeEvent,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native'

import { layout, useAppSafeArea, type BrandThemeColorKey, colors, icons } from '@mu-native/ds'
import { useAppNavigation } from '@mu-native/navigation'

import { RestoreButtonComponent } from '../restoreButton/RestoreButtonComponent'

const styles = StyleSheet.create({
    backButtonContainer: {
        position: 'absolute',
        zIndex: 10000,
        alignSelf: 'center',
        padding: layout.marginMd,
        left: 0,
        width: '100%',
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        top: 0,
    },
    arrowBack: {
        width: 24,
        height: 24,
        tintColor: colors.grayBackArrow,
    },
})

type TBackButtonComponent = {
    restoreTextColor?: BrandThemeColorKey
    containerStyle?: ViewStyle
    isShowRestoreButton?: boolean
    goBackCallback?: () => void
    isNeedToGoBack?: boolean
    isBackIcon?: boolean
    iconStyle?: StyleProp<ImageStyle>
    closeTestID?: string
    onLayout?: (event: LayoutChangeEvent) => void
}
const BackButtonComponent = ({
    restoreTextColor = 'contentPrimary',
    containerStyle = {},
    isShowRestoreButton = true,
    goBackCallback,
    isNeedToGoBack = true,
    isBackIcon = false,
    iconStyle,
    closeTestID,
    onLayout,
}: TBackButtonComponent) => {
    const { goBack } = useAppNavigation()
    const { top } = useAppSafeArea({ top: 20 })

    const flattenStyleButtonContainer = StyleSheet.flatten([
        styles.backButtonContainer,
        { marginTop: top },
        containerStyle,
    ])

    const onCloseScreen = () => {
        if (isNeedToGoBack) goBack()
        goBackCallback?.()
    }

    return (
        <View style={flattenStyleButtonContainer} onLayout={onLayout}>
            <TouchableOpacity
                onPress={onCloseScreen}
                testID={closeTestID}
                accessible={!!closeTestID}
            >
                <Image
                    source={isBackIcon ? icons.iosBackIcon : icons.closeMd}
                    style={[styles.arrowBack, iconStyle]}
                />
            </TouchableOpacity>
            {isShowRestoreButton && <RestoreButtonComponent color={restoreTextColor} />}
        </View>
    )
}

export default memo(BackButtonComponent)
