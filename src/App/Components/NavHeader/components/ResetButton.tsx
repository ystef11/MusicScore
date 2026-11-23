import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppText, CommonTouchable, layout, layoutHelpers, style } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const styles = StyleSheet.create({
    resetText: style.text({
        paddingRight: layoutHelpers.getResponsiveSizeExtended(layout.marginXs),
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
    }),
})

type TResetButton = {
    onResetPress: () => void
}
const ResetButton = ({ onResetPress }: TResetButton) => (
    <CommonTouchable onPress={onResetPress}>
        <AppText brandColor="contentPrimary" style={styles.resetText}>
            {translate('native.filter.actions.reset')}
        </AppText>
    </CommonTouchable>
)

export default memo(ResetButton)
