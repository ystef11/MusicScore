import { memo } from 'react'
import { ImageStyle, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'

import { type BrandThemeColorKey, layoutHelpers, useSafeAreaInsets } from '@mu-native/ds'

import AnimatedCloseIcon from '../animatedCloseIcon/AnimatedCloseIconComponent'
import { RestoreButtonComponent } from '../restoreButton/RestoreButtonComponent'

const closeIconBackgroundSize = layoutHelpers.isSmallScreenDevice ? 28 : 32

const styles = StyleSheet.create({
    backButtonContainer: {
        position: 'absolute',
        zIndex: 10000,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center',
    },
    closeIconContainer: {
        width: closeIconBackgroundSize,
        height: closeIconBackgroundSize,
        marginLeft: 0,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    absolutePosition: {
        position: 'absolute',
        left: layoutHelpers.getResponsiveSizeExtended(10),
        zIndex: 10,
        borderRadius: 50,
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
})

type TPaymentLayerCloseBlockComponentProps = {
    onClose: () => void
    closeIconBgStyle?: StyleProp<ViewStyle>
    closeIconStyle?: StyleProp<ImageStyle>
    isShowRestore?: boolean
    containerStyle?: StyleProp<ViewStyle>
    closeIconContainerStyle?: StyleProp<ViewStyle>
    colorRestoreButton?: BrandThemeColorKey
    isAbsolutePosition?: boolean
    isArrowIcon?: boolean
}
const PaymentLayerCloseBlockComponent = ({
    onClose,
    closeIconBgStyle,
    closeIconStyle,
    isShowRestore = false,
    containerStyle,
    closeIconContainerStyle,
    colorRestoreButton = 'contentInactive',
    isAbsolutePosition = false,
    isArrowIcon = false,
}: TPaymentLayerCloseBlockComponentProps) => {
    const insets = useSafeAreaInsets()

    return (
        <View
            style={[
                styles.backButtonContainer,
                { top: insets.top || 20 },
                isAbsolutePosition && styles.absolutePosition,
                !!containerStyle && containerStyle,
            ]}
        >
            <TouchableOpacity onPress={onClose} testID="close-payment-button">
                <View style={styles.closeIconContainer}>
                    <AnimatedCloseIcon
                        iconStartOpacity={0}
                        isHidded={false}
                        isArrowIcon={isArrowIcon}
                        backgroundFinishOpacity={1}
                        customBgImageStyle={closeIconBgStyle}
                        customIconStyle={closeIconStyle}
                        customIconColorStyle={closeIconStyle}
                        closeIconContainerStyle={closeIconContainerStyle}
                    />
                </View>
            </TouchableOpacity>
            {isShowRestore && <RestoreButtonComponent color={colorRestoreButton} />}
        </View>
    )
}

export default memo(PaymentLayerCloseBlockComponent)
