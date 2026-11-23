import { memo } from 'react'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'

import { platform } from '@mu-native/common'
import { Switch, colors, layout, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const styles = StyleSheet.create({
    switcherContainer: {
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'center',
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(14),
        paddingHorizontal:
            platform.isIos && platform.majorVersionIOS >= 26
                ? layoutHelpers.getResponsiveSizeExtended(12)
                : 0,
    },
    scoreTitle: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(14),
        fontWeight: '600',
        maxWidth: '80%',
    },
})

type TScoresSwitcherProps = {
    isActiveOffScores: boolean
    changeSubscriptions: () => void
    colorText?: string
    activeColor?: string
    backgroundColor?: string
    customTitle?: string
    styleContainer?: StyleProp<ViewStyle>
}

const PlanSwitcher = ({
    isActiveOffScores,
    colorText = colors.white,
    changeSubscriptions,
    activeColor,
    backgroundColor,
    customTitle,
    styleContainer,
}: TScoresSwitcherProps) => {
    return (
        <View style={[styles.switcherContainer, styleContainer]}>
            <Text style={[styles.scoreTitle, { color: colorText }]} numberOfLines={3}>
                {customTitle || translate('native.screen_tour.switcher_title')}
            </Text>
            <Switch
                size="s"
                value={isActiveOffScores}
                onValueChange={changeSubscriptions}
                trackColorOn={activeColor}
                trackColorOff={backgroundColor}
            />
        </View>
    )
}

export default memo(PlanSwitcher)
