import { JSX, memo } from 'react'
import {
    ImageStyle,
    LayoutChangeEvent,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native'

import { colors, layoutHelpers, useAppSafeArea } from '@mu-native/ds'
import { AnimatedCloseIcon, RestoreButtonComponent } from '@mu-native/marketing'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 0,
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(10),
        maxWidth: '100%',
        alignSelf: 'center',
        alignItems: 'center',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(8),
    },
})

type TTourTopComponentProps = {
    rightTitle?: string
    onLeftPress: () => void
    renderRightComponent?: () => JSX.Element
    testID?: string
    style?: ViewStyle
    customBgImageStyle?: StyleProp<ViewStyle>
    backgroundColorIcon?: string
    customIconColorStyle?: StyleProp<ImageStyle>
    onLayout?: (event: LayoutChangeEvent) => void
}
const TourTopComponent = ({
    rightTitle,
    onLeftPress,
    style,
    renderRightComponent,
    testID,
    customBgImageStyle,
    backgroundColorIcon,
    customIconColorStyle,
    onLayout,
}: TTourTopComponentProps) => {
    const { top } = useAppSafeArea({ top: layoutHelpers.getResponsiveSizeExtended(20) })

    return (
        <View style={[styles.container, { marginTop: top }, style]} onLayout={onLayout}>
            <TouchableOpacity testID={testID} onPress={onLeftPress}>
                <AnimatedCloseIcon
                    iconStartOpacity={0}
                    animationDuration={2000}
                    isHidded={false}
                    backgroundFinishOpacity={1}
                    customIconColorStyle={customIconColorStyle}
                    customBgImageStyle={customBgImageStyle}
                    backgroundColor={backgroundColorIcon || colors.animatedIconBg}
                />
            </TouchableOpacity>

            {!!renderRightComponent && renderRightComponent()}
            {!!rightTitle && <RestoreButtonComponent color="backgroundDefault" />}
        </View>
    )
}

export default memo(TourTopComponent)
